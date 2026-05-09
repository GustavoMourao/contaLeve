"""
Bill Parser Service
Extracts structured energy data from uploaded PDF or image bills.
Primary: pdfplumber
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
            return "\n".join(page.extract_text() or "" for page in pdf.pages)
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
    Celesc/other bills format: looks for patterns in tables and text.
    
    Returns: (value, extraction_method)
      extraction_method: "total_apurado", "table_row", "generic_kwh", or "not_found"
    """
    # Priority 1: "Total Apurado" - exact match (from other bills)
    pattern_total_apurado = r"total\s+apurado[:\s]+(\d{1,5}[.,]?\d{0,3})\s*(?:kWh|kwh)"
    match = re.search(pattern_total_apurado, text, re.IGNORECASE)
    if match:
        raw = match.group(1).replace(",", ".")
        try:
            return float(raw), "total_apurado"
        except ValueError:
            pass

    # Priority 2: Table row with "Total Apurado" label (Celesc format)
    # Pattern: looks for row with "Total Apurado" in leftmost column, then captures number
    pattern_celesc_table = r"Total\s+Apurado\s+(\d{1,5})\s*(?:\||$|\n)"
    match = re.search(pattern_celesc_table, text, re.IGNORECASE)
    if match:
        try:
            return float(match.group(1)), "table_row"
        except ValueError:
            pass

    # Priority 3: Look for patterns like "13.837" or similar in consumption context
    pattern_consumo = r"(?:consumo|energia)[:\s]+(\d{1,5}[.,]?\d{0,3})\s*(?:kWh|kwh)"
    match = re.search(pattern_consumo, text, re.IGNORECASE)
    if match:
        raw = match.group(1).replace(",", ".")
        try:
            return float(raw), "consumo"
        except ValueError:
            pass

    # Priority 4: Generic kWh pattern
    pattern_generic = r"(\d{1,5}[.,]?\d{0,3})\s*kWh"
    match = re.search(pattern_generic, text, re.IGNORECASE)
    if match:
        raw = match.group(1).replace(",", ".")
        try:
            return float(raw), "generic_kwh"
        except ValueError:
            pass

    return None, "not_found"


def _parse_total_cost(text: str) -> tuple[Optional[float], str]:
    """
    Find total cost (R$) inside extracted text.
    
    Returns: (value, extraction_method)
    """
    patterns = [
        (r"total\s+a\s+pagar[:\s]+R?\$?\s*(\d{1,5}[.,]\d{2})", "total_pagar"),
        (r"valor\s+total[:\s]+R?\$?\s*(\d{1,5}[.,]\d{2})", "valor_total"),
        (r"custo\s+atual[:\s]+R?\$?\s*(\d{1,5}[.,]\d{2})", "custo_atual"),
        (r"TOTAL\s+(\d{1,5}[.,]\d{2})(?:\s|$|LEGENDA)", "celesc_total"),  # Celesc format
    ]
    
    for pattern, method in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            raw = match.group(1).replace(".", "").replace(",", ".")
            try:
                return float(raw), method
            except ValueError:
                continue
    
    return None, "not_found"


def _parse_consumer_unit(text: str) -> Optional[str]:
    patterns = [
        r"unidade\s+consumidora[:\s]+(\d{5,12})",
        r"UC[:\s]+(\d{5,12})",
        r"n[uú]mero\s+de\s+instala[cç][aã]o[:\s]+(\d{5,12})",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1)
    return None


def _parse_utility(text: str) -> Optional[str]:
    known_utilities = [
        "Celesc", "Cemig", "Copel", "CPFL", "Enel", "Light",
        "Coelba", "Cosern", "Celpe", "Energisa", "EDP", "Elektro",
    ]
    for utility in known_utilities:
        if re.search(utility, text, re.IGNORECASE):
            return utility
    return None


def _parse_tariff(text: str) -> Optional[float]:
    patterns = [
        r"tarifa[:\s]+R?\$?\s*(\d+[.,]\d+)",
        r"pre[cç]o[:\s]+R?\$?\s*(\d+[.,]\d+)",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            raw = match.group(1).replace(",", ".")
            try:
                return float(raw)
            except ValueError:
                continue
    return None


def parse_bill(file_bytes: bytes, filename: str) -> dict:
    """
    Parse an electricity bill file (PDF or image).

    Returns a dict with:
        consumer_unit, monthly_kwh, tariff, total_cost, utility, raw_text,
        kwh_extraction_method, cost_extraction_method
    """
    filename_lower = filename.lower()

    if filename_lower.endswith(".pdf"):
        text = _extract_text_from_pdf(file_bytes)
        if not text.strip():
            # Try OCR fallback via PyMuPDF → image → Tesseract
            text = _extract_text_via_pymupdf_ocr(file_bytes)
    else:
        text = _extract_text_from_image(file_bytes)

    monthly_kwh, kwh_method = _parse_kwh(text)
    total_cost, cost_method = _parse_total_cost(text)
    consumer_unit = _parse_consumer_unit(text)
    utility = _parse_utility(text)
    tariff = _parse_tariff(text)

    # Track extraction quality
    kwh_confidence = "high" if kwh_method in ["total_apurado", "consumo", "table_row"] else "low"
    cost_confidence = "high" if cost_method in ["total_pagar", "custo_atual", "celesc_total"] else "low"

    if monthly_kwh is None:
        logger.warning("Could not parse kWh from bill – could not extract consumption")
        kwh_confidence = "not_found"

    if total_cost is None:
        logger.warning("Could not parse total cost from bill")
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
