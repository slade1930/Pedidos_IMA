# app/tests/test_orders.py
import pytest
from httpx import AsyncClient
from app.main import app


async def get_client_token(client: AsyncClient) -> str:
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "cliente@ima.gob.pa", "password": "Cliente1234"},
    )
    return response.json()["data"]["access_token"]


async def get_staff_token(client: AsyncClient) -> str:
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "staff@ima.gob.pa", "password": "Staff1234"},
    )
    return response.json()["data"]["access_token"]


@pytest.mark.asyncio
async def test_create_order():
    async with AsyncClient(app=app, base_url="http://test") as client:
        token = await get_client_token(client)
        response = await client.post(
            "/api/v1/orders/",
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
    assert data["status"] == "pending"
    assert "qr_code" in data


@pytest.mark.asyncio
async def test_get_my_orders():
    async with AsyncClient(app=app, base_url="http://test") as client:
        token = await get_client_token(client)
        response = await client.get(
            "/api/v1/orders/my-orders",
            headers={"Authorization": f"Bearer {token}"},
        )
    assert response.status_code == 200
    assert isinstance(response.json()["data"], list)


@pytest.mark.asyncio
async def test_validate_qr():
    async with AsyncClient(app=app, base_url="http://test") as client:
        staff_token = await get_staff_token(client)
        response = await client.post(
            "/api/v1/orders/validate-qr",
            params={"qr_code": "invalid_qr_code"},
            headers={"Authorization": f"Bearer {staff_token}"},
        )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_duplicate_order_same_fair():
    async with AsyncClient(app=app, base_url="http://test") as client:
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
            "/api/v1/orders/",
            json=order_data,
            headers={"Authorization": f"Bearer {token}"},
        )
        # Segundo pedido en la misma feria
        response = await client.post(
            "/api/v1/orders/",
            json=order_data,
            headers={"Authorization": f"Bearer {token}"},
        )
    assert response.status_code == 400
