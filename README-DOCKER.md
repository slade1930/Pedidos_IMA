# Docker - Pedidos ITAS

Levanta todo el sistema (backend + frontend + PostgreSQL local) con un solo comando, en contenedores aislados.

## Arquitectura

```
┌─────────────┐      ┌──────────────┐      ┌──────────────────┐
│  Frontend   │ ───► │   Backend    │ ───► │  PostgreSQL 16   │
│  Next.js    │ :8000│  FastAPI     │ :5432│  (local, 5433)   │
│  :3000      │      │  :8000       │      │  ó Neon (remoto) │
└─────────────┘      └──────────────┘      └──────────────────┘
     itas-frontend        itas-backend              itas-postgres
```

- **itas-backend**: FastAPI + Uvicorn, imagen multi-stage ~200MB, usuario no-root
- **itas-frontend**: Next.js standalone, imagen ~300MB, usuario no-root
- **itas-postgres**: PostgreSQL 16 Alpine, datos persistentes en volumen `itas_pgdata`

Los `depends_on: service_healthy` garantizan el orden de arranque:
postgres sano → backend sano → frontend.

## Comandos

```bash
# Levantar todo
docker compose up -d

# Reconstruir una imagen tras tocar código
docker compose build
docker compose up -d

# Ver logs en vivo
docker compose logs -f backend
docker compose logs -f frontend

# Detener (conserva los datos de postgres)
docker compose down

# Detener y BORRAR los datos de la BD local
docker compose down -v

# Estado y healthchecks
docker compose ps
```

## Acceso

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Docs (solo DEBUG) | http://localhost:8000/docs |
| PostgreSQL (host) | `localhost:5433` |

## Base de datos: local vs Neon

Por defecto el compose levanta un **PostgreSQL local** (datos en volumen).

Para usar **Neon (remoto)**, edita `app/.env`:

```bash
DATABASE_URL=postgresql://neondb_owner:npg_xxx@ep-xxx.aws.neon.tech/neondb?sslmode=require
DB_SSL=require
```

Luego recrea el backend:

```bash
docker compose up -d backend
```

> Nota: `DB_SSL=require` para Neon (asyncpg lo necesita). `DB_SSL=disable` para el postgres local. El parámetro `sslmode` de psycopg2 **no** funciona con asyncpg.

## Backend local (sin Docker)

Si prefieres correr el backend fuera del contenedor contra el postgres del compose:

```bash
cd backend && source venv/bin/activate
pip install -r requirements.txt   # una vez
export DATABASE_URL=postgresql://slade:slade152502@localhost:5433/itas_system
export DB_SSL=disable
uvicorn app.main:app --reload --port 8000
```

## Solución de problemas

| Problema | Solución |
|----------|----------|
| Backend `unhealthy` | `docker compose logs backend` — si es conexión DB, revisa `DATABASE_URL` y `DB_SSL` |
| Puerto 3000/8000 ocupado | Detén servicios locales (`ps aux \| grep -E "uvicorn\|next"`) o cambia el puerto en compose |
| Frontend no actualiza al editar | El build standalone es estático: `docker compose build frontend && docker compose up -d` |
| Cambiaste `NEXT_PUBLIC_API_URL` | Requiere rebuild del frontend (es variable de build, no runtime) |
| Quieres la BD limpia | `docker compose down -v` (borra el volumen entero) |