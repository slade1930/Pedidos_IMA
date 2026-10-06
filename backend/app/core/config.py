# app/core/config.py
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Base
    PROJECT_NAME: str = "ITAS API"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    API_V1_STR: str = "/api/v1"

    # Database
    DATABASE_URL: str
    # Modo SSL para la conexión DB: "require", "disable", o vacío para no forzar
    DB_SSL: Optional[str] = None

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    # Minutos que dura el bloqueo de cuenta tras demasiados intentos fallidos
    LOCKOUT_MINUTES: int = 30
    # Intentos fallidos máximos antes de bloquear la cuenta
    MAX_FAILED_ATTEMPTS: int = 5
    # FASE 3: tope de tamaño de imagen decodificada (base64 → bytes)
    MAX_IMAGE_BYTES: int = 10 * 1024 * 1024  # 10 MB
    # FASE 3: tope de una petición HTTP completa (headers + body)
    # Debe dejar pasar un JSON con una imagen de MAX_IMAGE_BYTES en base64 (~13.4 MB).
    MAX_REQUEST_BYTES: int = 15 * 1024 * 1024  # 15 MB

    # CORS
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "https://pedidos-ima.vercel.app",
    ]

    # FASE 3: hosts aceptados por TrustedHostMiddleware (prod).
    # Starlette compara contra el hostname SIN puerto.
    # Se puede sobreescribir desde .env como JSON:
    #   ALLOWED_HOSTS=["mi-dominio.com","*.vercel.app"]
    ALLOWED_HOSTS: list[str] = [
        "localhost",
        "127.0.0.1",
        "itas-backend",
        "pedidos-ima.vercel.app",
        "*.vercel.app",
    ]

    # Redis
    REDIS_URL: Optional[str] = "redis://localhost:6379"

    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
