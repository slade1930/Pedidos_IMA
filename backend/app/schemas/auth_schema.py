from enum import Enum

from pydantic import (
    BaseModel,
    EmailStr,
    Field,
    model_validator,
)

from app.utils.validators import validate_password_strength


class TokenType(str, Enum):
    ACCESS = "access"
    REFRESH = "refresh"


class LoginSchema(BaseModel):

    email: EmailStr

    password: str = Field(min_length=8)


class TokenSchema(BaseModel):

    access_token: str

    refresh_token: str

    token_type: str = "bearer"


class SessionSchema(BaseModel):
    """Respuesta de login/refresh: los tokens viajan SOLO en cookies HttpOnly.

    El body nunca expone access_token ni refresh_token (inaccesibles para JS).
    """

    token_type: str = "bearer"


class TokenPayloadSchema(BaseModel):

    sub: str

    type: TokenType

    exp: int


class RefreshTokenSchema(BaseModel):

    # Opcional: el refresh token puede venir aquí o en la cookie httpOnly "itas_refresh"
    refresh_token: str | None = None


class ChangePasswordSchema(BaseModel):

    current_password: str = Field(min_length=8)

    new_password: str = Field(min_length=8)

    confirm_password: str = Field(min_length=8)

    @model_validator(mode="after")
    def validate_passwords(self):

        if self.new_password != self.confirm_password:
            raise ValueError("Passwords do not match")

        ok, reason = validate_password_strength(self.new_password)
        if not ok:
            raise ValueError(f"La nueva contraseña no es segura: {reason}")

        return self
