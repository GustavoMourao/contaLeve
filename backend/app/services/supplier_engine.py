"""
Supplier / Partner Engine
Provides supplier data and seeds partner companies we broker leads to.
"""
from sqlalchemy.orm import Session
from app.models import Supplier, Partner


SEED_SUPPLIERS = [
    {
        "name": "Comerc Energia",
        "price_per_kwh": 0.68,
        "type": "fixed",
        "renewable": True,
        "description": "Um dos maiores traders do mercado livre brasileiro.",
    },
    {
        "name": "Enerlivre",
        "price_per_kwh": 0.65,
        "type": "variable",
        "renewable": False,
        "description": "Especialistas em migração para o mercado livre.",
    },
    {
        "name": "Mercado da Energia",
        "price_per_kwh": 0.67,
        "type": "fixed",
        "renewable": True,
        "description": "Plataforma de comparação e contratação de energia.",
    },
    {
        "name": "Energia Verde",
        "price_per_kwh": 0.72,
        "type": "fixed",
        "renewable": True,
        "description": "100% energia renovável com tarifas fixas.",
    },
    {
        "name": "BaixoCusto Energia",
        "price_per_kwh": 0.63,
        "type": "variable",
        "renewable": False,
        "description": "A opção mais barata do mercado.",
    },
]

SEED_PARTNERS = [
    {
        "name": "Comerc Energia",
        "slug": "comerc",
        "website": "https://www.comerc.com.br",
        "contact_email": "parceiros@comerc.com.br",
        "description": "Um dos maiores traders independentes do Brasil. Atende consumidores de média e alta tensão.",
    },
    {
        "name": "Enerlivre",
        "slug": "enerlivre",
        "website": "https://www.enerlivre.com.br",
        "contact_email": "leads@enerlivre.com.br",
        "description": "Especialistas em migração para o mercado livre de energia.",
    },
    {
        "name": "Mercado da Energia",
        "slug": "mercado-da-energia",
        "website": "https://www.mercadodeenergia.com.br",
        "contact_email": "parcerias@mercadodeenergia.com.br",
        "description": "Plataforma de comparação e contratação no mercado livre.",
    },
]


def seed_suppliers(db: Session) -> None:
    """Insert demo suppliers if the table is empty."""
    if db.query(Supplier).count() == 0:
        for data in SEED_SUPPLIERS:
            db.add(Supplier(**data))
        db.commit()


def seed_partners(db: Session) -> None:
    """Insert partner companies if the table is empty."""
    if db.query(Partner).count() == 0:
        for data in SEED_PARTNERS:
            db.add(Partner(**data))
        db.commit()


def get_all_suppliers(db: Session) -> list[Supplier]:
    return db.query(Supplier).order_by(Supplier.price_per_kwh).all()
