"""
Modeles ORM — PostgreSQL tables pour les listings et analyses.
"""

from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Boolean,
    DateTime,
    Integer,
    Numeric,
    String,
    Text,
    ForeignKey,
    JSON,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Listing(Base):
    """Propriete immobiliere (triplex/quadruplex)."""

    __tablename__ = "listings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    mls_number: Mapped[str] = mapped_column(String(20), unique=True, nullable=False, index=True)
    source: Mapped[str] = mapped_column(String(20), default="realtor_ca")
    property_type: Mapped[str] = mapped_column(String(30), nullable=False)  # triplex, quadruplex
    price: Mapped[int] = mapped_column(Integer, nullable=False)
    address: Mapped[str] = mapped_column(Text, nullable=False)
    city: Mapped[Optional[str]] = mapped_column(String(100))
    region: Mapped[Optional[str]] = mapped_column(String(50))  # montreal, gatineau
    postal_code: Mapped[Optional[str]] = mapped_column(String(10))
    latitude: Mapped[Optional[float]] = mapped_column(Numeric(10, 7))
    longitude: Mapped[Optional[float]] = mapped_column(Numeric(10, 7))
    bedrooms_total: Mapped[Optional[int]] = mapped_column(Integer)
    bathrooms_total: Mapped[Optional[int]] = mapped_column(Integer)
    num_units: Mapped[Optional[int]] = mapped_column(Integer)
    lot_size_sqft: Mapped[Optional[int]] = mapped_column(Integer)
    living_area_sqft: Mapped[Optional[int]] = mapped_column(Integer)
    year_built: Mapped[Optional[int]] = mapped_column(Integer)
    municipal_eval: Mapped[Optional[int]] = mapped_column(Integer)
    description: Mapped[Optional[str]] = mapped_column(Text)
    photo_url: Mapped[Optional[str]] = mapped_column(Text)
    raw_data: Mapped[Optional[dict]] = mapped_column(JSON)
    listing_url: Mapped[Optional[str]] = mapped_column(Text)
    first_seen_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    last_seen_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    # Relations
    analysis: Mapped[Optional["Analysis"]] = relationship(back_populates="listing", uselist=False, cascade="all, delete-orphan")
    notes: Mapped[Optional["UserNote"]] = relationship(back_populates="listing", uselist=False, cascade="all, delete-orphan")


class Analysis(Base):
    """Analyse financiere d'une propriete."""

    __tablename__ = "analyses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    listing_id: Mapped[int] = mapped_column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), unique=True)

    # Revenus
    estimated_rent_per_unit: Mapped[Optional[int]] = mapped_column(Integer)
    net_rental_income_monthly: Mapped[Optional[int]] = mapped_column(Integer)

    # Couts
    mortgage_payment_monthly: Mapped[Optional[int]] = mapped_column(Integer)
    cmhc_premium: Mapped[Optional[int]] = mapped_column(Integer)
    municipal_tax_monthly: Mapped[Optional[int]] = mapped_column(Integer)
    school_tax_monthly: Mapped[Optional[int]] = mapped_column(Integer)
    insurance_monthly: Mapped[Optional[int]] = mapped_column(Integer)
    maintenance_monthly: Mapped[Optional[int]] = mapped_column(Integer)
    vacancy_monthly: Mapped[Optional[int]] = mapped_column(Integer)

    # Resultats
    cashflow_monthly: Mapped[Optional[int]] = mapped_column(Integer)
    dcr: Mapped[Optional[float]] = mapped_column(Numeric(10, 2))
    cap_rate: Mapped[Optional[float]] = mapped_column(Numeric(10, 2))
    cash_on_cash: Mapped[Optional[float]] = mapped_column(Numeric(10, 2))
    welcome_tax: Mapped[Optional[int]] = mapped_column(Integer)

    # Hypotheses utilisees
    assumptions: Mapped[Optional[dict]] = mapped_column(JSON)
    calculated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    listing: Mapped["Listing"] = relationship(back_populates="analysis")


class ScrapeRun(Base):
    """Historique des executions du scraper."""

    __tablename__ = "scrape_runs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    started_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    finished_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    region: Mapped[Optional[str]] = mapped_column(String(50))
    listings_found: Mapped[int] = mapped_column(Integer, default=0)
    new_listings: Mapped[int] = mapped_column(Integer, default=0)
    errors: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(20), default="running")


class UserNote(Base):
    """Notes et favoris de l'utilisateur."""

    __tablename__ = "user_notes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    listing_id: Mapped[int] = mapped_column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), unique=True)
    is_favorite: Mapped[bool] = mapped_column(Boolean, default=False)
    is_rejected: Mapped[bool] = mapped_column(Boolean, default=False)
    note: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    listing: Mapped["Listing"] = relationship(back_populates="notes")
