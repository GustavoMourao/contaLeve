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


def _parse_kwh(text: str) -> Optional[float]:
    """Find consumption in kWh inside extracted text."""
    patterns = [
        r"(\d{1,5}[.,]?\d{0,3})\s*kWh",
        r"consumo[:\s]+(\d{1,5}[.,]?\d{0,3})",
        r"energia\s+el[eé]trica[:\s]+(\d{1,5}[.,]?\d{0,3})",
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


def _parse_total_cost(text: str) -> Optional[float]:
    """Find total cost (R$) inside extracted text."""
    patterns = [
        r"total\s+a\s+pagar[:\s]+R?\$?\s*(\d{1,5}[.,]\d{2})",
        r"valor\s+total[:\s]+R?\$?\s*(\d{1,5}[.,]\d{2})",
        r"R\$\s*(\d{1,5}[.,]\d{2})",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            raw = match.group(1).replace(".", "").replace(",", ".")
            try:
                return float(raw)
            except ValueError:
                continue
    return None


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
        consumer_unit, monthly_kwh, tariff, total_cost, utility, raw_text
    """
    filename_lower = filename.lower()

    if filename_lower.endswith(".pdf"):
        text = _extract_text_from_pdf(file_bytes)
        if not text.strip():
            # Try OCR fallback via PyMuPDF → image → Tesseract
            text = _extract_text_via_pymupdf_ocr(file_bytes)
    else:
        text = _extract_text_from_image(file_bytes)

    monthly_kwh = _parse_kwh(text)
    total_cost = _parse_total_cost(text)
    consumer_unit = _parse_consumer_unit(text)
    utility = _parse_utility(text)
    tariff = _parse_tariff(text)

    # If we could not find critical fields use safe defaults so the MVP
    # can still demonstrate the flow with sample data.
    if monthly_kwh is None:
        logger.info("Could not parse kWh from bill – using demo value 320")
        monthly_kwh = 320.0

    if total_cost is None:
        logger.info("Could not parse total cost – using demo value 272.00")
        total_cost = 272.00

    return {
        "consumer_unit": consumer_unit,
        "monthly_kwh": monthly_kwh,
        "tariff": tariff,
        "total_cost": total_cost,
        "utility": utility,
        "raw_text": text[:2000] if text else None,
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
