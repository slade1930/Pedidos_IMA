# app/schemas/user_schema.py
from uuid import UUID
from datetime import datetime
from typing import Optional

from pydantic import (
    BaseModel,
    EmailStr,
    field_validator,
    model_validator,
)

from app.core.constants import UserRole


class UserCreateSchema(BaseModel):

    full_name: str

    cedula: str

    email: EmailStr

    phone: Optional[str] = None

    password: str

    confirm_password: str

    @field_validator("full_name", "cedula")
    @classmethod
    def clean_strings(cls, v: str) -> str:
        return v.strip()

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:

        if len(v) < 8:
            raise ValueError("La contraseña debe tener al menos 8 caracteres")

        return v

    @model_validator(mode="after")
    def validate_passwords(self):

        if self.password != self.confirm_password:
            raise ValueError("Las contraseñas no coinciden")

        return self


class UserUpdateSchema(BaseModel):

    full_name: Optional[str] = None

    phone: Optional[str] = None

    email: Optional[EmailStr] = None


class UserResponseSchema(BaseModel):

    id: UUID

    full_name: str

    cedula: str

    email: str

    phone: Optional[str] = None

    role: UserRole

    is_verified: bool

    is_active: bool

    created_at: datetime

    model_config = {"from_attributes": True}


class UserAdminUpdateSchema(BaseModel):

    role: Optional[UserRole] = None

    is_active: Optional[bool] = None

    is_verified: Optional[bool] = None