from datetime import datetime
from typing import Any, Generic, Optional, TypeVar

from pydantic import BaseModel, Field
from pydantic.generics import GenericModel

T = TypeVar("T")


class ResponseSchema(GenericModel, Generic[T]):

    success: bool = True
    message: str = "OK"

    data: Optional[T] = None

    timestamp: datetime = Field(default_factory=datetime.utcnow)

    meta: Optional[dict[str, Any]] = None


class PaginatedResponseSchema(GenericModel, Generic[T]):

    success: bool = True
    message: str = "OK"

    data: list[T] = Field(default_factory=list)

    total: int = 0
    page: int = 1
    limit: int = 10
    pages: int = 0

    has_next: bool = False
    has_prev: bool = False

    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ErrorResponseSchema(BaseModel):

    success: bool = False

    message: str

    detail: Optional[Any] = None

    code: Optional[str] = None

    timestamp: datetime = Field(default_factory=datetime.utcnow)
