from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import SimulationRequest, SimulationResponse
from app.services.supplier_engine import get_all_suppliers
from app.services.savings_engine import run_simulation

router = APIRouter(prefix="/simulate", tags=["simulate"])


@router.post("", response_model=SimulationResponse)
def simulate(
    request: SimulationRequest,
    db: Session = Depends(get_db),
):
    """
    Simulate savings by comparing the user's current cost against
    all available suppliers.
    """
    if request.monthly_kwh <= 0:
        raise HTTPException(status_code=422, detail="monthly_kwh must be positive.")
    if request.current_cost <= 0:
        raise HTTPException(status_code=422, detail="current_cost must be positive.")

    suppliers = get_all_suppliers(db)
    if not suppliers:
        raise HTTPException(
            status_code=404, detail="No suppliers found. Please seed the database."
        )

    result = run_simulation(
        monthly_kwh=request.monthly_kwh,
        current_cost=request.current_cost,
        suppliers=suppliers,
    )
    return SimulationResponse(**result)
