"""
Routes API pour les listings immobiliers.
"""

from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.database import get_db
from app.db.models import Listing, Analysis

router = APIRouter(prefix="/api/listings", tags=["listings"])


@router.get("")
async def list_listings(
    region: Optional[str] = Query(None, description="Filtrer par region (montreal, gatineau)"),
    property_type: Optional[str] = Query(None, description="triplex ou quadruplex"),
    price_max: Optional[int] = Query(None, description="Prix maximum"),
    active_only: bool = Query(True, description="Seulement les listings actifs"),
    sort_by: str = Query("first_seen_at", description="Champ de tri"),
    limit: int = Query(50, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """Liste les listings avec filtres et pagination."""
    query = select(Listing).options(selectinload(Listing.analysis))

    if active_only:
        query = query.where(Listing.is_active == True)
    if region:
        query = query.where(Listing.region == region)
    if property_type:
        query = query.where(Listing.property_type == property_type)
    if price_max:
        query = query.where(Listing.price <= price_max)

    # Tri
    sort_column = getattr(Listing, sort_by, Listing.first_seen_at)
    query = query.order_by(desc(sort_column))

    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    listings = result.scalars().all()

    return {
        "count": len(listings),
        "listings": [
            {
                "id": l.id,
                "mls_number": l.mls_number,
                "property_type": l.property_type,
                "price": l.price,
                "address": l.address,
                "city": l.city,
                "region": l.region,
                "num_units": l.num_units,
                "bedrooms_total": l.bedrooms_total,
                "bathrooms_total": l.bathrooms_total,
                "living_area_sqft": l.living_area_sqft,
                "lot_size_sqft": l.lot_size_sqft,
                "year_built": l.year_built,
                "listing_url": l.listing_url,
                "photo_url": l.photo_url,
                "first_seen_at": l.first_seen_at.isoformat() if l.first_seen_at else None,
                "is_active": l.is_active,
                "analysis": {
                    "cashflow_monthly": l.analysis.cashflow_monthly,
                    "dcr": float(l.analysis.dcr) if l.analysis.dcr else None,
                    "cap_rate": float(l.analysis.cap_rate) if l.analysis.cap_rate else None,
                    "cash_on_cash": float(l.analysis.cash_on_cash) if l.analysis.cash_on_cash else None,
                    "welcome_tax": l.analysis.welcome_tax,
                    "mortgage_monthly": l.analysis.mortgage_payment_monthly,
                    "estimated_rent_per_unit": l.analysis.estimated_rent_per_unit,
                    "net_rental_income_monthly": l.analysis.net_rental_income_monthly,
                    "municipal_tax_monthly": l.analysis.municipal_tax_monthly,
                    "school_tax_monthly": l.analysis.school_tax_monthly,
                    "insurance_monthly": l.analysis.insurance_monthly,
                    "maintenance_monthly": l.analysis.maintenance_monthly,
                    "vacancy_monthly": l.analysis.vacancy_monthly,
                    "cmhc_premium": l.analysis.cmhc_premium,
                    "assumptions": l.analysis.assumptions,
                } if l.analysis else None,
            }
            for l in listings
        ],
    }


@router.get("/{listing_id}")
async def get_listing(listing_id: int, db: AsyncSession = Depends(get_db)):
    """Details complets d'un listing avec analyse."""
    result = await db.execute(
        select(Listing)
        .options(selectinload(Listing.analysis), selectinload(Listing.notes))
        .where(Listing.id == listing_id)
    )
    listing = result.scalar_one_or_none()

    if not listing:
        return {"error": "Listing non trouve"}, 404

    return {
        "id": listing.id,
        "mls_number": listing.mls_number,
        "property_type": listing.property_type,
        "price": listing.price,
        "address": listing.address,
        "city": listing.city,
        "region": listing.region,
        "postal_code": listing.postal_code,
        "latitude": float(listing.latitude) if listing.latitude else None,
        "longitude": float(listing.longitude) if listing.longitude else None,
        "num_units": listing.num_units,
        "bedrooms_total": listing.bedrooms_total,
        "bathrooms_total": listing.bathrooms_total,
        "living_area_sqft": listing.living_area_sqft,
        "lot_size_sqft": listing.lot_size_sqft,
        "year_built": listing.year_built,
        "municipal_eval": listing.municipal_eval,
        "description": listing.description,
        "listing_url": listing.listing_url,
        "photo_url": listing.photo_url,
        "first_seen_at": listing.first_seen_at.isoformat() if listing.first_seen_at else None,
        "last_seen_at": listing.last_seen_at.isoformat() if listing.last_seen_at else None,
        "is_active": listing.is_active,
        "analysis": {
            "cashflow_monthly": listing.analysis.cashflow_monthly,
            "dcr": float(listing.analysis.dcr) if listing.analysis.dcr else None,
            "cap_rate": float(listing.analysis.cap_rate) if listing.analysis.cap_rate else None,
            "cash_on_cash": float(listing.analysis.cash_on_cash) if listing.analysis.cash_on_cash else None,
            "welcome_tax": listing.analysis.welcome_tax,
            "cmhc_premium": listing.analysis.cmhc_premium,
            "mortgage_monthly": listing.analysis.mortgage_payment_monthly,
            "municipal_tax_monthly": listing.analysis.municipal_tax_monthly,
            "school_tax_monthly": listing.analysis.school_tax_monthly,
            "insurance_monthly": listing.analysis.insurance_monthly,
            "maintenance_monthly": listing.analysis.maintenance_monthly,
            "vacancy_monthly": listing.analysis.vacancy_monthly,
            "estimated_rent_per_unit": listing.analysis.estimated_rent_per_unit,
            "net_rental_income_monthly": listing.analysis.net_rental_income_monthly,
            "assumptions": listing.analysis.assumptions,
        } if listing.analysis else None,
        "notes": {
            "is_favorite": listing.notes.is_favorite,
            "is_rejected": listing.notes.is_rejected,
            "note": listing.notes.note,
        } if listing.notes else None,
    }
