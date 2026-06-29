# app/utils/validators.py
import re
from decimal import Decimal


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
