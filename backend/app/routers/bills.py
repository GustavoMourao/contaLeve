from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
import os

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
    
    Now accepts partial data - if consumption or cost cannot be extracted,
    shows user-friendly message instead of rejecting the upload.
    """
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

    # Extract values - now we allow partial data
    monthly_kwh = parsed.get("monthly_kwh")
    total_cost = parsed.get("total_cost")
    
    # Use defaults if parsing failed, with notes about what wasn't extracted
    extraction_notes = []
    if monthly_kwh is None:
        extraction_notes.append(f"❌ Consumo: {parsed.get('kwh_reason', 'Não foi possível extrair')}")
        monthly_kwh = 0.0
    else:
        extraction_notes.append(f"✓ Consumo: {monthly_kwh} kWh - {parsed.get('kwh_reason')}")
    
    if total_cost is None:
        extraction_notes.append(f"❌ Custo: {parsed.get('cost_reason', 'Não foi possível extrair')}")
        total_cost = 0.0
    else:
        extraction_notes.append(f"✓ Custo: R$ {total_cost:.2f} - {parsed.get('cost_reason')}")

    # Create bill record even with partial data
    db_bill = Bill(
        monthly_kwh=monthly_kwh,
        tariff=parsed.get("tariff"),
        total_cost=total_cost,
        consumer_unit=parsed.get("consumer_unit"),
        utility=parsed.get("utility"),
        raw_text=parsed.get("raw_text"),
    )
    db.add(db_bill)
    db.commit()
    db.refresh(db_bill)

    # Prepare response message
    if parsed.get("extraction_success"):
        message = "Conta processada com sucesso!"
        status = "success"
    else:
        message = "Conta processada, mas alguns dados não foram extraídos. Contate-nos para verificação manual."
        status = "partial"

    return UploadBillResponse(
        bill=BillResponse.model_validate(db_bill),
        message=message,
        status=status,
        extraction_notes="\n".join(extraction_notes),
        kwh_extraction_method=parsed.get("kwh_extraction_method"),
        cost_extraction_method=parsed.get("cost_extraction_method"),
        kwh_confidence=parsed.get("kwh_extraction_method") if monthly_kwh > 0 else "not_found",
        cost_confidence=parsed.get("cost_extraction_method") if total_cost > 0 else "not_found",
    )
