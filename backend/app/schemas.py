from pydantic import BaseModel
from typing import Optional


class BillBase(BaseModel):
    monthly_kwh: float
    tariff: Optional[float] = None
    total_cost: float
    consumer_unit: Optional[str] = None
    utility: Optional[str] = None


class BillCreate(BillBase):
    pass


class BillResponse(BillBase):
    id: int
    created_at: str

    class Config:
        from_attributes = True


class UploadBillResponse(BaseModel):
    bill: BillResponse
    message: str
    status: str = "success"  # "success" or "partial"
    extraction_notes: Optional[str] = None
    kwh_extraction_method: Optional[str] = None
    cost_extraction_method: Optional[str] = None
    kwh_confidence: str = "high"
    cost_confidence: str = "high"


class SupplierBase(BaseModel):
    name: str
    price_per_kwh: float
    type: str = "fixed"
    renewable: bool = False


class SupplierCreate(SupplierBase):
    pass


class SupplierResponse(SupplierBase):
    id: int
    description: Optional[str] = None
    created_at: str

    class Config:
        from_attributes = True


class SupplierSimulationResult(BaseModel):
    supplier: SupplierResponse
    monthly_cost: float
    monthly_savings: float
    yearly_savings: float


class SimulationResponse(BaseModel):
    current_cost: float
    monthly_kwh: float
    best_option: Optional[SupplierSimulationResult]
    all_options: list[SupplierSimulationResult]


class SimulationRequest(BaseModel):
    monthly_kwh: float
    current_cost: float


class BillParsingResponse(BaseModel):
    bill: BillResponse
    message: str = "Bill parsed successfully"
    extraction_details: Optional[dict] = None


class PartnerBase(BaseModel):
    name: str
    slug: str
    website: Optional[str] = None
    logo_url: Optional[str] = None
    description: Optional[str] = None


class PartnerResponse(PartnerBase):
    id: int

    class Config:
        from_attributes = True


class LeadCreate(BaseModel):
    name: str
    email: str
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
    status: str


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
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True
