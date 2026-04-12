"""Integration tests for the FastAPI endpoints."""
import io
import pytest


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_get_suppliers(client):
    response = client.get("/suppliers")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert "name" in data[0]
    assert "price_per_kwh" in data[0]


def test_simulate(client):
    payload = {"monthly_kwh": 320, "current_cost": 272.0}
    response = client.post("/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "best_option" in data
    assert "all_options" in data
    assert data["current_cost"] == 272.0


def test_simulate_invalid_kwh(client):
    response = client.post("/simulate", json={"monthly_kwh": -1, "current_cost": 272.0})
    assert response.status_code == 422


def test_upload_bill_unsupported_type(client):
    fake_file = io.BytesIO(b"not a real file")
    response = client.post(
        "/upload-bill",
        files={"file": ("bill.txt", fake_file, "text/plain")},
    )
    assert response.status_code == 422


def test_upload_bill_pdf(client):
    # Minimal fake PDF bytes – parser will fall back to demo values
    fake_pdf = io.BytesIO(b"%PDF-1.4 fake content")
    response = client.post(
        "/upload-bill",
        files={"file": ("bill.pdf", fake_pdf, "application/pdf")},
    )
    assert response.status_code == 200
    data = response.json()
    assert "bill" in data
    assert data["bill"]["monthly_kwh"] == 320.0
    assert data["bill"]["total_cost"] == 272.0
