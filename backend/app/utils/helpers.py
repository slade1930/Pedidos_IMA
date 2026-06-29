# app/utils/helpers.py
import uuid
import random
import string
from datetime import datetime, timezone
from typing import Any


def generate_order_number() -> str:
    suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"IMA-{suffix}"


def generate_transaction_id() -> str:
    return f"TXN-{uuid.uuid4().hex[:12].upper()}"


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def format_currency(amount: float) -> str:
    return f"${amount:,.2f}"


def paginate(items: list[Any], page: int, limit: int) -> tuple[list[Any], int]:
    total = len(items)
    start = (page - 1) * limit
    end = start + limit
    return items[start:end], total


def calculate_pages(total: int, limit: int) -> int:
    if limit <= 0:
        return 0
    return -(-total // limit)  # ceil division


def mask_cedula(cedula: str) -> str:
    # 8-888-8888 -> 8-***-8888
    parts = cedula.split("-")
    if len(parts) == 3:
        return f"{parts[0]}-***-{parts[2]}"
    return cedula


def mask_email(email: str) -> str:
    # usuario@gmail.com -> us***@gmail.com
    parts = email.split("@")
    if len(parts) == 2:
        name = parts[0]
        masked = name[:2] + "***"
        return f"{masked}@{parts[1]}"
    return email
