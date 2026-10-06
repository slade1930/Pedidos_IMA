# app/tests/test_cookie_auth.py
# ─────────────────────────────────────────────────────────────
# FASE 1.1 — Access token en cookie HttpOnly (nunca en JS/localStorage)
#
# Contrato de seguridad (RED):
#   1. Login setea la cookie "itas_access" con HttpOnly.
#   2. El body del login/refresh NO expone access_token (ni refresh_token).
#   3. /users/me funciona con la cookie (sin header Authorization).
#   4. Refresh rota la access cookie.
#   5. Logout limpia ambas cookies (itas_access + itas_refresh).
# ─────────────────────────────────────────────────────────────
import pytest
import httpx
from httpx import AsyncClient
from app.main import app

ACCESS_COOKIE = "itas_access"
REFRESH_COOKIE = "itas_refresh"


def make_client():
    transport = httpx.ASGITransport(app=app)
    return AsyncClient(transport=transport, base_url="http://test")


async def _login(client: AsyncClient) -> httpx.Response:
    return await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@itas.gob.pa", "password": "Admin1234"},
    )


@pytest.mark.asyncio
async def test_login_sets_access_cookie_http_only():
    async with make_client() as client:
        login = await _login(client)
    assert login.status_code == 200
    assert client.cookies.get(ACCESS_COOKIE), "itas_access no quedó en la cookie jar"
    set_cookie_headers = login.headers.get_list("set-cookie")
    access_set = [c for c in set_cookie_headers if c.startswith(f"{ACCESS_COOKIE}=")]
    assert access_set, "login no envía la cookie itas_access"
    assert "HttpOnly" in access_set[0], "itas_access debe ser HttpOnly"


@pytest.mark.asyncio
async def test_login_body_does_not_expose_tokens():
    async with make_client() as client:
        login = await _login(client)
    assert login.status_code == 200
    data = login.json().get("data", {})
    assert "access_token" not in data, "access_token no debe viajar en el body"
    assert "refresh_token" not in data, "refresh_token no debe viajar en el body"


@pytest.mark.asyncio
async def test_me_works_with_cookie_only():
    async with make_client() as client:
        await _login(client)
        me = await client.get("/api/v1/users/me")
    assert me.status_code == 200
    assert me.json()["data"]["email"] == "admin@itas.gob.pa"


@pytest.mark.asyncio
async def test_me_rejects_without_credentials():
    async with make_client() as client:
        me = await client.get("/api/v1/users/me")
    assert me.status_code == 401


@pytest.mark.asyncio
async def test_refresh_rotates_access_cookie():
    async with make_client() as client:
        await _login(client)
        before = client.cookies.get(ACCESS_COOKIE)
        assert before, "login debe dejar una access cookie"

        refresh = await client.post("/api/v1/auth/refresh", json={})
    assert refresh.status_code == 200
    after = client.cookies.get(ACCESS_COOKIE)
    assert after, "refresh debe dejar una nueva access cookie"
    assert after != before, "el access token debe rotar al refrescar"


@pytest.mark.asyncio
async def test_logout_clears_both_cookies():
    async with make_client() as client:
        await _login(client)
        assert client.cookies.get(ACCESS_COOKIE)
        assert client.cookies.get(REFRESH_COOKIE)

        logout = await client.post("/api/v1/auth/logout")
    assert logout.status_code == 200
    assert client.cookies.get(ACCESS_COOKIE) is None, "itas_access debe eliminarse"
    assert client.cookies.get(REFRESH_COOKIE) is None, "itas_refresh debe eliminarse"