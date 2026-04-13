"""
Supplier Engine
Provides supplier data. Seeded with fake/demo suppliers for the MVP.
"""
from sqlalchemy.orm import Session
from app.models import Supplier


SEED_SUPPLIERS = [
    {
        "name": "Energia Verde",
        "price_per_kwh": 0.72,
        "type": "fixed",
        "renewable": True,
        "description": "100% energia renovável com tarifas fixas.",
    },
    {
        "name": "Sol Livre",
        "price_per_kwh": 0.68,
        "type": "fixed",
        "renewable": True,
        "description": "Energia solar a um preço justo.",
    },
    {
        "name": "EconôLuz",
        "price_per_kwh": 0.65,
        "type": "variable",
        "renewable": False,
        "description": "Tarifas variáveis com economia garantida.",
    },
    {
        "name": "Vento Livre",
        "price_per_kwh": 0.70,
        "type": "fixed",
        "renewable": True,
        "description": "Energia eólica 100% limpa.",
    },
    {
        "name": "BaixoCusto Energia",
        "price_per_kwh": 0.63,
        "type": "variable",
        "renewable": False,
        "description": "A opção mais barata do mercado.",
    },
]


def seed_suppliers(db: Session) -> None:
    """Insert demo suppliers if the table is empty."""
    if db.query(Supplier).count() == 0:
        for data in SEED_SUPPLIERS:
            db.add(Supplier(**data))
        db.commit()


def get_all_suppliers(db: Session) -> list[Supplier]:
    return db.query(Supplier).order_by(Supplier.price_per_kwh).all()
