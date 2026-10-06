# app/core/security_audit.py
"""Eventos de seguridad auditables (log estructurado, sin secretos)."""
from loguru import logger


def audit_log(
    event: str,
    request_id: str | None = None,
    **details,
) -> None:
    """Registra un evento de seguridad.

    Nunca se pasan contraseñas, tokens ni datos personales completos.
    """
    details.update({"event": event})
    if request_id:
        details.update({"request_id": request_id})
    logger.info(f"[AUDIT] {event} {details}")