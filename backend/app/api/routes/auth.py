# app/api/routes/auth.py
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.database import get_db
from app.core.security import decode_token
from app.core.token_store import token_store
from app.core.security_audit import audit_log
from app.services.auth_service import AuthService
from app.schemas.auth_schema import LoginSchema, TokenSchema, RefreshTokenSchema, SessionSchema
from app.schemas.response_schema import ResponseSchema

router = APIRouter(prefix="/auth", tags=["Auth"])

ACCESS_COOKIE = "itas_access"
REFRESH_COOKIE = "itas_refresh"


def _set_access_cookie(response: Response, token: str) -> None:
    """Access token en cookie httpOnly (inaccesible para JS/XSS)."""
    response.set_cookie(
        key=ACCESS_COOKIE,
        value=token,
        max_age=int(settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60),
        httponly=True,
        samesite=("none" if not settings.DEBUG else "lax"),
        secure=not settings.DEBUG,  # True en producción (HTTPS), False en local
        path="/api/v1",
    )


def _set_refresh_cookie(response: Response, token: str) -> None:
    """Guarda el refresh token en una cookie httpOnly (inaccesible para JS/XSS)."""
    response.set_cookie(
        key=REFRESH_COOKIE,
        value=token,
        max_age=30 * 24 * 3600,  # 30 días, igual que el refresh token
        httponly=True,
        samesite=("none" if not settings.DEBUG else "lax"),
        secure=not settings.DEBUG,  # True en producción (HTTPS), False en local
        # Path amplio para que el refresh token llegue también a /auth/logout
        # y pueda revocarse. Es httpOnly: el servidor solo lo lee en refresh/logout.
        path="/api/v1",
    )


def _clear_access_cookie(response: Response) -> None:
    response.delete_cookie(
        key=ACCESS_COOKIE,
        path="/api/v1",
    )


def _clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(
        key=REFRESH_COOKIE,
        path="/api/v1",
    )


@router.post("/login", response_model=ResponseSchema[SessionSchema])
async def login(
    data: LoginSchema,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    request_id = getattr(request.state, "request_id", None)
    service = AuthService(db)
    try:
        tokens = await service.login(data)
    except HTTPException as exc:
        audit_log("auth.login.failed", request_id=request_id, reason=exc.detail)
        raise
    payload = decode_token(tokens.access_token)
    audit_log(
        "auth.login.success",
        request_id=request_id,
        user_id=payload.get("sub") if payload else None,
    )
    # Los tokens viajan SOLO en cookies httpOnly (no en localStorage, no en el body)
    _set_access_cookie(response, tokens.access_token)
    _set_refresh_cookie(response, tokens.refresh_token)
    return ResponseSchema(
        message="Login exitoso",
        data=SessionSchema(),
    )


@router.post("/refresh", response_model=ResponseSchema[SessionSchema])
async def refresh(
    data: RefreshTokenSchema,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    # Prioridad: cookie httpOnly > body (retrocompatibilidad con clientes antiguos)
    refresh_token = request.cookies.get(REFRESH_COOKIE) or data.refresh_token

    if not refresh_token:
        raise HTTPException(
            status_code=401,
            detail="No se proporcionó un token de refresco válido",
        )

    service = AuthService(db)
    tokens = await service.refresh(
        RefreshTokenSchema(refresh_token=refresh_token)
    )
    # Rotar ambas cookies
    _set_access_cookie(response, tokens.access_token)
    _set_refresh_cookie(response, tokens.refresh_token)
    return ResponseSchema(
        message="Token renovado",
        data=SessionSchema(),
    )


@router.post("/logout", response_model=ResponseSchema)
async def logout(request: Request, response: Response):
    request_id = getattr(request.state, "request_id", None)

    # Revocar el refresh token emitido (si se recibió vía cookie httpOnly)
    refresh_token = request.cookies.get(REFRESH_COOKIE)
    if refresh_token:
        payload = decode_token(refresh_token)
        if payload and payload.get("jti"):
            exp = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
            await token_store.revoke(payload["jti"], exp)
            audit_log(
                "auth.logout",
                request_id=request_id,
                user_id=payload.get("sub"),
            )
        else:
            audit_log("auth.logout.without_jti", request_id=request_id)

    _clear_access_cookie(response)
    _clear_refresh_cookie(response)
    return ResponseSchema(message="Sesión cerrada correctamente")