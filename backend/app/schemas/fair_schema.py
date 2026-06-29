from uuid import UUID
from typing import Optional
from datetime import datetime

from pydantic import (
    BaseModel,
    Field,
    field_validator,
    model_validator,
)

from app.core.constants import FairStatus


class FairCreateSchema(BaseModel):

    name: str

    description: Optional[str] = None

    location: str

    province: str

    start_date: datetime

    end_date: datetime

    max_orders: int = Field(default=500, ge=1)

    status: FairStatus = FairStatus.UPCOMING

    # 👈 NUEVO: Imagen en Base64
    image_base64: Optional[str] = None

    @field_validator("name", "location", "province")
    @classmethod
    def clean_strings(cls, v: str) -> str:
        return v.strip()

    @model_validator(mode="after")
    def validate_dates(self):

        if self.end_date <= self.start_date:
            raise ValueError("La fecha de fin debe ser posterior a la fecha de inicio")

        return self


class FairUpdateSchema(BaseModel):

    name: Optional[str] = None

    description: Optional[str] = None

    location: Optional[str] = None

    province: Optional[str] = None

    start_date: Optional[datetime] = None

    end_date: Optional[datetime] = None

    max_orders: Optional[int] = Field(default=None, ge=1)

    status: Optional[FairStatus] = None

    is_active: Optional[bool] = None

    # 👈 NUEVO: Imagen en Base64 para actualizar
    image_base64: Optional[str] = None


class FairResponseSchema(BaseModel):

    id: UUID

    name: str

    description: Optional[str] = None

    location: str

    province: str

    start_date: datetime

    end_date: datetime

    max_orders: int

    status: FairStatus

    is_active: bool

    # 👈 NUEVO: URL de la imagen
    image_url: Optional[str] = None

    created_at: datetime

    model_config = {"from_attributes": True}