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
            for page in pdf.pages:
                # Extract regular text
                page_text = page.extract_text() or ""
                text_parts.append(page_text)
                
                # Extract tables as text for better parsing
                tables = page.extract_tables()
                if tables:
                    for table in tables:
                        for row in table:
                            # Join row cells with space
                            row_text = " ".join(str(cell) if cell else "" for cell in row)
                            text_parts.append(row_text)
            
            return "\n".join(text_parts)
    except Exception as exc:
        logger.warning("pdfplumber failed: %s", exc)
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


def _parse_kwh(text: str) -> tuple[Optional[float], str]:
    """
    Find consumption in kWh inside extracted text.
    Handles Celesc and other Brazilian utility formats.
    
    Returns: (value, extraction_method)
    """
    # Priority 1: "Total Apurado" with value (from table or text)
    # Matches patterns like "Total Apurado 138" or "Total Apurado: 138"
    patterns_apurado = [
        r"Total\s+Apurado[:\s]+(\d{1,5})\s*(?:kWh|$|\n|\||Tributo)",
        r"Total\s+Apurado\s+(\d{1,5})(?:\s|$|\n|\|)",
        r"Apurado\s+(\d{1,5})\s*(?:kWh|$)",
    ]
    for pattern in patterns_apurado:
        match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
        if match:
            try:
                value = float(match.group(1))
                # Validate reasonable range (0-9999 kWh)
                if 0 < value < 10000:
                    logger.info(f"Extracted kWh via pattern: {pattern} -> {value}")
                    return value, "total_apurado"
            except (ValueError, AttributeError):
                pass

    # Priority 2: Look for "Consumo" or "Energia" labels
    patterns_consumo = [
        r"Consumo[:\s]+(\d{1,5}[.,]?\d{0,3})\s*(?:kWh)?",
        r"Energia\s+El[eé]trica[:\s]+(\d{1,5}[.,]?\d{0,3})\s*(?:kWh)?",
    ]
    for pattern in patterns_consumo:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            try:
                raw = match.group(1).replace(",", ".")
                value = float(raw)
                if 0 < value < 10000:
                    return value, "consumo"
            except (ValueError, AttributeError):
                pass

    # Priority 3: Generic kWh pattern
    pattern_generic = r"(\d{1,5}[.,]?\d{0,3})\s*kWh"
    match = re.search(pattern_generic, text, re.IGNORECASE)
    if match:
        try:
            raw = match.group(1).replace(",", ".")
            value = float(raw)
            if 0 < value < 10000:
                return value, "generic_kwh"
        except ValueError:
            pass

    return None, "not_found"


def _parse_total_cost(text: str) -> tuple[Optional[float], str]:
    """
    Find total cost (R$) inside extracted text.
    Handles various Brazilian utility bill formats.
    
    Returns: (value, extraction_method)
    """
    patterns = [
        # Standard patterns
        (r"TOTAL\s+A\s+PAGAR[:\s]+R?\$?\s*(\d{1,5}[.,]\d{2})", "total_pagar"),
        (r"Total\s+a\s+Pagar[:\s]+R?\$?\s*(\d{1,5}[.,]\d{2})", "total_pagar"),
        (r"VALOR\s+TOTAL[:\s]+R?\$?\s*(\d{1,5}[.,]\d{2})", "valor_total"),
        (r"Custo\s+Atual[:\s]+R?\$?\s*(\d{1,5}[.,]\d{2})", "custo_atual"),
        
        # Celesc specific (bottom of bill)
        (r"(?:^|\n)TOTAL\s+(\d{1,5}[.,]\d{2})(?:\s|$|LEGENDA)", "celesc_total"),
        (r"(?:^|\n)TOTAL\s+(\d{1,5}[.,]\d{2})(?:\s|$)", "total_bottom"),
    ]
    
    for pattern, method in patterns:
        match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
        if match:
            try:
                raw = match.group(1).replace(".", "").replace(",", ".")
                value = float(raw)
                if 0 < value < 100000:  # Reasonable range
                    logger.info(f"Extracted cost via pattern: {method} -> {value}")
                    return value, method
            except (ValueError, AttributeError):
                pass
    
    return None, "not_found"


def _parse_consumer_unit(text: str) -> Optional[str]:
    """Extract consumer unit/UC from bill."""
    patterns = [
        r"(?:UNIDADE\s+)?CONSUMIDORA[:\s]+(\d{5,12})",
        r"UC[:\s]+(\d{5,12})",
        r"N[ÚU]MERO\s+DE\s+INSTALA[CÇ][AÃ]O[:\s]+(\d{5,12})",
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
        r"TARIFA[:\s]+R?\$?\s*(\d+[.,]\d+)",
        r"PRE[CÇ]O[:\s]+R?\$?\s*(\d+[.,]\d+)",
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


def parse_bill(file_bytes: bytes, filename: str) -> dict:
    """
    Parse an electricity bill file (PDF or image).

    Returns a dict with:
        consumer_unit, monthly_kwh, tariff, total_cost, utility, raw_text,
        kwh_extraction_method, cost_extraction_method, confidence levels
    """
    filename_lower = filename.lower()

    if filename_lower.endswith(".pdf"):
        text = _extract_text_from_pdf(file_bytes)
        if not text.strip():
            # Try OCR fallback
            logger.info("PDF text extraction was empty, trying OCR fallback...")
            text = _extract_text_via_pymupdf_ocr(file_bytes)
    else:
        text = _extract_text_from_image(file_bytes)

    # Debug: log extracted text length
    logger.info(f"Extracted text length: {len(text) if text else 0} characters")

    monthly_kwh, kwh_method = _parse_kwh(text)
    total_cost, cost_method = _parse_total_cost(text)
    consumer_unit = _parse_consumer_unit(text)
    utility = _parse_utility(text)
    tariff = _parse_tariff(text)

    # Track extraction quality
    kwh_confidence = "high" if kwh_method in ["total_apurado", "consumo"] else "low"
    cost_confidence = "high" if cost_method in ["total_pagar", "custo_atual", "celesc_total"] else "low"

    if monthly_kwh is None:
        logger.warning(f"Could not parse kWh from bill (method: {kwh_method})")
        kwh_confidence = "not_found"

    if total_cost is None:
        logger.warning(f"Could not parse total cost from bill (method: {cost_method})")
        cost_confidence = "not_found"

    return {
        "consumer_unit": consumer_unit,
        "monthly_kwh": monthly_kwh,
        "tariff": tariff,
        "total_cost": total_cost,
        "utility": utility,
        "raw_text": text[:2000] if text else None,
        "kwh_extraction_method": kwh_method,
        "cost_extraction_method": cost_method,
        "kwh_confidence": kwh_confidence,
        "cost_confidence": cost_confidence,
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
