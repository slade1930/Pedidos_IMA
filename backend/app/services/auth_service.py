# app/services/auth_service.py
from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.user_repository import UserRepository
from app.core.security import (
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    verify_token_type,
)
from app.schemas.auth_schema import (
    LoginSchema,
    TokenSchema,
    RefreshTokenSchema,
)
from app.core.config import settings
from app.core.token_store import token_store
from app.core.lockout_store import lockout_store
from app.core.security_audit import audit_log


def _jti_exp(payload: dict) -> tuple[str, datetime]:
    """Extrae (jti, exp como datetime UTC) del payload de un JWT."""
    return payload["jti"], datetime.fromtimestamp(payload["exp"], tz=timezone.utc)


class AuthService:

    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)

    async def login(self, data: LoginSchema) -> TokenSchema:
        user = await self.user_repo.get_by_email(data.email)

        # Si el usuario no existe, igual se aplica delay para evitar enumeración
        if not user:
            # Hash dummy para evitar timing attacks
            from app.core.security import pwd_context
            pwd_context.hash("dummy_password_to_prevent_timing")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales incorrectas",
            )

        # Verificar si la cuenta está bloqueada (con desbloqueo automático)
        if user.is_blocked:
            user_id = str(user.id)
            if await lockout_store.is_locked(user_id):
                remaining = await lockout_store.remain_minutes(user_id)
                raise HTTPException(
                    status_code=status.HTTP_423_LOCKED,
                    detail=(
                        "Cuenta bloqueada por demasiados intentos. "
                        f"Intenta de nuevo en ~{int(remaining) + 1} min."
                    ),
                )
            # El bloqueo expiró: desbloquear automáticamente
            await self.user_repo.update(user.id, {
                "failed_login_attempts": 0,
                "is_blocked": False,
            })
            await lockout_store.clear(user_id)

        # Verificar contraseña
        if not verify_password(data.password, user.hashed_password):
            # Incrementar intentos fallidos
            user.failed_login_attempts = (user.failed_login_attempts or 0) + 1

            if user.failed_login_attempts >= settings.MAX_FAILED_ATTEMPTS:
                user.is_blocked = True
                await self.user_repo.update(user.id, {
                    "failed_login_attempts": user.failed_login_attempts,
                    "is_blocked": True,
                })
                # Commit explícito: get_db hace rollback al propagar HTTPException
                # y el contador/bloqueo debe persistir pese al 423.
                await self.db.commit()
                await lockout_store.lock(str(user.id))
                raise HTTPException(
                    status_code=status.HTTP_423_LOCKED,
                    detail="Cuenta bloqueada por demasiados intentos fallidos.",
                )

            await self.user_repo.update(user.id, {
                "failed_login_attempts": user.failed_login_attempts,
            })
            # Commit explícito para conservar el conteo pese al 401
            await self.db.commit()
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales incorrectas",
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Usuario inactivo",
            )

        # Login exitoso: resetear intentos fallidos
        await self.user_repo.update(user.id, {
            "last_login": datetime.now(timezone.utc),
            "failed_login_attempts": 0,
        })

        refresh_token = create_refresh_token(str(user.id))
        refresh_payload = decode_token(refresh_token)
        if refresh_payload:
            jti, exp = _jti_exp(refresh_payload)
            await token_store.mark_issued(str(user.id), jti, exp)

        return TokenSchema(
            access_token=create_access_token(str(user.id)),
            refresh_token=refresh_token,
        )

    async def refresh(self, data: RefreshTokenSchema) -> TokenSchema:
        payload = decode_token(data.refresh_token)

        if not payload or not verify_token_type(payload, "refresh"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido o expirado",
            )

        sub = payload.get("sub")
        jti = payload.get("jti")
        if not sub or not jti:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido o expirado",
            )

        exp = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)

        # Revocación / detección de reuso
        if not await token_store.validate(str(sub), jti, exp):
            audit_log("auth.refresh.reuse", user_id=str(sub))
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido o expirado",
            )

        user = await self.user_repo.get_by_id(sub)

        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario no encontrado",
            )

        refresh_token = create_refresh_token(str(user.id))
        refresh_payload = decode_token(refresh_token)
        if refresh_payload:
            jti, exp = _jti_exp(refresh_payload)
            await token_store.mark_issued(str(user.id), jti, exp)

        return TokenSchema(
            access_token=create_access_token(str(user.id)),
            refresh_token=refresh_token,
        )
