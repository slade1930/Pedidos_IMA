# app/tests/test_notifications.py
"""Tests del sistema de notificaciones (Fase: notificaciones admin → usuarios)."""
import pytest
import httpx

from app.main import app

ADMIN_EMAIL = "admin@itas.gob.pa"
ADMIN_PASSWORD = "Admin1234"
CLIENT_EMAIL = "cliente@itas.gob.pa"
CLIENT_PASSWORD = "Cliente1234"


def make_client() -> httpx.AsyncClient:
    transport = httpx.ASGITransport(app=app)
    return httpx.AsyncClient(transport=transport, base_url="http://test")


async def login(client: httpx.AsyncClient, email: str, password: str) -> None:
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert response.status_code == 200, response.text


async def create_notification(
    client: httpx.AsyncClient,
    title: str,
    audience: str = "all",
    recipient_ids: list | None = None,
    level: str = "info",
):
    payload = {
        "title": title,
        "message": f"Mensaje de prueba: {title}",
        "level": level,
        "audience": audience,
    }
    if recipient_ids is not None:
        payload["recipient_ids"] = recipient_ids
    return await client.post("/api/v1/notifications", json=payload)


# ─── CREACIÓN ──────────────────────────────────────────────

@pytest.mark.asyncio
async def test_create_notification_as_admin():
    async with make_client() as client:
        await login(client, ADMIN_EMAIL, ADMIN_PASSWORD)
        response = await create_notification(
            client, "Notificación de prueba general", level="success"
        )
    assert response.status_code == 200, response.text
    data = response.json()["data"]
    assert data["title"] == "Notificación de prueba general"
    assert data["level"] == "success"
    assert data["audience"] == "all"
    assert data["recipients_count"] >= 1
    assert data["read_count"] == 0


@pytest.mark.asyncio
async def test_create_notification_unauthorized():
    async with make_client() as client:
        anon = await create_notification(client, "No debería crearse")
        assert anon.status_code == 401

        await login(client, CLIENT_EMAIL, CLIENT_PASSWORD)
        forbidden = await create_notification(client, "Tampoco debería")
        assert forbidden.status_code == 403


@pytest.mark.asyncio
async def test_create_specific_requires_recipients():
    async with make_client() as client:
        await login(client, ADMIN_EMAIL, ADMIN_PASSWORD)
        response = await create_notification(client, "Sin destinatarios", audience="users")
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_create_specific_rejects_unknown_recipients():
    async with make_client() as client:
        await login(client, ADMIN_EMAIL, ADMIN_PASSWORD)
        response = await create_notification(
            client,
            "Destinatario inexistente",
            audience="users",
            recipient_ids=["00000000-0000-0000-0000-000000000099"],
        )
    assert response.status_code == 422


# ─── VISIBILIDAD POR USUARIO ───────────────────────────────

@pytest.mark.asyncio
async def test_all_users_see_broadcast_and_specific_only_recipient():
    async with make_client() as admin_client:
        await login(admin_client, ADMIN_EMAIL, ADMIN_PASSWORD)
        # descubrir id del cliente
        me = await admin_client.get("/api/v1/users/me")
        # (me es el admin; para el id del cliente usamos register/login propio)

    async with make_client() as client:
        await login(client, CLIENT_EMAIL, CLIENT_PASSWORD)
        my = await client.get("/api/v1/users/me")
        assert my.status_code == 200
        client_id = my.json()["data"]["id"]

    async with make_client() as admin_client:
        await login(admin_client, ADMIN_EMAIL, ADMIN_PASSWORD)
        broadcast = await create_notification(
            admin_client, "Aviso para todos los clientes"
        )
        assert broadcast.status_code == 200
        specific = await create_notification(
            admin_client,
            "Solo para un cliente",
            audience="users",
            recipient_ids=[client_id],
        )
        assert specific.status_code == 200, specific.text
        specific_id = specific.json()["data"]["id"]

    async with make_client() as client:
        await login(client, CLIENT_EMAIL, CLIENT_PASSWORD)
        await client.post("/api/v1/notifications/read-all")  # baseline
        listing = await client.get("/api/v1/notifications?limit=50")
        assert listing.status_code == 200
        items = listing.json()["data"]
        titles = [i["title"] for i in items]
        assert "Aviso para todos los clientes" in titles
        assert "Solo para un cliente" in titles

        # el admin NO es destinatario → no debe verla
    async with make_client() as admin_client:
        await login(admin_client, ADMIN_EMAIL, ADMIN_PASSWORD)
        admin_listing = await admin_client.get(
            "/api/v1/notifications?limit=50"
        )
        admin_titles = [i["title"] for i in admin_listing.json()["data"]]
        # la específica fue enviada solo al cliente
        assert "Solo para un cliente" not in admin_titles
        assert specific_id not in [i["id"] for i in admin_listing.json()["data"]]


# ─── CONTEO Y LECTURA ──────────────────────────────────────

@pytest.mark.asyncio
async def test_unread_count_mark_read_and_read_all():
    async with make_client() as client:
        await login(client, CLIENT_EMAIL, CLIENT_PASSWORD)
        # baseline: marcar todo leído
        await client.post("/api/v1/notifications/read-all")
        zero = await client.get("/api/v1/notifications/unread-count")
        assert zero.json()["data"]["count"] == 0

    async with make_client() as admin_client:
        await login(admin_client, ADMIN_EMAIL, ADMIN_PASSWORD)
        created = await create_notification(admin_client, "Cuenta no leída 1")
        assert created.status_code == 200
        created2 = await create_notification(admin_client, "Cuenta no leída 2")
        assert created2.status_code == 200
        nid = created.json()["data"]["id"]

    async with make_client() as client:
        await login(client, CLIENT_EMAIL, CLIENT_PASSWORD)
        count = await client.get("/api/v1/notifications/unread-count")
        assert count.json()["data"]["count"] == 2

        # marcar una
        first = await client.post(f"/api/v1/notifications/{nid}/read")
        assert first.status_code == 200
        count = await client.get("/api/v1/notifications/unread-count")
        assert count.json()["data"]["count"] == 1

        # repetir no cambia nada
        again = await client.post(f"/api/v1/notifications/{nid}/read")
        assert again.status_code == 200
        count = await client.get("/api/v1/notifications/unread-count")
        assert count.json()["data"]["count"] == 1

        # marcar todas
        all_read = await client.post("/api/v1/notifications/read-all")
        assert all_read.status_code == 200
        count = await client.get("/api/v1/notifications/unread-count")
        assert count.json()["data"]["count"] == 0

        # la lista marca read=true
        listing = await client.get("/api/v1/notifications?limit=50")
        target = [
            i for i in listing.json()["data"] if i["id"] == nid
        ]
        assert target and target[0]["read"] is True


@pytest.mark.asyncio
async def test_mark_read_not_found_for_other_user():
    async with make_client() as admin_client:
        await login(admin_client, ADMIN_EMAIL, ADMIN_PASSWORD)
        created = await create_notification(
            admin_client,
            "Oculto para clientes",
            audience="users",
            recipient_ids=[
                # otro usuario que no es el cliente seedeado
                (await admin_client.get("/api/v1/users/me")).json()["data"]["id"],
            ],
        )
        assert created.status_code == 200
        hidden_id = created.json()["data"]["id"]

    async with make_client() as client:
        await login(client, CLIENT_EMAIL, CLIENT_PASSWORD)
        response = await client.post(f"/api/v1/notifications/{hidden_id}/read")
        assert response.status_code == 404


# ─── ADMIN: LISTA, STATS, EDICIÓN, BORRADO ─────────────────

@pytest.mark.asyncio
async def test_admin_list_requires_admin():
    async with make_client() as client:
        await login(client, CLIENT_EMAIL, CLIENT_PASSWORD)
        response = await client.get("/api/v1/notifications/admin")
        assert response.status_code == 403


@pytest.mark.asyncio
async def test_admin_list_has_stats_and_delete_removes_from_users():
    async with make_client() as admin_client:
        await login(admin_client, ADMIN_EMAIL, ADMIN_PASSWORD)
        created = await create_notification(
            admin_client, "Para borrar después", level="warning"
        )
        assert created.status_code == 200
        nid = created.json()["data"]["id"]

        listing = await admin_client.get("/api/v1/notifications/admin?limit=50")
        assert listing.status_code == 200
        target = [i for i in listing.json()["data"] if i["id"] == nid]
        assert target, "la notificación creada debe aparecer en el listado admin"
        assert target[0]["recipients_count"] >= 1
        assert "read_count" in target[0]

        # edición
        updated = await admin_client.put(
            f"/api/v1/notifications/{nid}",
            json={"title": "Título editado", "level": "error"},
        )
        assert updated.status_code == 200
        assert updated.json()["data"]["title"] == "Título editado"
        assert updated.json()["data"]["level"] == "error"

        # borrado (soft delete)
        deleted = await admin_client.delete(f"/api/v1/notifications/{nid}")
        assert deleted.status_code == 200

    async with make_client() as client:
        await login(client, CLIENT_EMAIL, CLIENT_PASSWORD)
        listing = await client.get("/api/v1/notifications?limit=50")
        titles = [i["title"] for i in listing.json()["data"]]
        assert "Título editado" not in titles
        assert "Para borrar después" not in titles


@pytest.mark.asyncio
async def test_delete_not_found():
    async with make_client() as admin_client:
        await login(admin_client, ADMIN_EMAIL, ADMIN_PASSWORD)
        response = await admin_client.delete(
            "/api/v1/notifications/00000000-0000-0000-0000-000000000042"
        )
    assert response.status_code == 404
