# conftest.py (raíz del backend)
# Ejecutar pytest desde /home/sladezz/app/backend
import os

# Debe setearse ANTES de importar app.core.config (settings = Settings())
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")
os.environ.setdefault("SECRET_KEY", "test-secret-key-itas-not-for-prod")
os.environ.setdefault("DEBUG", "True")
# DEBUG=True desactiva el rate limiting en middleware.py (ver RateLimitMiddleware)

from sqlalchemy.ext.compiler import compiles
from sqlalchemy.dialects.postgresql import UUID as PgUUID


@compiles(PgUUID, "sqlite")
def _compile_pg_uuid_for_sqlite(type_, compiler, **kw):
    return "CHAR(36)"