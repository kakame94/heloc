"""
Connexion PostgreSQL asynchrone via SQLAlchemy.
"""

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

engine = create_async_engine(settings.database_url, echo=False, pool_size=5)

async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:  # type: ignore[misc]
    """Dependency injection pour FastAPI."""
    async with async_session() as session:
        yield session


async def init_db() -> None:
    """Cree toutes les tables au demarrage."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
