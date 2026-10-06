# app/tests/test_auth.py
import pytest
import httpx
from httpx import AsyncClient
from app.main import app


def make_client():
    transport = httpx.ASGITransport(app=app)
    return AsyncClient(transport=transport, base_url="http://test")


@pytest.mark.asyncio
async def test_login_success():
    async with make_client() as client:
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "email": "admin@itas.gob.pa",
                "password": "Admin1234",
            },
        )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "access_token" not in data["data"]
    assert "refresh_token" not in data["data"]
    assert client.cookies.get("itas_access"), "itas_access cookie debe quedar seteada"
    assert client.cookies.get("itas_refresh"), "itas_refresh cookie debe quedar seteada"


@pytest.mark.asyncio
async def test_login_wrong_password():
    async with make_client() as client:
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "email": "admin@itas.gob.pa",
                "password": "wrongpassword",
            },
        )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_login_wrong_email():
    async with make_client() as client:
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "email": "noexiste@itas.gob.pa",
                "password": "Admin1234",
            },
        )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_refresh_token():
    async with make_client() as client:
        # Login primero (deja la refresh cookie en el jar del client)
        login = await client.post(
            "/api/v1/auth/login",
            json={"email": "admin@itas.gob.pa", "password": "Admin1234"},
        )
        assert login.status_code == 200
        assert client.cookies.get("itas_access")

        # Refresh (la cookie itas_refresh se envía automáticamente)
        response = await client.post("/api/v1/auth/refresh", json={})
    assert response.status_code == 200
    assert client.cookies.get("itas_access"), "refresh debe setear la access cookie"
    assert "access_token" not in response.json()["data"], "access_token no va en el body"
