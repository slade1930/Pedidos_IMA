from enum import Enum

from pydantic import (
    BaseModel,
    EmailStr,
    Field,
    model_validator,
)


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


class TokenPayloadSchema(BaseModel):

    sub: str

    type: TokenType

    exp: int


class RefreshTokenSchema(BaseModel):

    refresh_token: str


class ChangePasswordSchema(BaseModel):

    current_password: str = Field(min_length=8)

    new_password: str = Field(min_length=8)

    confirm_password: str = Field(min_length=8)

    @model_validator(mode="after")
    def validate_passwords(self):

        if self.new_password != self.confirm_password:
            raise ValueError("Passwords do not match")

        return self
