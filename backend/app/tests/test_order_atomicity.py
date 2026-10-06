# app/tests/test_order_atomicity.py
# ─────────────────────────────────────────────────────────────
# FASE 1.7 — Transacción atómica en la creación de órdenes.
#
# Si la creación de un pedido falla a mitad de camino (un ítem con
# stock insuficiente después de haberse reservado otro), la reserva
# ya aplicada debe revertirse. Un fallo parcial NO puede dejar stock
# reservado sin pedido.
# ─────────────────────────────────────────────────────────────
import uuid
import pytest
import httpx
from httpx import AsyncClient
from app.main import app

FAIR = "00000000-0000-0000-0000-000000000001"
PRODUCT_OK = "00000000-0000-0000-0000-000000000002"  # Arroz, stock 100
PRODUCT_LOW = "00000000-0000-0000-0000-000000000003"  # Frijol, stock 2


def make_client():
    transport = httpx.ASGITransport(app=app)
    return AsyncClient(transport=transport, base_url="http://test")


async def _login(client: AsyncClient, email: str, password: str):
    await client.post("/api/v1/auth/login", json={"email": email, "password": password})


async def _arroz_reserved(client: AsyncClient) -> int:
    """Consulta reserved_stock del Arroz vía GET inventory (staff)."""
    r = await client.get(f"/api/v1/inventory?fair_id={FAIR}&limit=100")
    assert r.status_code == 200, r.text
    items = r.json()["data"]
    for item in items:
        if item["product_id"] == PRODUCT_OK:
            return item["reserved_stock"]
    return -1


@pytest.mark.asyncio
async def test_partial_failure_rolls_back_stock_reservation():
    async with make_client() as client:
        # Staff autenticado para consultar el inventario.
        await _login(client, "staff@itas.gob.pa", "Staff1234")
        before = await _arroz_reserved(client)

        # Cliente nuevo (sin historial PDA para la regla de 8 días).
        await client.post(
            "/api/v1/users/register",
            json={
                "full_name": "Cliente Atómico",
                "cedula": "8-888-8888",
                "email": "atomico@itas.gob.pa",
                "phone": "6222-2222",
                "password": "Atomico1234",
                "confirm_password": "Atomico1234",
            },
        )

        # Autenticarse como el cliente atómico para crear el pedido.
        await _login(client, "atomico@itas.gob.pa", "Atomico1234")

        # Pedido fallido: Arroz reserva OK, Frijol (stock 2) pide 5 → falla.
        r = await client.post(
            "/api/v1/orders",
            json={
                "fair_id": FAIR,
                "payment_method": "cash",
                "items": [
                    {"product_id": PRODUCT_OK, "quantity": 1},
                    {"product_id": PRODUCT_LOW, "quantity": 5},
                ],
            },
        )
        assert r.status_code == 400, f"debe fallar por stock insuficiente: {r.text}"

        # Volver a staff para consultar el inventario después.
        await _login(client, "staff@itas.gob.pa", "Staff1234")
        after = await _arroz_reserved(client)

    assert after == before, (
        f"reserva de Arroz no se revirtió: antes={before} después={after}"
    )