"""
Savings Engine
Compares current bill cost against available supplier offers and returns
ranked savings options with percentage estimates.
"""
from app.models import Supplier
from app.services.tariff_engine import calculate_monthly_cost
from app.schemas import SupplierSimulationResult, SupplierResponse


def calculate_savings(current_cost: float, new_cost: float) -> dict:
    """Calculate absolute and percentage savings."""
    monthly_savings = round(current_cost - new_cost, 2)
    yearly_savings = round(monthly_savings * 12, 2)
    
    # Calculate percentage savings
    if current_cost > 0:
        savings_percentage = round((monthly_savings / current_cost) * 100, 2)
    else:
        savings_percentage = 0
    
    return {
        "monthly_savings": monthly_savings,
        "yearly_savings": yearly_savings,
        "savings_percentage": savings_percentage,
    }


def determine_contract_recommendation(suppliers: list) -> str:
    """
    Recommend contract type based on supplier profiles.
    
    If most suppliers are renewable → "Fixed-price renewable"
    Otherwise → "Fixed-price energy"
    """
    if not suppliers:
        return "Fixed-price energy"
    
    renewable_count = sum(1 for s in suppliers if s.renewable)
    if renewable_count > len(suppliers) / 2:
        return "Fixed-price renewable"
    return "Fixed-price energy"


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
            "estimated_savings_min": float,  # Percentage
            "estimated_savings_max": float,  # Percentage
            "recommended_contract_type": str,
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
                savings_percentage=savings["savings_percentage"],
            )
        )

    # Sort by monthly_savings descending (best deal first)
    results.sort(key=lambda r: r.monthly_savings, reverse=True)

    # Calculate min/max savings percentages
    if results:
        savings_percentages = [r.savings_percentage for r in results]
        estimated_savings_min = min(savings_percentages)
        estimated_savings_max = max(savings_percentages)
    else:
        estimated_savings_min = 0
        estimated_savings_max = 0

    recommended_contract = determine_contract_recommendation(suppliers)

    return {
        "current_cost": current_cost,
        "monthly_kwh": monthly_kwh,
        "best_option": results[0] if results else None,
        "all_options": results,
        "estimated_savings_min": estimated_savings_min,
        "estimated_savings_max": estimated_savings_max,
        "recommended_contract_type": recommended_contract,
    }
