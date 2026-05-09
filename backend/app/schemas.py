from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ── Bill schemas ──────────────────────────────────────────────────────────

class BillBase(BaseModel):
    consumer_unit: Optional[str] = None
    monthly_kwh: float
    tariff: Optional[float] = None
    total_cost: float
    utility: Optional[str] = None


class BillCreate(BillBase):
    pass


class BillResponse(BillBase):
    id: int
    user_id: Optional[int] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class UploadBillResponse(BaseModel):
    bill: BillResponse
    message: str = "Bill parsed successfully"
    kwh_extraction_method: Optional[str] = None
    cost_extraction_method: Optional[str] = None
    kwh_confidence: str = "high"  # high, low, not_found
    cost_confidence: str = "high"  # high, low, not_found
    extraction_notes: Optional[str] = None


# ── Supplier schemas ────────────────────────────────────────────────────────

class SupplierBase(BaseModel):
    name: str
    price_per_kwh: float
    type: str = "fixed"
    renewable: bool = False
    description: Optional[str] = None


class SupplierCreate(SupplierBase):
    pass


class SupplierResponse(SupplierBase):
    id: int
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ── Simulation schemas ────────────────────────────────────────────────────────

class SimulationRequest(BaseModel):
    monthly_kwh: float
    current_cost: float


class SupplierSimulationResult(BaseModel):
    supplier: SupplierResponse
    monthly_cost: float
    monthly_savings: float
    yearly_savings: float
    savings_percentage: float  # e.g., 18.5 for 18.5%


class SimulationResponse(BaseModel):
    current_cost: float
    monthly_kwh: float
    best_option: SupplierSimulationResult
    all_options: list[SupplierSimulationResult]
    savings_range: Optional[dict] = None  # {"min": 12, "max": 24} for percentage range
    estimated_savings_min: float  # Minimum savings percentage
    estimated_savings_max: float  # Maximum savings percentage
    recommended_contract_type: str  # e.g., "Fixed-price renewable"

    model_config = {"from_attributes": True}


# ── Partner schemas ─────────────────────────────────────────────────────────

class PartnerResponse(BaseModel):
    id: int
    name: str
    slug: str
    website: Optional[str] = None
    logo_url: Optional[str] = None
    description: Optional[str] = None

    model_config = {"from_attributes": True}


# ── Lead schemas ──────────────────────────────────────────────────────────

class LeadCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    monthly_kwh: float
    current_cost: float
    utility: Optional[str] = None
    voltage_level: str = "low"   # low | medium | high
    estimated_savings: Optional[float] = None
    partner_id: Optional[int] = None


class LeadStatusUpdate(BaseModel):
    status: str   # new | sent | in_negotiation | converted | lost
    notes: Optional[str] = None


class LeadResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    monthly_kwh: float
    current_cost: float
    utility: Optional[str] = None
    voltage_level: str
    estimated_savings: Optional[float] = None
    status: str
    notes: Optional[str] = None
    partner: Optional[PartnerResponse] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
