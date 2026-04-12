"""Tests for the tariff and savings engines."""
from app.services.tariff_engine import calculate_monthly_cost
from app.services.savings_engine import calculate_savings, run_simulation
from app.models import Supplier


def test_calculate_monthly_cost():
    assert calculate_monthly_cost(320, 0.72) == pytest.approx(230.4, rel=1e-3)


def test_calculate_savings_positive():
    result = calculate_savings(272.0, 230.4)
    assert result["monthly_savings"] == pytest.approx(41.6, rel=1e-2)
    assert result["yearly_savings"] == pytest.approx(41.6 * 12, rel=1e-2)


def test_calculate_savings_no_savings():
    result = calculate_savings(200.0, 250.0)
    assert result["monthly_savings"] < 0


def test_run_simulation_best_is_cheapest():
    suppliers = [
        Supplier(id=1, name="A", price_per_kwh=0.72, type="fixed", renewable=True),
        Supplier(id=2, name="B", price_per_kwh=0.63, type="variable", renewable=False),
    ]
    result = run_simulation(monthly_kwh=320, current_cost=272.0, suppliers=suppliers)
    assert result["best_option"].supplier.name == "B"
    assert result["best_option"].monthly_savings > 0
    assert len(result["all_options"]) == 2


import pytest
