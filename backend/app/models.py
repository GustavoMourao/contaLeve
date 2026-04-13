from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.database import Base


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
