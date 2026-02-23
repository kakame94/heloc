"""
Routes API pour le controle du scraper.
"""

from fastapi import APIRouter

from app.scheduler.jobs import run_scrape_job

router = APIRouter(prefix="/api/scraper", tags=["scraper"])


@router.post("/trigger")
async def trigger_scrape():
    """
    Declenche un scrape manuel immediatement.
    Utile pour tester ou forcer une mise a jour.
    """
    result = await run_scrape_job()
    return {
        "status": "completed",
        "summary": result,
    }
