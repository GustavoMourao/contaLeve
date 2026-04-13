from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import SupplierResponse
from app.services.supplier_engine import get_all_suppliers

router = APIRouter(prefix="/suppliers", tags=["suppliers"])


@router.get("", response_model=list[SupplierResponse])
def list_suppliers(db: Session = Depends(get_db)):
    """Return all available energy suppliers."""
    suppliers = get_all_suppliers(db)
    return [SupplierResponse.model_validate(s) for s in suppliers]
