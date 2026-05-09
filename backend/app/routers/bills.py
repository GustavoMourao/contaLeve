from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Bill
from app.schemas import UploadBillResponse, BillResponse
from app.services.bill_parser import parse_bill

router = APIRouter(prefix="/upload-bill", tags=["bills"])

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".tiff", ".bmp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("", response_model=UploadBillResponse)
async def upload_bill(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Upload an electricity bill (PDF or image) and receive parsed data.
    Returns extraction confidence and method for transparency.
    """
    import os

    _, ext = os.path.splitext(file.filename or "")
    if ext.lower() not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=422,
            detail=f"Unsupported file type '{ext}'. Allowed: {ALLOWED_EXTENSIONS}",
        )

    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large (max 10 MB).")

    parsed = parse_bill(file_bytes, file.filename or "bill.pdf")

    # Check if we got actual values or if parsing failed
    if parsed["monthly_kwh"] is None or parsed["total_cost"] is None:
        raise HTTPException(
            status_code=422,
            detail="Could not extract consumption or cost from bill. Please verify the bill format and try again.",
        )

    db_bill = Bill(
        monthly_kwh=parsed["monthly_kwh"],
        tariff=parsed.get("tariff"),
        total_cost=parsed["total_cost"],
        consumer_unit=parsed.get("consumer_unit"),
        utility=parsed.get("utility"),
        raw_text=parsed.get("raw_text"),
    )
    db.add(db_bill)
    db.commit()
    db.refresh(db_bill)

    # Build extraction notes for transparency
    extraction_notes = f"Consumption extracted via: {parsed['kwh_extraction_method']}. Cost extracted via: {parsed['cost_extraction_method']}."

    return UploadBillResponse(
        bill=BillResponse.model_validate(db_bill),
        message="Bill parsed successfully",
        kwh_extraction_method=parsed["kwh_extraction_method"],
        cost_extraction_method=parsed["cost_extraction_method"],
        kwh_confidence=parsed["kwh_confidence"],
        cost_confidence=parsed["cost_confidence"],
        extraction_notes=extraction_notes,
    )
