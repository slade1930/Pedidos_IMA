# app/utils/validators.py
import base64
import binascii
import re
from decimal import Decimal

from app.core.config import settings

# ─── FASE 3: subida de imágenes en base64 ────────────────────
# Formatos raster aceptados (validados por bytes mágicos REALES,
# nunca por extensión ni por el MIME declarado por el cliente).
_IMAGE_MAGIC: tuple[tuple[bytes, str], ...] = (
    (b"\x89PNG\r\n\x1a\n", "image/png"),
    (b"\xff\xd8\xff", "image/jpeg"),
    (b"GIF87a", "image/gif"),
    (b"GIF89a", "image/gif"),
)


def detect_image_mime(raw: bytes) -> str | None:
    """Devuelve el MIME real de los bytes o None si no es una imagen raster válida."""
    if len(raw) >= 12 and raw[:4] == b"RIFF" and raw[8:12] == b"WEBP":
        return "image/webp"
    for magic, mime in _IMAGE_MAGIC:
        if raw.startswith(magic):
            return mime
    return None


def _image_too_big(max_bytes: int) -> str:
    return f"La imagen supera el tamaño máximo de {max_bytes // (1024 * 1024)} MB"


def validate_image_base64(value: str) -> tuple[str, str]:
    """Valida una imagen en base64 y devuelve (base64_limpio, mime_real).

    Reglas FASE 3:
    - Tamaño máximo configurable (settings.MAX_IMAGE_BYTES, por defecto 10 MB).
    - Solo raster: PNG, JPEG, WebP o GIF según bytes mágicos.
    - SVG/XML rechazado explícitamente (los vectores permiten inyectar script).
    """
    # Prefijo opcional "data:image/png;base64,..." — nunca se confía en él
    if value.startswith("data:"):
        _, _, value = value.partition(",")

    # No debería traer espacios/saltos, pero no estorba
    cleaned = "".join(value.split())

    max_bytes = settings.MAX_IMAGE_BYTES

    # Cota barata ANTES de decodificar (evita alocar payloads gigantes)
    max_encoded = (max_bytes // 3) * 4 + 4096
    if len(cleaned) > max_encoded:
        raise ValueError(_image_too_big(max_bytes))

    try:
        normalized = cleaned.replace("-", "+").replace("_", "/")
        normalized += "=" * (-len(normalized) % 4)
        raw = base64.b64decode(normalized, validate=True)
    except (binascii.Error, ValueError):
        raise ValueError("Imagen en base64 inválida")

    if len(raw) > max_bytes:
        raise ValueError(_image_too_big(max_bytes))

    # Ningún raster empieza con "<": si lo hace, es texto (SVG/XML u otro)
    head = raw[:1024].lstrip().lower()
    if head.startswith(b"<"):
        if b"<svg" in head:
            raise ValueError("Las imágenes SVG no están permitidas")
        raise ValueError("Formato de imagen no válido")

    mime = detect_image_mime(raw)
    if mime is None:
        raise ValueError("Formato de imagen no válido: usa PNG, JPEG, WebP o GIF")

    return cleaned, mime


def validate_cedula_panama(cedula: str) -> bool:
    """
    Formatos válidos:
    - 8-888-8888
    - PE-888-8888  (extranjero)
    - E-888-8888   (extranjero naturalizado)
    - N-88-8888    (nacido en el extranjero)
    """
    patterns = [
        r"^\d{1,2}-\d{3,4}-\d{4,6}$",
        r"^(PE|E|N)-\d{2,4}-\d{4,6}$",
    ]
    return any(re.match(p, cedula.upper()) for p in patterns)


def validate_phone_panama(phone: str) -> bool:
    """
    Formatos válidos:
    - 6xxx-xxxx  (móvil)
    - 2xxx-xxxx  (fijo Panamá)
    - +507-xxxx-xxxx
    """
    pattern = r"^(\+507[-\s]?)?(6\d{3}[-\s]?\d{4}|[2-9]\d{3}[-\s]?\d{4})$"
    return bool(re.match(pattern, phone.replace(" ", "")))


def validate_password_strength(password: str) -> tuple[bool, str]:
    if len(password) < 8:
        return False, "Mínimo 8 caracteres"
    if not any(c.isupper() for c in password):
        return False, "Debe tener al menos una mayúscula"
    if not any(c.islower() for c in password):
        return False, "Debe tener al menos una minúscula"
    if not any(c.isdigit() for c in password):
        return False, "Debe tener al menos un número"
    return True, "OK"


def validate_positive_decimal(value: Decimal) -> bool:
    return value > Decimal("0")


def validate_stock_quantity(quantity: int) -> bool:
    return quantity >= 0


def sanitize_string(value: str) -> str:
    return value.strip().replace("<", "").replace(">", "")
