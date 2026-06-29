import time
import uuid

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from loguru import logger

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from app.core.config import settings


class LoggingMiddleware(BaseHTTPMiddleware):

    async def dispatch(self, request: Request, call_next) -> Response:

        request_id = str(uuid.uuid4())
        request.state.request_id = request_id

        start_time = time.perf_counter()

        logger.info(f"[{request_id}] {request.method} {request.url.path} - START")

        try:
            response = await call_next(request)

            process_time = (time.perf_counter() - start_time) * 1000

            logger.info(
                f"[{request_id}] "
                f"{request.method} "
                f"{request.url.path} "
                f"- {response.status_code} "
                f"- {process_time:.2f}ms"
            )

            response.headers["X-Request-ID"] = request_id
            response.headers["X-Process-Time"] = f"{process_time:.2f}ms"

            return response

        except Exception as e:

            logger.error(
                f"[{request_id}] "
                f"{request.method} "
                f"{request.url.path} "
                f"- ERROR: {str(e)}"
            )

            raise


def setup_middlewares(app: FastAPI) -> None:

    # CORS - Permitir todos los subdominios de Vercel
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:5173",
            "https://pedidos-ima.vercel.app",
            "https://pedidos-kzu9vw5an-ima-panama.vercel.app",  # 👈 Preview deploy
            "https://*.vercel.app",      # 👈 Cualquier subdominio de Vercel
            "https://*.vercel.com",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Trusted Hosts
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["*"],
    )

    # Logging
    app.add_middleware(LoggingMiddleware)
