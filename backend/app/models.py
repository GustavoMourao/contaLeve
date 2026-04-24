from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import enum

from app.database import Base


class VoltageLevel(str, enum.Enum):
    low = "low"        # Baixa tensão  (residencial / pequeno comércio)
    medium = "medium"  # Média tensão   (ABRADEE grupo A)
    high = "high"      # Alta tensão    (grandes indústrias)


class LeadStatus(str, enum.Enum):
    new = "new"
    sent = "sent"               # forwarded to partner
    in_negotiation = "in_negotiation"
    converted = "converted"     # contract signed
    lost = "lost"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    bills = relationship("Bill", back_populates="user")
    simulations = relationship("Simulation", back_populates="user")


class Bill(Base):
    __tablename__ = "bills"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    consumer_unit = Column(String, nullable=True)
    monthly_kwh = Column(Float)
    tariff = Column(Float, nullable=True)
    total_cost = Column(Float)
    utility = Column(String, nullable=True)
    raw_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="bills")
    simulations = relationship("Simulation", back_populates="bill")


class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    price_per_kwh = Column(Float)
    type = Column(String, default="fixed")  # "fixed" or "variable"
    renewable = Column(Boolean, default=False)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    simulations = relationship("Simulation", back_populates="best_supplier")


class Simulation(Base):
    __tablename__ = "simulations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    bill_id = Column(Integer, ForeignKey("bills.id"), nullable=True)
    best_supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True)
    monthly_savings = Column(Float)
    yearly_savings = Column(Float)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="simulations")
    bill = relationship("Bill", back_populates="simulations")
    best_supplier = relationship("Supplier", back_populates="simulations")


class Partner(Base):
    """Energy trading companies we refer leads to."""
    __tablename__ = "partners"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    slug = Column(String, unique=True, index=True)  # e.g. "comerc"
    website = Column(String, nullable=True)
    contact_email = Column(String, nullable=True)
    logo_url = Column(String, nullable=True)
    description = Column(String, nullable=True)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    leads = relationship("Lead", back_populates="partner")


class Lead(Base):
    """A qualified user who requested to be connected with a partner."""
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    # Contact
    name = Column(String)
    email = Column(String, index=True)
    phone = Column(String, nullable=True)
    # Location
    state = Column(String, nullable=True)   # e.g. "SP"
    city = Column(String, nullable=True)
    # Consumption profile (from bill)
    monthly_kwh = Column(Float)
    current_cost = Column(Float)
    utility = Column(String, nullable=True)
    voltage_level = Column(Enum(VoltageLevel), default=VoltageLevel.low)
    estimated_savings = Column(Float, nullable=True)
    # Partner assignment
    partner_id = Column(Integer, ForeignKey("partners.id"), nullable=True)
    # Pipeline
    status = Column(Enum(LeadStatus), default=LeadStatus.new, index=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))

    partner = relationship("Partner", back_populates="leads")
