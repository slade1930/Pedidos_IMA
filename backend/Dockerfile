# backend/Dockerfile

# ─── Stage 1: Build ─────────────────────────────────────────
FROM python:3.12-slim AS builder

ENV PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /build

# Herramientas de compilación + libpq-dev (solo en build, no pasan a runtime)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# venv aislado que solo copiaremos (no pip global)
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements-prod.txt requirements.txt ./
RUN pip install --no-cache-dir -r requirements-prod.txt

# ─── Stage 2: Runtime ───────────────────────────────────────
FROM python:3.12-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:$PATH"

WORKDIR /app

# Solo la librería de runtime de postgres (sin compilador, sin headers)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar el venv ya compilado
COPY --from=builder /opt/venv /opt/venv

# Código de la app (.env, venv, tests quedan fuera por .dockerignore)
COPY . .

# Usuario no-root (seguridad)
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# Healthcheck para orquestación (local compose usa 8000; Render inyecta $PORT)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f "http://localhost:${PORT:-8000}/health" || exit 1

# Render inyecta $PORT y enruta ahí; el fallback 8000 mantiene el compose local.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]