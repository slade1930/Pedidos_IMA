# app/tests/test_security_fase3.py
# ┍────────────────────────────────────────────────────────────
# FASE 3 — Seguridad ALTA: subida de imágenes + tope de request
#
# Contrato de seguridad:
#   1. Imagen válida (PNG real) → aceptada, MIME detectado por bytes mágicos.
#   2. SVG rechazado explícitamente (vector = vector de ataque XSS).
#   3. Tamaño decodificado > MAX_IMAGE_BYTES (10 MB) → rechazado.
#   4. Base64 corrupto → rechazado.
#   5. El servicio usa el MIME real detectado (no "image/png" hardcodeado)
#      y devuelve 400 con mensaje claro si la imagen es inválida.
#   6. Requests con Content-Length > MAX_REQUEST_BYTES → 413 (nunca se lee el body).
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import base64

import httpx
import pytest
from pydantic import ValidationError

from app.core.config import settings
from app.main import app
from app.models.product_model import ProductCategory, ProductUnit
from app.schemas.fair_schema import FairCreateSchema
from app.schemas.product_schema import ProductCreateSchema
from app.utils.validators import validate_image_base64

# 1x1 PNG real (bytes mágicos correctos)
PNG_1PX_B64 = (
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJ"
    "AAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
)

# JPEG mínimo con magic bytes ffd8ff
JPEG_B64 = base64.b64encode(b"\xff\xd8\xff\xe0" + b"\x00" * 32).decode()

# SVG legítimo (debe ser RECHAZADO)
SVG_B64 = base64.b64encode(
    b'<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'
).decode()


def make_client():
    transport = httpx.ASGITransport(app=app)
    return httpx.AsyncClient(transport=transport, base_url="http://test")


# ─── validate_image_base64 (unitario) ─────────────────────

def test_png_valido_aceptado():
    cleaned, mime = validate_image_base64(PNG_1PX_B64)
    assert cleaned == PNG_1PX_B64
    assert mime == "image/png"


def test_png_valido_con_prefijo_data_uri():
    cleaned, mime = validate_image_base64(f"data:image/png;base64,{PNG_1PX_B64}")
    assert cleaned == PNG_1PX_B64
    assert mime == "image/png"


def test_jpeg_detectado_por_magic_bytes_no_por_extension():
    _, mime = validate_image_base64(JPEG_B64)
    assert mime == "image/jpeg"


def test_svg_rechazado():
    with pytest.raises(ValueError, match="SVG"):
        validate_image_base64(SVG_B64)


def test_base64_corrupto_rechazado():
    with pytest.raises(ValueError, match="base64"):
        validate_image_base64("esto-no-es-base64!!!")


def test_imagen_sobre_tope_rechazada(monkeypatch):
    # Tope pequeño para no alocar 10 MB en el test
    monkeypatch.setattr(settings, "MAX_IMAGE_BYTES", 1024)
    grande = base64.b64encode(b"\x89PNG\r\n\x1a\n" + b"A" * 4096).decode()
    with pytest.raises(ValueError, match="tamaño máximo"):
        validate_image_base64(grande)


def test_tope_por_defecto_es_10mb():
    assert settings.MAX_IMAGE_BYTES == 10 * 1024 * 1024


# ─── Schemas (validación en la frontera) ──────────────────

def _product_payload(image):
    return {
        "name": "Arroz",
        "sku": "SKU-IMG-001",
        "price": "1.50",
        "unit": ProductUnit.POUND,
        "category": ProductCategory.GRAINS,
        "fair_id": "00000000-0000-0000-0000-000000000001",
        "image_base64": image,
    }


def test_schema_producto_acepta_png():
    schema = ProductCreateSchema(**_product_payload(PNG_1PX_B64))
    assert schema.image_base64 == PNG_1PX_B64


def test_schema_producto_rechaza_svg():
    with pytest.raises(ValidationError) as exc:
        ProductCreateSchema(**_product_payload(SVG_B64))
    assert "SVG" in str(exc.value)


def test_schema_feria_rechaza_svg():
    with pytest.raises(ValidationError) as exc:
        FairCreateSchema(
            name="Feria",
            location="Ciudad",
            province="Panamá",
            start_date="2026-01-01T00:00:00",
            end_date="2026-01-02T00:00:00",
            image_base64=SVG_B64,
        )
    assert "SVG" in str(exc.value)


def test_schema_producto_sin_imagen_ok():
    payload = _product_payload(None)
    schema = ProductCreateSchema(**payload)
    assert schema.image_base64 is None


# ─── Servicio (defensa en profundidad + MIME real) ────────

def test_servicio_usa_mime_real_y_sube(monkeypatch):
    from app.services.product_service import ProductService

    captured = {}

    def fake_upload(data_uri, **kwargs):
        captured["data_uri"] = data_uri
        return {"secure_url": "https://res.cloudinary.com/x/image/upload/v1/p.png"}

    import cloudinary.uploader

    monkeypatch.setattr(cloudinary.uploader, "upload", fake_upload)

    svc = ProductService(db=None)  # la subida no usa la sesión
    url = svc._save_base64_image(JPEG_B64, "Arroz", "SKU-1")

    assert url.startswith("https://res.cloudinary.com/")
    # El prefijo data URI debe corresponder al magic bytes detectado (JPEG, no PNG)
    assert captured["data_uri"].startswith("data:image/jpeg;base64,")


def test_servicio_rechaza_svg_con_400(monkeypatch):
    from fastapi import HTTPException

    from app.services.fair_service import FairService

    svc = FairService(db=None)
    with pytest.raises(HTTPException) as exc:
        svc._save_base64_image(SVG_B64, "Feria")
    assert exc.value.status_code == 400
    assert "SVG" in exc.value.detail


# ─── Tope de tamaño de request (middleware 413) ───────────

async def test_request_mas_grande_que_tope_devuelve_413(monkeypatch):
    monkeypatch.setattr(settings, "MAX_REQUEST_BYTES", 10)
    async with make_client() as client:
        res = await client.post(
            "/api/v1/auth/login",
            json={"email": "a@b.com", "password": "Password123"},
        )
    assert res.status_code == 413
    assert res.json()["code"] == "PAYLOAD_TOO_LARGE"


async def test_request_normal_pasa_el_tope():
    async with make_client() as client:
        res = await client.get("/health")
    assert res.status_code == 200


# ─── FASE 3: configuración por entorno ────────────────────

def test_allowed_hosts_y_origins_configurables_por_env(monkeypatch):
    from app.core.config import Settings

    monkeypatch.setenv("DATABASE_URL", "postgresql+asyncpg://u:p@h/db")
    monkeypatch.setenv("SECRET_KEY", "clave-de-test")
    monkeypatch.setenv("ALLOWED_HOSTS", '["mi-dominio.com","*.ejemplo.pa"]')
    monkeypatch.setenv("ALLOWED_ORIGINS", '["https://mi-dominio.com"]')

    s = Settings()
    assert s.ALLOWED_HOSTS == ["mi-dominio.com", "*.ejemplo.pa"]
    assert s.ALLOWED_ORIGINS == ["https://mi-dominio.com"]


def test_defaults_de_hosts_de_prod():
    # El middleware de prod usa settings.ALLOWED_HOSTS (no lista hardcodeada)
    assert "localhost" in settings.ALLOWED_HOSTS
    assert "*.vercel.app" in settings.ALLOWED_HOSTS


# ─── FASE 3: stores con fallback cuando Redis cae ─────────

async def test_token_store_fallback_si_redis_cae(monkeypatch):
    """Redis inaccesible → el store sigue funcionando en memoria (sin 500)."""
    from datetime import datetime, timedelta, timezone

    monkeypatch.setattr(settings, "REDIS_URL", "redis://127.0.0.1:1/0")
    from app.core.redis_client import RedisBridge
    from app.core.token_store import TokenStore

    store = TokenStore(bridge=RedisBridge())
    exp = datetime.now(timezone.utc) + timedelta(days=7)

    # Emisión válida
    await store.mark_issued("user-fb", "jti-A", exp)
    assert await store.validate("user-fb", "jti-A", exp) is True

    # Rotación: jti-B revoca a jti-A
    await store.mark_issued("user-fb", "jti-B", exp)
    assert await store.validate("user-fb", "jti-A", exp) is False
    # Reuso persiste: jti-A sigue revocado
    assert await store.validate("user-fb", "jti-A", exp) is False

    # Logout revoca el vigente
    await store.revoke("jti-B", exp)
    assert await store.validate("user-fb", "jti-B", exp) is False

    # Cambio de contraseña: todo revocado, el siguiente token se adopta
    await store.revoke_all_for_user("user-fb")
    assert await store.validate("user-fb", "jti-C", exp) is True


async def test_lockout_store_fallback_si_redis_cae(monkeypatch):
    monkeypatch.setattr(settings, "REDIS_URL", "redis://127.0.0.1:1/0")
    from app.core.lockout_store import LockoutStore
    from app.core.redis_client import RedisBridge

    store = LockoutStore(bridge=RedisBridge())

    assert await store.is_locked("user-lk") is False
    await store.lock("user-lk")
    assert await store.is_locked("user-lk") is True
    assert await store.remain_minutes("user-lk") > 0

    await store.clear("user-lk")
    assert await store.is_locked("user-lk") is False


def _redis_local_up() -> bool:
    import socket

    try:
        with socket.create_connection(("127.0.0.1", 6379), timeout=0.3):
            return True
    except OSError:
        return False


@pytest.mark.skipif(not _redis_local_up(), reason="Redis local no disponible")
async def test_token_store_persiste_revocacion_en_redis():
    """Con Redis vivo: la revocación vive en Redis (sobrevive reinicios)."""
    from datetime import datetime, timedelta, timezone

    from redis.asyncio import Redis

    from app.core.redis_client import RedisBridge
    from app.core.token_store import TokenStore

    store = TokenStore(bridge=RedisBridge())
    r = Redis.from_url(settings.REDIS_URL, decode_responses=True)
    try:
        exp = datetime.now(timezone.utc) + timedelta(days=7)
        await store.mark_issued("user-redis", "jti-R1", exp)
        assert await store.validate("user-redis", "jti-R1", exp) is True

        # La clave vigente existe en Redis con TTL
        ttl = await r.ttl("itas:refresh:current:user-redis")
        assert 0 < ttl <= 7 * 86400

        # Logout → clave revoked persiste en Redis
        await store.revoke("jti-R1", exp)
        assert await r.exists("itas:refresh:revoked:jti-R1") == 1
        assert await store.validate("user-redis", "jti-R1", exp) is False
    finally:
        await r.delete(
            "itas:refresh:current:user-redis", "itas:refresh:revoked:jti-R1"
        )
        await r.aclose()


# ─── FASE 3: CSRF por origen (middleware) ─────────────────

def _csrf_client():
    transport = httpx.ASGITransport(app=app)
    return httpx.AsyncClient(transport=transport, base_url="http://test")


async def _post_login_csrf(client, headers):
    return await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": "token-de-prueba-invalido"},
        headers=headers,
    )


async def test_csrf_bloquea_sec_fetch_site_cross(monkeypatch):
    monkeypatch.setattr(settings, "DEBUG", False)
    async with _csrf_client() as client:
        res = await _post_login_csrf(client, {"Sec-Fetch-Site": "cross-site"})
    assert res.status_code == 403
    assert res.json()["code"] == "ORIGIN_BLOCKED"


async def test_csrf_bloquea_origin_no_permitido(monkeypatch):
    monkeypatch.setattr(settings, "DEBUG", False)
    async with _csrf_client() as client:
        res = await _post_login_csrf(client, {"Origin": "http://evil.com"})
    assert res.status_code == 403
    assert res.json()["code"] == "ORIGIN_BLOCKED"


async def test_csrf_permite_origin_de_la_app(monkeypatch):
    monkeypatch.setattr(settings, "DEBUG", False)
    async with _csrf_client() as client:
        res = await _post_login_csrf(client, {"Origin": "http://localhost:3000"})
    # No debe cortar por CSRF (el token es inválido → 401, no 403)
    assert res.status_code == 401


async def test_csrf_permite_mismo_host(monkeypatch):
    monkeypatch.setattr(settings, "DEBUG", False)
    async with _csrf_client() as client:
        res = await _post_login_csrf(client, {"Origin": "http://test"})
    assert res.status_code == 401  # mismo host → pasa el control de origen


async def test_csrf_get_no_se_afecta(monkeypatch):
    monkeypatch.setattr(settings, "DEBUG", False)
    async with _csrf_client() as client:
        res = await client.get("/health", headers={"Sec-Fetch-Site": "cross-site"})
    assert res.status_code == 200


async def test_csrf_desactivado_en_debug():
    # DEBUG=True (valor real del entorno de tests): el control no corta
    assert settings.DEBUG is True
    async with _csrf_client() as client:
        res = await _post_login_csrf(client, {"Origin": "http://evil.com"})
    assert res.status_code != 403


# ─── FASE 3: sink dedicado de auditoría ───────────────────

def test_eventos_audit_se_escriben_en_archivo_dedicado():
    from pathlib import Path

    from loguru import logger

    from app.core.security_audit import audit_log
    from app.utils.logger import setup_logger

    setup_logger()

    audit_marker = "test.evento.auditoria.unico"
    normal_marker = "test.log.normal.no-auditoria"

    audit_log(audit_marker, request_id="req-test")
    logger.info(normal_marker)

    audit_file = Path("logs/security-audit.log")
    assert audit_file.exists()

    content = audit_file.read_text(encoding="utf-8")
    # El evento [AUDIT] SÍ está en el archivo dedicado
    assert audit_marker in content
    assert "[AUDIT]" in content
    # Un log normal NO contamina el archivo de auditoría
    assert normal_marker not in content
