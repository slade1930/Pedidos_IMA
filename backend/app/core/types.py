# app/core/types.py
import uuid

from sqlalchemy import Uuid
from sqlalchemy.types import TypeDecorator


class UuidType(TypeDecorator):
    """UUID portable entre dialectos (Postgres nativo / SQLite CHAR).

    Acepta tanto str como uuid.UUID en bind y siempre retorna uuid.UUID:
    asyncpg hace esa conversión automáticamente, pero SQLite no la hace,
    así que se normaliza aquí para que los tests corran en ambos dialectos.
    """

    impl = Uuid(as_uuid=True)
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is not None and not isinstance(value, uuid.UUID):
            return uuid.UUID(str(value))
        return value

    def process_result_value(self, value, dialect):
        if value is not None and not isinstance(value, uuid.UUID):
            return uuid.UUID(str(value))
        return value