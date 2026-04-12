"""
Tariff Engine
Simulates monthly electricity cost for a given supplier and consumption.
"""


def calculate_monthly_cost(consumption_kwh: float, price_per_kwh: float) -> float:
    """Return the estimated monthly cost for a supplier."""
    return round(consumption_kwh * price_per_kwh, 2)
