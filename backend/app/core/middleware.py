import time
import uuid
from collections import defaultdict
from datetime import datetime, timedelta
from urllib.parse import urlparse

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from loguru import logger

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response, JSONResponse

from app.core.config import settings
from app.core.security_audit import audit_log


# ─── RATE LIMITER (in-memory) ─────────────────────────────

class RateLimitStore:
    """Almacenamiento en memoria para rate limiting."""
    def __init__(self):
        self._requests: dict[str, list[datetime]] = defaultdict(list)

    def is_rate_limited(self, key: str, max_requests: int, window_seconds: int) -> bool:
        now = datetime.utcnow()
        cutoff = now - timedelta(seconds=window_seconds)
        self._requests[key] = [t for t in self._requests[key] if t > cutoff]
        if len(self._requests[key]) >= max_requests:
            return True
        self._requests[key].append(now)
        return False

    def requests_count(self) -> int:
        """Devuelve el total de entradas cacheadas (para proteger el store)."""
        return sum(len(v) for v in self._requests.values())


rate_limit_store = RateLimitStore()

RATE_LIMITS = {
    "/api/v1/auth/login": {"max": 5, "window": 60},
    "/api/v1/auth/refresh": {"max": 10, "window": 60},
    "/api/v1/users/register": {"max": 3, "window": 300},
    "/api/v1/users/change-password": {"max": 5, "window": 300},
    "/api/v1/orders/validate-pickup": {"max": 5, "window": 60},
    "/api/v1/payments/*/confirm": {"max": 10, "window": 60},
}


# ─── SECURITY HEADERS ─────────────────────────────────────

SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Cache-Control": "no-store, no-cache, must-revalidate",
}


# ─── CLIENT IP (proxy-aware) ──────────────────────────────

def get_client_ip(request: Request) -> str:
    """Devuelve la IP real del cliente.

    En producción (DEBUG=False) el app corre detrás de un proxy/nginx que
    inyecta X-Forwarded-For; request.client.host sería la IP del proxy
    (o del contenedor), inútil para rate limiting.
    """
    if not settings.DEBUG:
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            first = forwarded.split(",")[0].strip()
            if first:
                return first
        forwarded_proto = request.headers.get("forwarded")
        if forwarded_proto:
            for part in forwarded_proto.split(";"):
                part = part.strip()
                if part.lower().startswith("for="):
                    value = part.split("=", 1)[1].strip('"')
                    return value.split(":")[0]
    return request.client.host if request.client else "unknown"


def _rate_limit_route_matches(path: str, route: str) -> bool:
    """Coincidencia exacta o prefijo si la ruta termina en '*' (ej: payments/*/confirm)."""
    if route.endswith("*"):
        prefix = route[:-1]
        return path.startswith(prefix)
    return path == route or path.rstrip("/") == route


# ─── LOGGING MIDDLEWARE ───────────────────────────────────

class LoggingMiddleware(BaseHTTPMiddleware):

    async def dispatch(self, request: Request, call_next) -> Response:

        request_id = str(uuid.uuid4())
        request.state.request_id = request_id

        start_time = time.perf_counter()

        logger.info(f"[{request_id}] {request.method} {request.url.path} - START")

        try:
            response = await call_next(request)

            process_time = (time.perf_counter() - start_time) * 1000

            logger.info(
                f"[{request_id}] "
                f"{request.method} "
                f"{request.url.path} "
                f"- {response.status_code} "
                f"- {process_time:.2f}ms"
            )

            response.headers["X-Request-ID"] = request_id
            response.headers["X-Process-Time"] = f"{process_time:.2f}ms"

            return response

        except Exception as e:

            logger.error(
                f"[{request_id}] "
                f"{request.method} "
                f"{request.url.path} "
                f"- ERROR: Internal server error"
            )

            raise


# ─── SECURITY HEADERS MIDDLEWARE ──────────────────────────

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Agrega headers de seguridad a todas las respuestas."""

    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)

        for header, value in SECURITY_HEADERS.items():
            response.headers[header] = value

        return response


# ─── CSRF / ORIGEN (defensa en capas) ─────────────────────

class CSRFOriginMiddleware(BaseHTTPMiddleware):
    """Bloquea mutaciones cross-origin (POST/PUT/PATCH/DELETE).

    Se suma a las cookies SameSite: si un sitio ajeno intenta usar la cookie
    de sesión del usuario desde el navegador, se corta en el servidor.

    Reglas:
    - DEBUG → omitido (dev/tests; igual que el rate limit).
    - Sec-Fetch-Site == "cross-site" → 403 (los navegadores modernos lo
      envían siempre en peticiones web).
    - Origin presente y distinto de ALLOWED_ORIGINS y del propio host → 403.
    - Sin Origin ni Sec-Fetch-Site (curl, apps nativas) → pasa: no hay
      contexto de navegador que explotar.
    """

    MUTATING_METHODS = {"POST", "PUT", "PATCH", "DELETE"}

    async def dispatch(self, request: Request, call_next) -> Response:
        if settings.DEBUG or request.method not in self.MUTATING_METHODS:
            return await call_next(request)

        site = request.headers.get("sec-fetch-site", "")
        origin = request.headers.get("origin", "")

        blocked_reason = None
        if site == "cross-site":
            blocked_reason = f"sec-fetch-site={site}"
        elif origin:
            same_host = urlparse(origin).netloc == request.headers.get("host")
            if origin not in settings.ALLOWED_ORIGINS and not same_host:
                blocked_reason = f"origin={origin}"

        if blocked_reason:
            client_ip = get_client_ip(request)
            audit_log(
                "csrf.blocked",
                request_id=getattr(request.state, "request_id", None),
                ip=client_ip,
                path=request.url.path,
                reason=blocked_reason,
            )
            logger.warning(
                f"[CSRF] Bloqueado {client_ip} {request.method} "
                f"{request.url.path} ({blocked_reason})"
            )
            return JSONResponse(
                status_code=403,
                content={
                    "success": False,
                    "message": "Solicitud bloqueada: origen no permitido.",
                    "detail": None,
                    "code": "ORIGIN_BLOCKED",
                },
            )

        return await call_next(request)


# ─── TOPE DE TAMAÑO DE PETICIÓN (FASE 3) ──────────────────

class BodySizeLimitMiddleware(BaseHTTPMiddleware):
    """Rechaza requests con Content-Length > MAX_REQUEST_BYTES (413).

    Barato: solo mira el header, nunca lee ni aloca el body.
    Protege el endpoint de subida de imágenes (base64 ~13.4 MB máx.).
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        max_bytes = settings.MAX_REQUEST_BYTES
        content_length = request.headers.get("content-length")

        if content_length is not None:
            try:
                if int(content_length) > max_bytes:
                    client_ip = get_client_ip(request)
                    audit_log(
                        "request.oversized",
                        request_id=getattr(request.state, "request_id", None),
                        ip=client_ip,
                        path=request.url.path,
                        content_length=content_length,
                    )
                    logger.warning(
                        f"[BODY_LIMIT] Rechazado {client_ip} "
                        f"({content_length} bytes > {max_bytes}) en {request.url.path}"
                    )
                    return JSONResponse(
                        status_code=413,
                        content={
                            "success": False,
                            "message": (
                                f"La petición supera el tamaño máximo de "
                                f"{max_bytes // (1024 * 1024)} MB"
                            ),
                            "detail": None,
                            "code": "PAYLOAD_TOO_LARGE",
                        },
                    )
            except ValueError:
                # Content-Length no numérico → dejar que FastAPI lo maneje
                pass

        return await call_next(request)


# ─── RATE LIMITING MIDDLEWARE ─────────────────────────────

class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting por IP y endpoint."""

    async def dispatch(self, request: Request, call_next) -> Response:
        # En DEBUG (dev/tests) no se limita: evita romper desarrollo y suites de test
        if settings.DEBUG:
            return await call_next(request)

        client_ip = get_client_ip(request)
        path = request.url.path

        for route, config in RATE_LIMITS.items():
            if _rate_limit_route_matches(path, route):
                key = f"{client_ip}:{route}"

                # Evita que la misma IP colapse el store bajo ataque masivo
                if rate_limit_store.requests_count() > 100000:
                    logger.error(f"[RATE_LIMIT] Store overflow. Dropping request from {client_ip}")
                    return JSONResponse(
                        status_code=429,
                        content={
                            "success": False,
                            "message": "Servicio saturado. Intenta de nuevo más tarde.",
                            "detail": None,
                            "code": "RATE_LIMITED",
                        },
                    )

                if rate_limit_store.is_rate_limited(key, config["max"], config["window"]):
                    audit_log("rate_limit.hit", request_id=request.state.request_id, ip=client_ip, route=route)
                    logger.warning(f"[RATE_LIMIT] Blocked {client_ip} on {route}")
                    return JSONResponse(
                        status_code=429,
                        content={
                            "success": False,
                            "message": "Demasiadas peticiones. Intenta de nuevo más tarde.",
                            "detail": None,
                            "code": "RATE_LIMITED",
                        },
                    )
                break

        return await call_next(request)


# ─── SETUP ────────────────────────────────────────────────

def setup_middlewares(app: FastAPI) -> None:

    # CORS - Orígenes permitidos
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
        allow_headers=["Authorization", "Content-Type", "Accept"],
        expose_headers=["X-Request-ID", "X-Process-Time"],
    )

    # Trusted Hosts - permitir en dev, restringir en prod
    if settings.DEBUG:
        app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])
    else:
        # FASE 3: hosts configurables por entorno (settings.ALLOWED_HOSTS)
        app.add_middleware(
            TrustedHostMiddleware,
            allowed_hosts=settings.ALLOWED_HOSTS,
        )

    # Security Headers
    app.add_middleware(SecurityHeadersMiddleware)

    # Tope de tamaño de petición (FASE 3) - antes de leer el body
    app.add_middleware(BodySizeLimitMiddleware)

    # Rate Limiting
    app.add_middleware(RateLimitMiddleware)

    # CSRF por origen (se evalúa antes de gastar presupuesto de rate limit)
    app.add_middleware(CSRFOriginMiddleware)

    # Logging
    app.add_middleware(LoggingMiddleware)
