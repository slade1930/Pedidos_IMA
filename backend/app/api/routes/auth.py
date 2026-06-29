# app/api/routes/auth.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.auth_service import AuthService
from app.schemas.auth_schema import LoginSchema, TokenSchema, RefreshTokenSchema
from app.schemas.response_schema import ResponseSchema

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=ResponseSchema[TokenSchema])
async def login(
    data: LoginSchema,
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    tokens = await service.login(data)
    return ResponseSchema(message="Login exitoso", data=tokens)


@router.post("/refresh", response_model=ResponseSchema[TokenSchema])
async def refresh(
    data: RefreshTokenSchema,
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    tokens = await service.refresh(data)
    return ResponseSchema(message="Token renovado", data=tokens)
