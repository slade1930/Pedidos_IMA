# app/core/lockout_store.py
"""Bloqueo de cuenta con desbloqueo automático (FASE 3: Redis).

El flag persistido `is_blocked` sigue existiendo en DB; este store guarda
CUÁNDO se bloqueó para poder desbloquear automáticamente tras
`LOCKOUT_MINUTES`.

Persistencia:
- Primario: Redis, con TTL = LOCKOUT_MINUTES → el desbloqueo automático lo
  ejecuta el propio Redis (sobrevive reinicios del backend).
- Fallback: store en memoria (comportamiento original). Si Redis está caído,
  el lockout dura mientras viva el proceso.

Al calcular el tiempo restante se toma el MÁXIMO entre Redis y memoria
(dirección de fallo segura: nunca se acorta un bloqueo vigente). Solo se
consulta este store cuando la DB marca `is_blocked=True`, así que una clave
huérfana en Redis tras desbloquear en DB no tiene efecto.
"""
from datetime import datetime, timezone, timedelta
from threading import Lock
from typing import Optional

from app.core.config import settings
from app.core.redis_client import RedisBridge, redis_bridge

LOCKOUT_PREFIX = "itas:lockout:"


def _key(user_id: str) -> str:
    return f"{LOCKOUT_PREFIX}{user_id}"


class _MemoryLockoutStore:
    """Store original en memoria (fallback cuando Redis no responde)."""

    def __init__(self) -> None:
        self._blocked_at: dict[str, datetime] = {}
        self._lock = Lock()

    def lock(self, user_id: str) -> None:
        with self._lock:
            self._blocked_at[str(user_id)] = datetime.now(timezone.utc)

    def remain_minutes(self, user_id: str) -> float:
        with self._lock:
            at = self._blocked_at.get(str(user_id))
        if at is None:
            return 0.0
        elapsed = datetime.now(timezone.utc) - at
        remaining = timedelta(minutes=settings.LOCKOUT_MINUTES) - elapsed
        return max(0.0, remaining.total_seconds() / 60)

    def clear(self, user_id: str) -> None:
        with self._lock:
            self._blocked_at.pop(str(user_id), None)


class LockoutStore:
    """Fachada async: Redis si está disponible; memoria como fallback."""

    def __init__(self, bridge: Optional[RedisBridge] = None) -> None:
        self._bridge = bridge or redis_bridge
        self._memory = _MemoryLockoutStore()

    async def lock(self, user_id: str) -> None:
        self._memory.lock(user_id)
        ttl = max(1, settings.LOCKOUT_MINUTES * 60)
        await self._bridge.run(lambda r: r.set(_key(user_id), "1", ex=ttl))

    async def remain_minutes(self, user_id: str) -> float:
        """Minutos restantes de bloqueo (0 si no hay bloqueo vigente)."""
        ok, redis_ttl = await self._bridge.run(lambda r: r.ttl(_key(user_id)))
        memory_remaining = self._memory.remain_minutes(user_id)

        if not ok:
            return memory_remaining

        redis_ttl = int(redis_ttl)
        if redis_ttl >= 0:
            redis_remaining = redis_ttl / 60.0
        elif redis_ttl == -1:
            # Clave sin TTL (anómalo): fallar cerrado, bloqueo completo
            redis_remaining = float(settings.LOCKOUT_MINUTES)
        else:  # -2: no existe
            redis_remaining = 0.0

        return max(redis_remaining, memory_remaining)

    async def is_locked(self, user_id: str) -> bool:
        return (await self.remain_minutes(user_id)) > 0

    async def clear(self, user_id: str) -> None:
        self._memory.clear(user_id)
        await self._bridge.run(lambda r: r.delete(_key(user_id)))


lockout_store = LockoutStore()
