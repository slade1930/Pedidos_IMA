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

DATABASE_URL = settings.DATABASE_URL

# Cambiar el driver
DATABASE_URL = DATABASE_URL.replace(
    "postgresql://",
    "postgresql+asyncpg://"
)

# Eliminar parámetros incompatibles con asyncpg
DATABASE_URL = DATABASE_URL.replace(
    "?sslmode=require&channel_binding=require",
    ""
)

DATABASE_URL = DATABASE_URL.replace(
    "?sslmode=require",
    ""
)

DATABASE_URL = DATABASE_URL.replace(
    "&channel_binding=require",
    ""
)

# =====================================================
# Engine
# =====================================================

engine = create_async_engine(
    DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    connect_args={
        "ssl": "require"
    },
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
