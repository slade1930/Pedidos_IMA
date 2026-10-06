# app/tests/test_change_password.py
# ─────────────────────────────────────────────────────────────
# FASE 1.6 — Cambio de contraseña exige verificar la contraseña
# actual (current_password) y confirmar el nuevo.
#
# Para no mutar los usuarios seed (estado compartido session-scoped),
# cada test crea su propio usuario vía /users/register (y Rx/naR).
# ─────────────────────────────────────────────────────────────
import pytest
import httpx
from httpx import AsyncClient
from app.main import app

REGISTER_PASSWORD = "ClaveInicial123"


def make_client():
    transport = httpx.ASGITransport(app=app)
    return AsyncClient(transport=transport, base_url="http://test")


async def _register(client: AsyncClient, email: str, cedula: str, phone: str) -> httpx.Response:
    return await client.post(
        "/api/v1/users/register",
        json={
            "full_name": "Usuario Cambio Pass",
            "cedula": cedula,
            "email": email,
            "phone": phone,
            "password": REGISTER_PASSWORD,
            "confirm_password": REGISTER_PASSWORD,
        },
    )


async def _login(client: AsyncClient, email: str, password: str) -> httpx.Response:
    return await client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )


@pytest.mark.asyncio
async def test_change_password_requires_current_password():
    async with make_client() as client:
        await _register(client, "cp1@itas.gob.pa", "8-777-0001", "6111-0001")
        login = await _login(client, "cp1@itas.gob.pa", REGISTER_PASSWORD)
        assert login.status_code == 200

        res = await client.post(
            "/api/v1/users/change-password",
            json={
                "current_password": "incorrecta",
                "new_password": "NuevaPass123",
                "confirm_password": "NuevaPass123",
            },
        )
        assert res.status_code in (400, 401), (
            "con current_password incorrecta debe rechazar"
        )


@pytest.mark.asyncio
async def test_change_password_success_and_relogin():
    async with make_client() as client:
        await _register(client, "cp2@itas.gob.pa", "8-777-0002", "6111-0002")
        login = await _login(client, "cp2@itas.gob.pa", REGISTER_PASSWORD)
        assert login.status_code == 200

        res = await client.post(
            "/api/v1/users/change-password",
            json={
                "current_password": REGISTER_PASSWORD,
                "new_password": "ClaveNueva123",
                "confirm_password": "ClaveNueva123",
            },
        )
        assert res.status_code == 200, res.text

    # Con la nueva contraseña debe poder loguearse de nuevo
    async with make_client() as fresh:
        relogin = await _login(fresh, "cp2@itas.gob.pa", "ClaveNueva123")
        assert relogin.status_code == 200, "debe loguearse con la nueva contraseña"


@pytest.mark.asyncio
async def test_change_password_rejects_mismatch():
    async with make_client() as client:
        await _register(client, "cp3@itas.gob.pa", "8-777-0003", "6111-0003")
        login = await _login(client, "cp3@itas.gob.pa", REGISTER_PASSWORD)
        assert login.status_code == 200

        res = await client.post(
            "/api/v1/users/change-password",
            json={
                "current_password": REGISTER_PASSWORD,
                "new_password": "AdminNueva123",
                "confirm_password": "AdminDiferente",
            },
        )
        assert res.status_code == 422, "confirm no coincide debe dar 422"