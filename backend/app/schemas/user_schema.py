# app/schemas/user_schema.py
from uuid import UUID
from datetime import datetime
from typing import Optional

from pydantic import (
    BaseModel,
    EmailStr,
    Field,
    field_validator,
    model_validator,
)

from app.core.constants import UserRole
from app.utils.validators import (
    validate_password_strength,
    validate_cedula_panama,
    validate_phone_panama,
    sanitize_string,
)


class UserCreateSchema(BaseModel):

    full_name: str = Field(min_length=2, max_length=100)

    cedula: str = Field(min_length=5, max_length=20)

    email: EmailStr

    phone: Optional[str] = Field(None, max_length=20)

    password: str = Field(min_length=8, max_length=128)

    confirm_password: str = Field(min_length=8, max_length=128)

    @field_validator("full_name", "cedula")
    @classmethod
    def clean_strings(cls, v: str) -> str:
        return sanitize_string(v)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        if v and not validate_phone_panama(v):
            raise ValueError("Formato de teléfono inválido (ej: 6xxx-xxxx)")
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        valid, msg = validate_password_strength(v)
        if not valid:
            raise ValueError(msg)
        return v

    @model_validator(mode="after")
    def validate_passwords(self):

        if self.password != self.confirm_password:
            raise ValueError("Las contraseñas no coinciden")

        return self


class UserUpdateSchema(BaseModel):

    full_name: Optional[str] = Field(None, min_length=2, max_length=100)

    phone: Optional[str] = Field(None, max_length=20)

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
