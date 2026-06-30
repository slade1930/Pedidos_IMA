# app/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.database import engine, Base
from app.core.middleware import setup_middlewares
from app.api.router import api_router
from app.utils.logger import setup_logger, log
from app.core.cloudinary_config import init_cloudinary  # 👈 NUEVO
import os
from pathlib import Path


# Crear tablas al iniciar
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    setup_logger()
    log.info("🚀 Iniciando IMA System API...")
    
    # Inicializar Cloudinary
    try:
        init_cloudinary()
        log.info("☁️  Cloudinary configurado")
    except Exception as e:
        log.warning(f"⚠️  Cloudinary no configurado: {e}")
    
    # Crear directorios necesarios
    Path("static/images/fairs").mkdir(parents=True, exist_ok=True)
    log.info("📁 Directorios estáticos creados")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        log.info("✅ Base de datos conectada")

    log.info(f"✅ API lista en modo {'DEBUG' if settings.DEBUG else 'PRODUCCION'}")
    yield

    # Shutdown
    log.info("🛑 Cerrando IMA System API...")
    await engine.dispose()
    log.info("✅ Conexiones cerradas")


# Instancia principal
app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Sistema Inteligente para las Ferias del IMA - Panamá",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)

# Middlewares
setup_middlewares(app)

# Crear directorio static si no existe (antes de montarlo)
static_dir = Path("static")
static_dir.mkdir(exist_ok=True)

# Montar archivos estáticos
app.mount("/static", StaticFiles(directory="static"), name="static")

# Rutas
app.include_router(api_router, prefix=settings.API_V1_STR)


# Health check
@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "ok",
        "project": settings.PROJECT_NAME,
        "version": "1.0.0",
    }
