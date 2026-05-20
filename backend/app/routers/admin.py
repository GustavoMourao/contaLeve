"""
Admin-only routes.

Endpoints:
  POST /admin/login              → returns JWT access token
  POST /admin/change-password    → change password (requires token); clears must_change_password
  GET  /admin/stats              → lead statistics (protected)
  GET  /admin/leads              → full lead list (protected)
"""

import logging
from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import AdminUser, Lead, VoltageLevel

router = APIRouter(prefix="/admin", tags=["admin"])
logger = logging.getLogger(__name__)

# ── Crypto helpers ──────────────────────────────────────────────────────────
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/admin/login")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 8  # 8 hours


def hash_password(plain: str) -> str:
    return pwd_ctx.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_ctx.verify(plain, hashed)


def create_access_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


def get_current_admin(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db),
) -> AdminUser:
    credentials_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        username: str | None = payload.get("sub")
        if not username:
            raise credentials_exc
    except JWTError:
        raise credentials_exc

    admin = db.query(AdminUser).filter(AdminUser.username == username).first()
    if not admin:
        raise credentials_exc
    return admin


# ── Schemas ─────────────────────────────────────────────────────────────────
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    must_change_password: bool


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class VoltageStats(BaseModel):
    low: int
    medium: int
    high: int


class StateCount(BaseModel):
    state: str
    count: int


class LeadStats(BaseModel):
    total: int
    by_voltage: VoltageStats
    by_state: list[StateCount]


class LeadRow(BaseModel):
    id: int
    name: str
    email: str
    phone: str | None
    state: str | None
    city: str | None
    voltage_level: str
    monthly_kwh: float
    current_cost: float
    estimated_savings: float | None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# ── Endpoints ────────────────────────────────────────────────────────────────
@router.post("/login", response_model=TokenResponse)
def admin_login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db),
):
    admin = db.query(AdminUser).filter(AdminUser.username == form_data.username).first()
    if not admin or not verify_password(form_data.password, admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    token = create_access_token({"sub": admin.username})
    return TokenResponse(
        access_token=token,
        must_change_password=admin.must_change_password,
    )


@router.post("/change-password")
def change_password(
    body: ChangePasswordRequest,
    admin: Annotated[AdminUser, Depends(get_current_admin)],
    db: Session = Depends(get_db),
):
    if not verify_password(body.current_password, admin.hashed_password):
        raise HTTPException(status_code=400, detail="Senha atual incorreta.")
    if len(body.new_password) < 6:
        raise HTTPException(status_code=400, detail="A nova senha deve ter ao menos 6 caracteres.")
    admin.hashed_password = hash_password(body.new_password)
    admin.must_change_password = False
    db.commit()
    return {"detail": "Senha alterada com sucesso."}


@router.get("/stats", response_model=LeadStats)
def get_stats(
    admin: Annotated[AdminUser, Depends(get_current_admin)],
    db: Session = Depends(get_db),
):
    total = db.query(func.count(Lead.id)).scalar() or 0

    voltage_rows = (
        db.query(Lead.voltage_level, func.count(Lead.id))
        .group_by(Lead.voltage_level)
        .all()
    )
    voltage_map = {str(row[0].value if hasattr(row[0], "value") else row[0]): row[1] for row in voltage_rows}

    state_rows = (
        db.query(Lead.state, func.count(Lead.id))
        .filter(Lead.state.isnot(None))
        .group_by(Lead.state)
        .order_by(func.count(Lead.id).desc())
        .all()
    )

    return LeadStats(
        total=total,
        by_voltage=VoltageStats(
            low=voltage_map.get("low", 0),
            medium=voltage_map.get("medium", 0),
            high=voltage_map.get("high", 0),
        ),
        by_state=[StateCount(state=r[0] or "—", count=r[1]) for r in state_rows],
    )


@router.get("/leads", response_model=list[LeadRow])
def list_leads_admin(
    admin: Annotated[AdminUser, Depends(get_current_admin)],
    skip: int = 0,
    limit: int = 200,
    db: Session = Depends(get_db),
):
    leads = (
        db.query(Lead)
        .order_by(Lead.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [
        LeadRow(
            id=l.id,
            name=l.name,
            email=l.email,
            phone=l.phone,
            state=l.state,
            city=l.city,
            voltage_level=l.voltage_level.value if hasattr(l.voltage_level, "value") else str(l.voltage_level),
            monthly_kwh=l.monthly_kwh,
            current_cost=l.current_cost,
            estimated_savings=l.estimated_savings,
            status=l.status.value if hasattr(l.status, "value") else str(l.status),
            created_at=l.created_at,
        )
        for l in leads
    ]
