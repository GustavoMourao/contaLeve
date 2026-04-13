"""
Savings Engine
Compares current bill cost against available supplier offers and returns
ranked savings options.
"""
from app.models import Supplier
from app.services.tariff_engine import calculate_monthly_cost
from app.schemas import SupplierSimulationResult, SupplierResponse


def calculate_savings(current_cost: float, new_cost: float) -> dict:
    monthly_savings = round(current_cost - new_cost, 2)
    yearly_savings = round(monthly_savings * 12, 2)
    return {"monthly_savings": monthly_savings, "yearly_savings": yearly_savings}


def run_simulation(
    monthly_kwh: float,
    current_cost: float,
    suppliers: list[Supplier],
) -> dict:
    """
    Compare current cost against all supplier offers.

    Returns:
        {
            "current_cost": float,
            "monthly_kwh": float,
            "best_option": SupplierSimulationResult,
            "all_options": list[SupplierSimulationResult],
        }
    """
    results: list[SupplierSimulationResult] = []

    for supplier in suppliers:
        new_cost = calculate_monthly_cost(monthly_kwh, supplier.price_per_kwh)
        savings = calculate_savings(current_cost, new_cost)
        results.append(
            SupplierSimulationResult(
                supplier=SupplierResponse.model_validate(supplier),
                monthly_cost=new_cost,
                monthly_savings=savings["monthly_savings"],
                yearly_savings=savings["yearly_savings"],
            )
        )

    # Sort by monthly_savings descending (best deal first)
    results.sort(key=lambda r: r.monthly_savings, reverse=True)

    return {
        "current_cost": current_cost,
        "monthly_kwh": monthly_kwh,
        "best_option": results[0] if results else None,
        "all_options": results,
    }
