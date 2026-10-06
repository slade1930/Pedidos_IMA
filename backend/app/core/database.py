from sqlalchemy.ext.asyncio import (
    AsyncSession,
    create_async_engine,
    async_sessionmaker,
)
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

# =====================================================
# Adaptar DATABASE_URL de Neon para asyncpg
# =====================================================


def get_async_database_url() -> str:
    """Adapta la DATABASE_URL configurada para el driver asyncpg."""
    url = settings.DATABASE_URL

    # Cambiar el driver
    url = url.replace("postgresql://", "postgresql+asyncpg://")

    # Eliminar parámetros incompatibles con asyncpg
    url = url.replace("?sslmode=require&channel_binding=require", "")
    url = url.replace("?sslmode=require", "")
    url = url.replace("&channel_binding=require", "")

    return url


DATABASE_URL = get_async_database_url()

# =====================================================
# Engine
# =====================================================

# SQLite (tests/dev local) no soporta pool_size/max_overflow/ssl
if DATABASE_URL.startswith("sqlite"):
    engine = create_async_engine(
        DATABASE_URL,
        echo=settings.DEBUG,
    )
    # URL de conexión para SQLite en memoria/pool compartida (tests)
    _engine_url = DATABASE_URL
else:
    # Configurar SSL según DB_SSL (require para Neon, disable/vacío para local)
    if settings.DB_SSL:
        engine = create_async_engine(
            DATABASE_URL,
            echo=settings.DEBUG,
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=20,
            connect_args={
                "ssl": settings.DB_SSL
            },
        )
    else:
        engine = create_async_engine(
            DATABASE_URL,
            echo=settings.DEBUG,
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=20,
        )

# =====================================================
# Session Factory
# =====================================================

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# =====================================================
# Base
# =====================================================

class Base(DeclarativeBase):
    pass

# =====================================================
# Dependency
# =====================================================

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()

        except Exception:
            await session.rollback()
            raise

        finally:
            await session.close()
