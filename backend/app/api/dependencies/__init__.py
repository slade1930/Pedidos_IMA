# app/api/dependencies/__init__.py
from app.api.dependencies.auth_dependencies import (
    get_current_user,
    get_current_admin,
    get_current_staff,
)

__all__ = [
    "get_current_user",
    "get_current_admin",
    "get_current_staff",
]
