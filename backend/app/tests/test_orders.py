# app/tests/test_orders.py
import pytest
import httpx
from httpx import AsyncClient
from app.main import app


def make_client():
    transport = httpx.ASGITransport(app=app)
    return AsyncClient(transport=transport, base_url="http://test")


async def get_client_token(client: AsyncClient) -> str:
    await client.post(
        "/api/v1/auth/login",
        json={"email": "cliente@itas.gob.pa", "password": "Cliente1234"},
    )
    return client.cookies.get("itas_access")


async def get_staff_token(client: AsyncClient) -> str:
    await client.post(
        "/api/v1/auth/login",
        json={"email": "staff@itas.gob.pa", "password": "Staff1234"},
    )
    return client.cookies.get("itas_access")


@pytest.mark.asyncio
async def test_create_order():
    async with make_client() as client:
        token = await get_client_token(client)
        response = await client.post(
            "/api/v1/orders",
            json={
                "fair_id": "00000000-0000-0000-0000-000000000001",
                "payment_method": "cash",
                "items": [
                    {
                        "product_id": "00000000-0000-0000-0000-000000000002",
                        "quantity": 1,
                    }
                ],
            },
            headers={"Authorization": f"Bearer {token}"},
        )
    assert response.status_code == 200
    data = response.json()["data"]
    assert "order_number" in data
    assert data["status"] == "confirmed"
    # FASE QR: ya no hay qr_code; el código de retiro (pickup_code) existe.
    assert "pickup_code" in data


@pytest.mark.asyncio
async def test_create_order_registers_payment_automatically():
    """Al crear un pedido se registra el pago completado automáticamente (vista Pagos)."""
    async with make_client() as client:
        # Usuario nuevo (sin restricción PDA) para crear el pedido.
        await client.post(
            "/api/v1/users/register",
            json={
                "full_name": "Cliente Pago Auto",
                "cedula": "8-777-9091",
                "email": "pagoauto@itas.gob.pa",
                "phone": "6444-0002",
                "password": "PagoAuto1234",
                "confirm_password": "PagoAuto1234",
            },
        )
        await client.post(
            "/api/v1/auth/login",
            json={"email": "pagoauto@itas.gob.pa", "password": "PagoAuto1234"},
        )
        created = await client.post(
            "/api/v1/orders",
            json={
                "fair_id": "00000000-0000-0000-0000-000000000001",
                "payment_method": "cash",
                "items": [
                    {
                        "product_id": "00000000-0000-0000-0000-000000000002",
                        "quantity": 1,
                    }
                ],
            },
        )
        assert created.status_code == 200, created.text
        order = created.json()["data"]
        assert order["payment_status"] == "completed"

        # Obtener el pago asociado al pedido (debe existir como COMPLETED).
        token = await get_staff_token(client)
        payment = await client.get(
            f"/api/v1/payments/order/{order['id']}",
            headers={"Authorization": f"Bearer {token}"},
        )
    assert payment.status_code == 200, payment.text
    assert payment.json()["data"]["order_id"] == order["id"]
    assert payment.json()["data"]["status"] == "completed"


@pytest.mark.asyncio
async def test_get_my_orders():
    async with make_client() as client:
        token = await get_client_token(client)
        response = await client.get(
            "/api/v1/orders/my-orders",
            headers={"Authorization": f"Bearer {token}"},
        )
    assert response.status_code == 200
    assert isinstance(response.json()["data"], list)


@pytest.mark.asyncio
async def test_validate_pickup_code_not_found():
    async with make_client() as client:
        staff_token = await get_staff_token(client)
        response = await client.post(
            "/api/v1/orders/validate-pickup",
            params={"pickup_code": "00000"},
            headers={"Authorization": f"Bearer {staff_token}"},
        )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_validate_pickup_code_success():
    async with make_client() as client:
        # Cliente nuevo (sin historial PDA para la regla de 8 días).
        await client.post(
            "/api/v1/users/register",
            json={
                "full_name": "Cliente Validación",
                "cedula": "8-999-0001",
                "email": "valida@itas.gob.pa",
                "phone": "6333-0001",
                "password": "Valida1234",
                "confirm_password": "Valida1234",
            },
        )
        await client.post(
            "/api/v1/auth/login",
            json={"email": "valida@itas.gob.pa", "password": "Valida1234"},
        )
        created = await client.post(
            "/api/v1/orders",
            json={
                "fair_id": "00000000-0000-0000-0000-000000000001",
                "payment_method": "cash",
                "items": [
                    {
                        "product_id": "00000000-0000-0000-0000-000000000002",
                        "quantity": 1,
                    }
                ],
            },
        )
        assert created.status_code == 200, created.text
        pickup_code = created.json()["data"]["pickup_code"]
        assert pickup_code, "el pedido debe tener pickup_code"

        # Staff valida el código de retiro.
        staff_token = await get_staff_token(client)
        response = await client.post(
            "/api/v1/orders/validate-pickup",
            params={"pickup_code": pickup_code},
            headers={"Authorization": f"Bearer {staff_token}"},
        )
    assert response.status_code == 200
    assert response.json()["data"]["pickup_code"] == pickup_code


@pytest.mark.asyncio
async def test_duplicate_order_same_fair():
    async with make_client() as client:
        token = await get_client_token(client)
        order_data = {
            "fair_id": "00000000-0000-0000-0000-000000000001",
            "payment_method": "cash",
            "items": [
                {
                    "product_id": "00000000-0000-0000-0000-000000000002",
                    "quantity": 1,
                }
            ],
        }
        # Primer pedido
        await client.post(
            "/api/v1/orders",
            json=order_data,
            headers={"Authorization": f"Bearer {token}"},
        )
        # Segundo pedido en la misma feria
        response = await client.post(
            "/api/v1/orders",
            json=order_data,
            headers={"Authorization": f"Bearer {token}"},
        )
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_pda_restriction_blocks_second_order():
    """Control de beneficios: un segundo pedido dentro de los 8 días se rechaza con detalle."""
    async with make_client() as client:
        await client.post(
            "/api/v1/users/register",
            json={
                "full_name": "Cliente PDA",
                "cedula": "8-555-4321",
                "email": "pda@itas.gob.pa",
                "phone": "6222-0991",
                "password": "Pda1234!abc",
                "confirm_password": "Pda1234!abc",
            },
        )
        await client.post(
            "/api/v1/auth/login",
            json={"email": "pda@itas.gob.pa", "password": "Pda1234!abc"},
        )
        order_data = {
            "fair_id": "00000000-0000-0000-0000-000000000001",
            "payment_method": "card",
            "items": [
                {
                    "product_id": "00000000-0000-0000-0000-000000000002",
                    "quantity": 1,
                }
            ],
        }
        first = await client.post("/api/v1/orders", json=order_data)
        assert first.status_code == 200, first.text

        # El estado de elegibilidad debe pasarse a can_purchase=false
        status_response = await client.get("/api/v1/orders/pda-restriction")
        assert status_response.status_code == 200
        status_data = status_response.json()["data"]
        assert status_data["can_purchase"] is False
        assert status_data["restriction"] is not None
        assert status_data["restriction"]["days_remaining"] > 0
        assert "next_available_date" in status_data["restriction"]

        # El segundo pedido se rechaza con el mismo detalle
        second = await client.post("/api/v1/orders", json=order_data)
    assert second.status_code == 400
    detail = second.json()["detail"]
    assert detail["days_remaining"] > 0
    assert detail["message"] == "Ya realizaste un pedido recientemente"


@pytest.mark.asyncio
async def test_pda_restriction_allows_fresh_user():
    """Un usuario sin compras recientes puede comprar (can_purchase=true)."""
    async with make_client() as client:
        await client.post(
            "/api/v1/users/register",
            json={
                "full_name": "Cliente PDA Libre",
                "cedula": "8-555-9876",
                "email": "pdafresh@itas.gob.pa",
                "phone": "6222-0992",
                "password": "Pda1234!abc",
                "confirm_password": "Pda1234!abc",
            },
        )
        await client.post(
            "/api/v1/auth/login",
            json={"email": "pdafresh@itas.gob.pa", "password": "Pda1234!abc"},
        )
        response = await client.get("/api/v1/orders/pda-restriction")
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["can_purchase"] is True
    assert data["restriction"] is None


@pytest.mark.asyncio
async def test_pda_restriction_requires_auth():
    async with make_client() as client:
        response = await client.get("/api/v1/orders/pda-restriction")
    assert response.status_code == 401
