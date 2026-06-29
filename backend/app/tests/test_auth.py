# app/tests/test_auth.py
import pytest
from httpx import AsyncClient
from app.main import app


@pytest.mark.asyncio
async def test_login_success():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "email": "admin@ima.gob.pa",
                "password": "Admin1234",
            },
        )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "access_token" in data["data"]
    assert "refresh_token" in data["data"]


@pytest.mark.asyncio
async def test_login_wrong_password():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "email": "admin@ima.gob.pa",
                "password": "wrongpassword",
            },
        )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_login_wrong_email():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "email": "noexiste@ima.gob.pa",
                "password": "Admin1234",
            },
        )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_refresh_token():
    async with AsyncClient(app=app, base_url="http://test") as client:
        # Login primero
        login = await client.post(
            "/api/v1/auth/login",
            json={"email": "admin@ima.gob.pa", "password": "Admin1234"},
        )
        refresh_token = login.json()["data"]["refresh_token"]

        # Refresh
        response = await client.post(
            "/api/v1/auth/refresh", json={"refresh_token": refresh_token}
        )
    assert response.status_code == 200
    assert "access_token" in response.json()["data"]
