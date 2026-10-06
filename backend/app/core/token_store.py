# app/core/token_store.py
"""Revocación de refresh tokens y detección de reuso (FASE 3: Redis).

Modelo "un refresh token vigente por usuario": cada emisión rota el anterior
(generación → el jti previo queda revocado). Si un usuario presenta un token
distinto al vigente, se asume reuso (robo/clonación) y se invalida la sesión.

Persistencia:
- Primario: Redis (sobrevive reinicios del backend).
  Las operaciones de verificación/rotación son atómicas (script Lua),
  preservando el mismo contrato del store en memoria.
- Fallback: store en memoria (idéntico al comportamiento previo). Si Redis
  está caído, el estado vive solo en el proceso y se pierde al reiniciar.

Divergencia permitida (dirección segura): si Redis dicta "revocado/reuso",
el jti también se marca revocado en memoria; así, un token invalidado nunca
vuelve a aceptarse aunque Redis siga caído. La dirección del fallo es siempre
"cerrar sesión", nunca "mantener un token robado".
"""
from datetime import datetime, timezone
from threading import Lock
from typing import Optional

from app.core.config import settings
from app.core.redis_client import RedisBridge, redis_bridge

# Prefijos de clave (Redis de un solo nodo; en cluster haría falta hash tags)
CURRENT_PREFIX = "itas:refresh:current:"
REVOKED_PREFIX = "itas:refresh:revoked:"

# ─── Scripts Lua (atómicos) ─────────────────────────────────
# 1 = válido, 0 = revocado o reuso.
# KEYS[1]=current:{user_id} KEYS[2]=revoked:{jti}
# ARGV[1]=jti ARGV[2]=ttl_segundos
VALIDATE_LUA = """
if redis.call('EXISTS', KEYS[2]) == 1 then return 0 end
local current = redis.call('GET', KEYS[1])
if not current then
  redis.call('SET', KEYS[1], ARGV[1], 'EX', ARGV[2])
  return 1
end
if current == ARGV[1] then return 1 end
redis.call('DEL', KEYS[1])
redis.call('SET', KEYS[2], '1', 'EX', ARGV[2])
return 0
"""

# KEYS[1]=current:{user_id}
# ARGV[1]=jti_nuevo ARGV[2]=ttl ARGV[3]=prefijo_revoked
MARK_ISSUED_LUA = """
local prev = redis.call('GET', KEYS[1])
redis.call('SET', KEYS[1], ARGV[1], 'EX', ARGV[2])
if prev then
  redis.call('SET', ARGV[3] .. prev, '1', 'EX', ARGV[2])
end
return prev or ''
"""

# KEYS[1]=current:{user_id}
# ARGV[1]=prefijo_revoked ARGV[2]=ttl
REVOKE_ALL_LUA = """
local prev = redis.call('GET', KEYS[1])
redis.call('DEL', KEYS[1])
if prev then
  redis.call('SET', ARGV[1] .. prev, '1', 'EX', ARGV[2])
end
return prev or ''
"""


def _current_key(user_id: str) -> str:
    return f"{CURRENT_PREFIX}{user_id}"


def _revoked_key(jti: str) -> str:
    return f"{REVOKED_PREFIX}{jti}"


def _ttl_until(exp: datetime) -> int:
    return max(1, int((exp - datetime.now(timezone.utc)).total_seconds()))


class _MemoryTokenStore:
    """Store original en memoria (fallback cuando Redis no responde)."""

    def __init__(self) -> None:
        # user_id -> (jti vigente, exp)
        self._current: dict[str, tuple[str, datetime]] = {}
        # jti -> exp (expiración para poder podar sin ttl por entrada)
        self._revoked: dict[str, datetime] = {}
        self._lock = Lock()

    def _prune(self) -> None:
        now = datetime.now(timezone.utc)
        expired = [j for j, exp in self._revoked.items() if exp <= now]
        for jti in expired:
            self._revoked.pop(jti, None)
        expired_users = [u for u, (_, exp) in self._current.items() if exp <= now]
        for user_id in expired_users:
            self._current.pop(user_id, None)

    def mark_issued(self, user_id: str, jti: str, exp: datetime) -> None:
        """Registra el jti como vigente; el anterior queda revocado (rotación)."""
        with self._lock:
            prev = self._current.get(user_id)
            if prev:
                self._revoked[prev[0]] = prev[1]
            self._current[user_id] = (jti, exp)

    def revoke(self, jti: str, exp: datetime) -> None:
        """Revoca un refresh token concreto (logout puntual)."""
        with self._lock:
            self._revoked[jti] = exp

    def revoke_all_for_user(self, user_id: str) -> None:
        """Invalida todos los refresh tokens del usuario (cambio de contraseña)."""
        with self._lock:
            prev = self._current.pop(user_id, None)
            if prev:
                self._revoked[prev[0]] = prev[1]

    def is_revoked(self, jti: str) -> bool:
        """True si el jti está revocado en el fallback (sin efectos)."""
        with self._lock:
            self._prune()
            return jti in self._revoked

    def validate(self, user_id: str, jti: str, exp: datetime) -> bool:
        with self._lock:
            self._prune()
            if jti in self._revoked:
                return False
            current = self._current.get(user_id)
            if current is None:
                self._current[user_id] = (jti, exp)
                return True
            if current[0] == jti:
                return True
            self._current.pop(user_id, None)
            self._revoked[jti] = exp
            return False


class TokenStore:
    """Fachada async: Redis si está disponible; memoria como fallback."""

    def __init__(self, bridge: Optional[RedisBridge] = None) -> None:
        self._bridge = bridge or redis_bridge
        self._memory = _MemoryTokenStore()

    async def mark_issued(self, user_id: str, jti: str, exp: datetime) -> None:
        """Registra el jti como vigente; el anterior queda revocado (rotación)."""
        self._memory.mark_issued(user_id, jti, exp)
        await self._bridge.run(
            lambda r: r.eval(
                MARK_ISSUED_LUA,
                1,
                _current_key(user_id),
                jti,
                _ttl_until(exp),
                REVOKED_PREFIX,
            )
        )

    async def revoke(self, jti: str, exp: datetime) -> None:
        """Revoca un refresh token concreto (logout puntual)."""
        self._memory.revoke(jti, exp)
        await self._bridge.run(
            lambda r: r.set(_revoked_key(jti), "1", ex=_ttl_until(exp))
        )

    async def revoke_all_for_user(self, user_id: str) -> None:
        """Invalida todos los refresh tokens del usuario (cambio de contraseña)."""
        self._memory.revoke_all_for_user(user_id)
        ttl = settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400
        await self._bridge.run(
            lambda r: r.eval(
                REVOKE_ALL_LUA,
                1,
                _current_key(user_id),
                REVOKED_PREFIX,
                ttl,
            )
        )

    async def validate(self, user_id: str, jti: str, exp: datetime) -> bool:
        """Valida un refresh token contra la sesión vigente.

        - Revocado o expirado → False.
        - Sin sesión registrada (p. ej. tras reinicio) → se adopta y True.
        - Coincide con el vigente → True.
        - Token anterior presentado de nuevo (reuso) → se invalida la sesión
          y se revoca ese jti, devolviendo False.
        """
        ttl = _ttl_until(exp)
        ok, result = await self._bridge.run(
            lambda r: r.eval(
                VALIDATE_LUA,
                2,
                _current_key(user_id),
                _revoked_key(jti),
                jti,
                ttl,
            )
        )
        if not ok:
            # Redis caído → mismo contrato en memoria
            return self._memory.validate(user_id, jti, exp)

        if int(result) == 0:
            # Redis dictó "revocado o reuso": espejar en memoria para que
            # el fallback no llegue a aceptar este jti.
            self._memory.revoke(jti, exp)
            return False

        # Redis aceptó: además, nunca aceptar un jti revocado en memoria
        # durante una ventana de caída de Redis.
        return not self._memory.is_revoked(jti)


token_store = TokenStore()
