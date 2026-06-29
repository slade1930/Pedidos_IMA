from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Base
    PROJECT_NAME: str = "IMA SYSTEM API"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    API_V1_STR: str = "/api/v1"

    # Database
    DATABASE_URL: str

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # QR
    QR_EXPIRY_MINUTES: int = 60

    # CORS
   ALLOWED_ORIGINS: list[str] = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
    "https://pedidos-ima.vercel.app",
]

    # Redis
    REDIS_URL: Optional[str] = "redis://localhost:6379"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
