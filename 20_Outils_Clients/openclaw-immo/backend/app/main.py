"""
OpenClaw Immo — Backend FastAPI

Point d'entree de l'application.
Scraping automatique de triplex/quadruplex, analyse financiere Quebec,
notifications WhatsApp, sync Google Sheets.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.config import settings
from app.db.database import init_db
from app.api.routes import health, listings, scraper, analysis
from app.scheduler.jobs import run_scrape_job

# --- Logging ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)

# --- Scheduler ---
scheduler = AsyncIOScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup et shutdown de l'application."""
    # Startup
    logger.info("Initialisation de la base de donnees...")
    await init_db()
    logger.info("Base de donnees initialisee.")

    # Demarrer le scheduler
    interval = settings.scrape_interval_hours
    scheduler.add_job(
        run_scrape_job,
        "interval",
        hours=interval,
        id="scrape_job",
        name=f"Scrape toutes les {interval}h",
        replace_existing=True,
    )
    scheduler.start()
    logger.info("Scheduler demarre (intervalle: %dh)", interval)

    yield

    # Shutdown
    scheduler.shutdown(wait=False)
    logger.info("Scheduler arrete.")


# --- App ---
app = FastAPI(
    title="OpenClaw Immo",
    description=(
        "Recherche automatisee de triplex/quadruplex "
        "dans la grande region de Montreal et Gatineau."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — permettre au frontend web d'acceder a l'API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En prod, restreindre aux domaines specifiques
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routes ---
app.include_router(health.router)
app.include_router(listings.router)
app.include_router(scraper.router)
app.include_router(analysis.router)


@app.get("/")
async def root():
    return {
        "app": "OpenClaw Immo",
        "version": "1.0.0",
        "description": "Recherche triplex/quadruplex — MTL & Gatineau",
        "docs": "/docs",
        "endpoints": {
            "health": "/health",
            "listings": "/api/listings",
            "scraper_trigger": "/api/scraper/trigger",
            "analysis_simulate": "/api/analysis/simulate",
            "analysis_welcome_tax": "/api/analysis/welcome-tax",
        },
    }
