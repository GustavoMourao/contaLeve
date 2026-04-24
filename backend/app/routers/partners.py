from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Partner
from app.schemas import PartnerResponse

router = APIRouter(prefix="/partners", tags=["partners"])


@router.get("", response_model=list[PartnerResponse])
def list_partners(db: Session = Depends(get_db)):
    return db.query(Partner).filter(Partner.active == True).order_by(Partner.name).all()
