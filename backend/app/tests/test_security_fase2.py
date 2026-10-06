# app/tests/test_security_fase2.py
# ─────────────────────────────────────────────────────────────
# FASE 2 — Endurecimiento de sesiones (MEDIO)
#
# Contrato de seguridad:
#   1. El refresh token rotado en /refresh queda revocado (reuso → 401).
#   2. El refresh token revocado en /logout queda invalidado (401).
#   3. Cambiar la contraseña invalida todos los refresh tokens emitidos.
#   4. 5 intentos fallidos de login bloquean la cuenta (423) hasta auto-desbloqueo.
# ─────────────────────────────────────────────────────────────
import httpx
from httpx import AsyncClient
from app.main import app

ACCESS_COOKIE = "itas_access"
REFRESH_COOKIE = "itas_refresh"


def make_client():
    transport = httpx.ASGITransport(app=app)
    return AsyncClient(transport=transport, base_url="http://test")


async def _register(client: AsyncClient, email: str) -> str:
    """Registra un usuario nuevo y devuelve su contraseña."""
    password = "Initial123"
    res = await client.post(
        "/api/v1/users/register",
        json={
            "full_name": "Test F2",
            "cedula": f"8-{abs(hash(email)) % 10000:04d}-{abs(hash(email + 'x')) % 10000:04d}",
            "email": email,
            "phone": f"6{abs(hash(email)) % 10000000:07d}",
            "password": password,
            "confirm_password": password,
        },
    )
    assert res.status_code == 200, f"register falló: {res.text}"
    return password


async def _login(client: AsyncClient, email: str, password: str):
    return await client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )


async def _refresh_with_token(client: AsyncClient, token: str):
    return await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": token},
    )


async def test_refresh_reused_token_is_rejected():
    async with make_client() as c1:
        email = "reuso@itas.gob.pa"
        password = await _register(c1, email)

        async with make_client() as login_client:
            login = await _login(login_client, email, password)
        assert login.status_code == 200
        r1 = login_client.cookies.get(REFRESH_COOKIE)

        # Login de nuevo en otro cliente y usa r1 de forma legítima (se rota)
        async with make_client() as c2:
            login2 = await _login(c2, email, password)
            assert login2.status_code == 200
            assert c2.cookies.get(REFRESH_COOKIE) != r1

            refresh = await c2.post("/api/v1/auth/refresh", json={})
        assert refresh.status_code == 200

        # Replay del token que ya se rotó/revocó → reuso detectado → 401
        async with make_client() as attacker:
            reuse = await _refresh_with_token(attacker, r1)
        assert reuse.status_code == 401


async def test_logout_revokes_refresh_token():
    async with make_client() as client:
        email = "logoutrevoca@itas.gob.pa"
        await _register(client, email)

        async with make_client() as lc:
            login = await _login(lc, email, "Initial123")
            assert login.status_code == 200
            r1 = lc.cookies.get(REFRESH_COOKIE)

            logout = await lc.post("/api/v1/auth/logout")
            assert logout.status_code == 200
            assert lc.cookies.get(REFRESH_COOKIE) is None

    # El refresh token revocado ya no sirve, aunque no esté en el jar
    async with make_client() as replay:
        reused = await _refresh_with_token(replay, r1)
    assert reused.status_code == 401


async def test_change_password_invalidates_refresh_tokens():
    async with make_client() as client:
        email = "cambiopass@itas.gob.pa"
        await _register(client, email)

        async with make_client() as lc:
            login = await _login(lc, email, "Initial123")
            assert login.status_code == 200
            r1 = lc.cookies.get(REFRESH_COOKIE)

            change = await lc.post(
                "/api/v1/users/change-password",
                json={
                    "current_password": "Initial123",
                    "new_password": "NewPass456",
                    "confirm_password": "NewPass456",
                },
            )
            assert change.status_code == 200

    # Cualquier refresh token emitido antes del cambio debe quedar inválido
    async with make_client() as replay:
        reused = await _refresh_with_token(replay, r1)
    assert reused.status_code == 401


async def test_five_failed_logins_blocks_account():
    async with make_client() as client:
        email = "bloqueo@itas.gob.pa"
        await _register(client, email)

        last = None
        for _ in range(5):
            async with make_client() as c:
                last = await _login(c, email, "WrongPass123")
        assert last.status_code == 423

        # Aun con la contraseña correcta, la cuenta sigue bloqueada
        async with make_client() as c:
            blocked = await _login(c, email, "Initial123")
        assert blocked.status_code == 423