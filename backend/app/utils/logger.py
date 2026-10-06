# app/utils/logger.py
import sys
from loguru import logger
from app.core.config import settings


def setup_logger() -> None:
    logger.remove()

    # Consola
    logger.add(
        sys.stdout,
        level="DEBUG" if settings.DEBUG else "INFO",
        format=(
            "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
            "<level>{level: <8}</level> | "
            "<cyan>{name}</cyan>:<cyan>{line}</cyan> | "
            "<level>{message}</level>"
        ),
        colorize=True,
    )

    # Archivo general
    logger.add(
        "logs/itas_system.log",
        level="INFO",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {name}:{line} | {message}",
        rotation="10 MB",
        retention="30 days",
        compression="zip",
    )

    # Archivo solo errores
    logger.add(
        "logs/errors.log",
        level="ERROR",
        format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {name}:{line} | {message}",
        rotation="5 MB",
        retention="60 days",
        compression="zip",
    )

    # FASE 3: auditoría de seguridad — solo eventos [AUDIT]
    # Archivo propio, rotación diaria, retención 90 días, comprimido.
    # Los eventos llegan desde app/core/security_audit.py (audit_log).
    logger.add(
        "logs/security-audit.log",
        level="INFO",
        format="{time:YYYY-MM-DD HH:mm:ss} | {message}",
        rotation="1 day",
        retention="90 days",
        compression="zip",
        filter=lambda record: "[AUDIT]" in record["message"],
    )


# Instancia lista para importar
log = logger
