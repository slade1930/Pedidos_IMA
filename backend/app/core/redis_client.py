# app/core/redis_client.py
"""Cliente Redis lazy con fallback a memoria (FASE 3).

Principios:
- Conexión perezosa: no bloquea el arranque de la API.
- Si Redis no responde se marca "no disponible" durante COOLDOWN_SECONDS
  y las operaciones delegan en el store en memoria (mismo comportamiento
  que antes de existir Redis: el estado se pierde al reiniciar).
- Nunca lanza: una caída de Redis no puede romper login/refresh/logout.
  La dirección de fallo es "a memoria", nunca "error 500".
"""
import time
from typing import Any, Awaitable, Callable

from loguru import logger
from redis.asyncio import Redis
from redis.exceptions import RedisError

from app.core.config import settings

# Tras un fallo, no se reintenta Redis durante este tiempo (evita bloquear
# el event loop con timeouts en cada request mientras Redis está caído).
COOLDOWN_SECONDS = 30.0
SOCKET_TIMEOUT = 0.5

WarnState = bool


class RedisBridge:
    """Ejecuta operaciones sobre Redis si está disponible; si no, avisa."""

    def __init__(self) -> None:
        self._client: Redis | None = None
        self._down_until = 0.0
        self._outage_warned = False

    def _get_client(self) -> Redis:
        if self._client is None:
            self._client = Redis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                socket_connect_timeout=SOCKET_TIMEOUT,
                socket_timeout=SOCKET_TIMEOUT,
            )
        return self._client

    async def run(
        self, fn: Callable[[Redis], Awaitable[Any]]
    ) -> tuple[bool, Any]:
        """Ejecuta `fn(client)`.

        Returns:
            (True, resultado) si Redis respondió.
            (False, None) si Redis está en cooldown o la operación falló
            (el llamante debe usar su fallback en memoria).
        """
        if time.monotonic() < self._down_until:
            return False, None

        try:
            result = await fn(self._get_client())
        except RedisError as e:
            self._mark_down(e)
            return False, None

        if self._outage_warned:
            logger.info("[REDIS] Disponible de nuevo (se reactiva persistencia)")
            self._outage_warned = False
        return True, result

    def _mark_down(self, error: Exception) -> None:
        self._down_until = time.monotonic() + COOLDOWN_SECONDS
        if not self._outage_warned:
            # Una sola línea por incidencia: evita inundar el log
            logger.warning(
                f"[REDIS] No disponible ({error}); "
                f"usando fallback en memoria durante {int(COOLDOWN_SECONDS)}s"
            )
            self._outage_warned = True


# Singleton compartido por todos los stores (un solo cooldown por proceso)
redis_bridge = RedisBridge()
