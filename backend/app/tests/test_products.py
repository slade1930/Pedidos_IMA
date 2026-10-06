# app/tests/test_products.py
import pytest
import httpx
from httpx import AsyncClient
from app.main import app


def make_client():
    transport = httpx.ASGITransport(app=app)
    return AsyncClient(transport=transport, base_url="http://test")


async def get_admin_token(client: AsyncClient) -> str:
    await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@itas.gob.pa", "password": "Admin1234"},
    )
    return client.cookies.get("itas_access")


@pytest.mark.asyncio
async def test_create_product():
    async with make_client() as client:
        token = await get_admin_token(client)
        response = await client.post(
            "/api/v1/products",
            json={
                "name": "Arroz BLANCO",
                "sku": "SKU-NEW-001",
                "price": 1.50,
                "unit": "pound",
                "category": "grains",
                "max_per_user": 2,
                "fair_id": "00000000-0000-0000-0000-000000000001",
            },
            headers={"Authorization": f"Bearer {token}"},
        )
    assert response.status_code == 200
    assert response.json()["data"]["name"] == "Arroz BLANCO"


@pytest.mark.asyncio
async def test_get_products_by_fair():
    async with make_client() as client:
        token = await get_admin_token(client)
        response = await client.get(
            "/api/v1/products/fair/00000000-0000-0000-0000-000000000001",
            headers={"Authorization": f"Bearer {token}"},
        )
    assert response.status_code == 200
    assert isinstance(response.json()["data"], list)


@pytest.mark.asyncio
async def test_create_product_unauthorized():
    async with make_client() as client:
        response = await client.post(
            "/api/v1/products",
            json={
                "name": "Arroz",
                "price": 1.50,
                "unit": "pound",
                "category": "grains",
                "max_per_user": 2,
                "fair_id": "00000000-0000-0000-0000-000000000001",
            },
        )
    assert response.status_code == 401
