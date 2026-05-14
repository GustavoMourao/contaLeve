"""
Bill Parser Service
Extracts structured energy data from uploaded PDF or image bills.
Primary: pdfplumber (handles tables better)
Fallback: Tesseract OCR
"""
import re
import io
import logging
from typing import Optional

logger = logging.getLogger(__name__)


def _extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract raw text from a PDF file using pdfplumber."""
    try:
        import pdfplumber
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            text_parts = []
            for page_num, page in enumerate(pdf.pages):
                # Extract regular text
                page_text = page.extract_text() or ""
                text_parts.append(page_text)
                
                # Also try table extraction
                try:
                    tables = page.extract_tables()
                    if tables:
                        for table in tables:
                            for row in table:
                                # Join row cells with space, preserving all content
                                row_text = " ".join(str(cell).strip() if cell else "" for cell in row)
                                if row_text.strip():
                                    text_parts.append(row_text)
                except Exception as e:
                    logger.debug(f"Table extraction failed for page {page_num}: {e}")
            
            full_text = "\n".join(text_parts)
            logger.info(f"PDF extraction complete. Total text length: {len(full_text)}")
            # Log first 1000 chars for debugging
            logger.debug(f"Extracted text:\n{full_text[:1000]}")
            return full_text
    except Exception as exc:
        logger.warning(f"pdfplumber extraction failed: {exc}")
        return ""


def _extract_text_from_image(file_bytes: bytes) -> str:
    """Extract text from an image using Tesseract OCR."""
    try:
        import pytesseract
        from PIL import Image
        image = Image.open(io.BytesIO(file_bytes))
        return pytesseract.image_to_string(image, lang="por")
    except Exception as exc:
        logger.warning("Tesseract OCR failed: %s", exc)
        return ""


def _extract_all_numbers(text: str) -> dict:
    """
    Extract all potentially important numbers from bill.
    Returns dict with all found values and their context.
    """
    results = {
        "kwh_values": [],
        "cost_values": [],
        "other_numbers": [],
    }
    
    if not text:
        return results
    
    # Find all numbers followed by kWh
    kwh_pattern = r"(\d{1,5}[.,]?\d{0,3})\s*(?:kWh|KWH|kwh)"
    for match in re.finditer(kwh_pattern, text, re.IGNORECASE):
        value = match.group(1).replace(",", ".")
        try:
            results["kwh_values"].append({
                "value": float(value),
                "raw": match.group(0),
                "context": text[max(0, match.start()-50):min(len(text), match.end()+50)]
            })
        except ValueError:
            pass
    
    # Find all R$ amounts
    reais_pattern = r"R\$\s*(\d{1,5}[.,]\d{2})"
    for match in re.finditer(reais_pattern, text):
        value = match.group(1).replace(".", "").replace(",", ".")
        try:
            results["cost_values"].append({
                "value": float(value),
                "raw": match.group(0),
                "context": text[max(0, match.start()-50):min(len(text), match.end()+50)]
            })
        except ValueError:
            pass
    
    # Find all 3-5 digit numbers as potential consumption/values
    all_numbers = re.finditer(r"\b(\d{2,6})\b", text)
    for match in all_numbers:
        num = int(match.group(1))
        if 50 < num < 9999:  # Reasonable consumption range
            context = text[max(0, match.start()-50):min(len(text), match.end()+50)]
            # Don't duplicate if already found in other categories
            if not any(str(num) in str(kv["value"]) for kv in results["kwh_values"]):
                results["other_numbers"].append({
                    "value": num,
                    "context": context
                })
    
    logger.info(f"Found {len(results['kwh_values'])} kWh values, {len(results['cost_values'])} cost values")
    return results


def _parse_kwh(text: str) -> tuple[Optional[float], str, str]:
    """
    Find consumption in kWh inside extracted text.
    
    Returns: (value, extraction_method, confidence_reason)
    """
    if not text:
        return None, "empty_text", "Text is empty"
    
    # Priority 1: "Total Apurado" or "Apurado"
    patterns_apurado = [
        r"Total\s+Apurado[:\s|]+(\d{2,4})",
        r"(?:Total|TOTAL)\s+(?:Apurado|APURADO)[:\s|]*(\d{2,4})",
        r"Apurado[:\s|]+(\d{2,4})",
    ]
    
    for pattern in patterns_apurado:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            try:
                value = float(match.group(1))
                if 0 < value < 10000:
                    logger.info(f"✓ Found kWh via 'Apurado' pattern: {value}")
                    return value, "total_apurado", f"Found in 'Total Apurado' field"
            except ValueError:
                pass

    # Priority 2: Look for "Consumo" or "Energia" labels
    patterns_consumo = [
        r"(?:Consumo|CONSUMO)[:\s]+(\d{1,5}[.,]?\d{0,3})",
        r"(?:Energia|ENERGIA)\s+El[eé]trica[:\s]+(\d{1,5}[.,]?\d{0,3})",
    ]
    for pattern in patterns_consumo:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            try:
                raw = match.group(1).replace(",", ".")
                value = float(raw)
                if 0 < value < 10000:
                    return value, "consumo", "Found in 'Consumo' field"
            except ValueError:
                pass

    # Priority 3: Generic kWh pattern
    pattern_generic = r"(\d{1,5}[.,]?\d{0,3})\s*kWh"
    match = re.search(pattern_generic, text, re.IGNORECASE)
    if match:
        try:
            raw = match.group(1).replace(",", ".")
            value = float(raw)
            if 0 < value < 10000:
                return value, "generic_kwh", "Found as generic kWh value"
        except ValueError:
            pass

    logger.warning("No kWh pattern matched")
    return None, "not_found", "Could not extract consumption value from bill"


def _parse_total_cost(text: str) -> tuple[Optional[float], str, str]:
    """
    Find total cost (R$) inside extracted text.
    
    Returns: (value, extraction_method, confidence_reason)
    """
    if not text:
        return None, "empty_text", "Text is empty"
    
    patterns = [
        (r"(?:TOTAL|Total)\s+A\s+PAGAR[:\s]+R?\$?\s*(\d{1,5}[.,]\d{2})", "total_pagar", "Found in 'Total a Pagar' field"),
        (r"(?:VALOR|Valor)\s+TOTAL[:\s]+R?\$?\s*(\d{1,5}[.,]\d{2})", "valor_total", "Found in 'Valor Total' field"),
        (r"(?:Custo|CUSTO)\s+(?:Atual|ATUAL)[:\s]+R?\$?\s*(\d{1,5}[.,]\d{2})", "custo_atual", "Found in 'Custo Atual' field"),
        (r"(?:^|\n)\s*(?:TOTAL|Total)\s+(\d{1,5}[.,]\d{2})(?:\s|$)", "celesc_total", "Found in bottom 'TOTAL' field"),
        (r"R\$\s*(\d{1,5}[.,]\d{2})", "generic_reais", "Found as generic R$ amount"),
    ]
    
    for pattern, method, reason in patterns:
        match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
        if match:
            try:
                raw = match.group(1).replace(".", "").replace(",", ".")
                value = float(raw)
                if 0 < value < 100000:
                    logger.info(f"✓ Found cost via {method}: {value}")
                    return value, method, reason
            except ValueError:
                pass
    
    logger.warning("No cost pattern matched")
    return None, "not_found", "Could not extract total cost from bill"


def _parse_consumer_unit(text: str) -> Optional[str]:
    """Extract consumer unit/UC from bill."""
    patterns = [
        r"(?:UNIDADE|Unidade)\s+(?:CONSUMIDORA|Consumidora)[:\s]+(\d{5,12})",
        r"UC[:\s]+(\d{5,12})",
        r"(?:N[ÚU]MERO|Número)\s+DE\s+(?:INSTALA[CÇ][AÃ]O|Instalação)[:\s]+(\d{5,12})",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1)
    return None


def _parse_utility(text: str) -> Optional[str]:
    """Identify utility company from bill."""
    known_utilities = [
        "Celesc", "Cemig", "Copel", "CPFL", "Enel", "Light",
        "Coelba", "Cosern", "Celpe", "Energisa", "EDP", "Elektro",
    ]
    for utility in known_utilities:
        if re.search(utility, text, re.IGNORECASE):
            return utility
    return None


def _parse_tariff(text: str) -> Optional[float]:
    """Extract tariff/price per kWh."""
    patterns = [
        r"(?:TARIFA|Tarifa)[:\s]+R?\$?\s*(\d+[.,]\d+)",
        r"(?:PRE[CÇ]O|Preço)[:\s]+R?\$?\s*(\d+[.,]\d+)",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            try:
                raw = match.group(1).replace(",", ".")
                return float(raw)
            except ValueError:
                continue
    return None


def _method_to_confidence(method: str) -> float:
    """Map extraction method name to a confidence score between 0.0 and 1.0."""
    HIGH = {"total_apurado", "total_pagar", "valor_total"}
    MEDIUM = {"consumo", "custo_atual", "celesc_total", "generic_kwh"}
    LOW = {"generic_reais"}
    if method in HIGH:
        return 0.95
    if method in MEDIUM:
        return 0.70
    if method in LOW:
        return 0.45
    return 0.0  # not_found / empty_text


def build_field_map(parsed: dict) -> dict:
    """
    Convert the flat parsed dict into a structured per-field map.
    Each field carries: value, status, confidence, hint.
    Used by the new /bills/parse endpoint.
    """
    from app.schemas import ExtractedField  # local import avoids circular deps

    def _field(value, method: str, missing_hint: str) -> ExtractedField:
        conf = _method_to_confidence(method)
        if value is None or method in ("not_found", "empty_text"):
            return ExtractedField(
                value=None,
                status="missing",
                confidence=0.0,
                hint=missing_hint,
            )
        if conf < 0.5:
            return ExtractedField(
                value=str(value),
                status="uncertain",
                confidence=conf,
                hint="Valor encontrado, mas com baixa confiança — por favor confirme.",
            )
        return ExtractedField(
            value=str(value),
            status="extracted",
            confidence=conf,
            hint=None,
        )

    kwh_method = parsed.get("kwh_extraction_method", "not_found")
    cost_method = parsed.get("cost_extraction_method", "not_found")

    return {
        "utility": _field(
            parsed.get("utility"),
            "total_apurado" if parsed.get("utility") else "not_found",
            "Não foi possível identificar a distribuidora. Digite o nome (ex: Celesc, Enel…).",
        ),
        "consumer_unit": _field(
            parsed.get("consumer_unit"),
            "total_apurado" if parsed.get("consumer_unit") else "not_found",
            "Número da UC não encontrado — opcional.",
        ),
        "monthly_kwh": _field(
            parsed.get("monthly_kwh"),
            kwh_method,
            "Informe o valor da coluna 'Total Apurado' ou 'Consumo' na sua conta.",
        ),
        "total_cost": _field(
            parsed.get("total_cost"),
            cost_method,
            "Informe o 'Total a Pagar' da sua conta.",
        ),
        "tariff": _field(
            parsed.get("tariff"),
            "total_apurado" if parsed.get("tariff") else "not_found",
            "Tarifa opcional — deixe em branco se não souber.",
        ),
    }


def parse_bill(file_bytes: bytes, filename: str) -> dict:
    """
    Parse an electricity bill file (PDF or image).

    Returns a rich dict with per-field extraction method + confidence.
    Callers must handle None values for monthly_kwh and total_cost gracefully.
    """
    filename_lower = filename.lower()

    logger.info(f"Parsing bill: {filename}")

    if filename_lower.endswith(".pdf"):
        text = _extract_text_from_pdf(file_bytes)
        if not text.strip():
            logger.info("PDF text extraction was empty, trying OCR fallback...")
            text = _extract_text_via_pymupdf_ocr(file_bytes)
    else:
        text = _extract_text_from_image(file_bytes)

    logger.info(f"Total extracted text: {len(text)} characters")
    if text:
        logger.debug(f"Text sample:\n{text[:1000]}")

    monthly_kwh, kwh_method, kwh_reason = _parse_kwh(text)
    total_cost, cost_method, cost_reason = _parse_total_cost(text)
    consumer_unit = _parse_consumer_unit(text)
    utility = _parse_utility(text)
    tariff = _parse_tariff(text)

    all_numbers = _extract_all_numbers(text)

    logger.info(
        f"Extraction: kWh={monthly_kwh} ({kwh_method}/{kwh_reason}), "
        f"Cost={total_cost} ({cost_method}/{cost_reason})"
    )

    return {
        "consumer_unit": consumer_unit,
        "monthly_kwh": monthly_kwh,
        "tariff": tariff,
        "total_cost": total_cost,
        "utility": utility,
        "raw_text": text[:2000] if text else None,
        "kwh_extraction_method": kwh_method,
        "cost_extraction_method": cost_method,
        "kwh_reason": kwh_reason,
        "cost_reason": cost_reason,
        "all_extracted_values": all_numbers,
        "extraction_success": monthly_kwh is not None and total_cost is not None,
    }


def _extract_text_via_pymupdf_ocr(file_bytes: bytes) -> str:
    """Render each PDF page to an image then run Tesseract OCR."""
    try:
        import fitz  # PyMuPDF
        import pytesseract
        from PIL import Image

        doc = fitz.open(stream=file_bytes, filetype="pdf")
        pages_text = []
        for page in doc:
            pix = page.get_pixmap(dpi=150)
            img = Image.open(io.BytesIO(pix.tobytes("png")))
            pages_text.append(pytesseract.image_to_string(img, lang="por"))
        return "\n".join(pages_text)
    except Exception as exc:
        logger.warning("PyMuPDF OCR fallback failed: %s", exc)
        return ""
