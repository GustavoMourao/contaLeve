"""Tests for the bill parser service."""
import pytest
from app.services.bill_parser import (
    _parse_kwh,
    _parse_total_cost,
    _parse_consumer_unit,
    _parse_utility,
    parse_bill,
)


SAMPLE_TEXT = """
DISTRIBUIDORA CELESC
Unidade Consumidora: 9876543
Energia Elétrica: 320 kWh
Total a pagar: R$ 272,00
Tarifa: R$ 0,85
"""


def test_parse_kwh():
    assert _parse_kwh(SAMPLE_TEXT) == 320.0


def test_parse_total_cost():
    assert _parse_total_cost(SAMPLE_TEXT) == 272.0


def test_parse_consumer_unit():
    assert _parse_consumer_unit(SAMPLE_TEXT) == "9876543"


def test_parse_utility():
    assert _parse_utility(SAMPLE_TEXT) == "Celesc"


def test_parse_kwh_missing():
    assert _parse_kwh("Sem dados relevantes aqui") is None


def test_parse_total_cost_missing():
    assert _parse_total_cost("Sem dados relevantes aqui") is None


def test_parse_bill_defaults_when_no_data():
    """parse_bill must return safe defaults even with an unreadable file."""
    result = parse_bill(b"%PDF-empty", "bill.pdf")
    assert result["monthly_kwh"] == 320.0
    assert result["total_cost"] == 272.0
