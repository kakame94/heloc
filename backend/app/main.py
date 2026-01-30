"""
PlexInvest Québec - FastAPI Application
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.routes import router

# Créer l'application FastAPI
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="""
    ## API de calculs financiers pour l'investissement immobilier au Québec

    ### Fonctionnalités principales:

    - **Calculs BRRRR**: Analyse complète Buy-Rehab-Rent-Refinance-Repeat
    - **Capacité HELOC**: Calcul selon les règles BSIF (65%/80% LTV)
    - **Droits de Mutation**: Taxe de bienvenue par municipalité
    - **Règles Réglementaires**: BSIF B-20 et SCHL hard-coded

    ### Particularités canadiennes intégrées:

    - Composition semi-annuelle des taux hypothécaires
    - Stress test BSIF (taux + 2% ou 5.25%)
    - Limite HELOC rotatif à 65% LTV
    - Primes SCHL pour haute ratio
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclure les routes
app.include_router(router, prefix=settings.API_V1_PREFIX)


@app.get("/")
async def root():
    """
    Point d'entrée racine de l'API.
    """
    return {
        "message": "PlexInvest Québec API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": f"{settings.API_V1_PREFIX}/health",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
