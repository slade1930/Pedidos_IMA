# app/tests/test_products.py
import pytest
from httpx import AsyncClient
from app.main import app


async def get_admin_token(client: AsyncClient) -> str:
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@ima.gob.pa", "password": "Admin1234"},
    )
    return response.json()["data"]["access_token"]


@pytest.mark.asyncio
async def test_create_product():
    async with AsyncClient(app=app, base_url="http://test") as client:
        token = await get_admin_token(client)
        response = await client.post(
            "/api/v1/products/",
            json={
                "name": "Arroz",
                "price": 1.50,
                "unit": "pound",
                "category": "grains",
                "max_per_user": 2,
                "fair_id": "00000000-0000-0000-0000-000000000001",
            },
            headers={"Authorization": f"Bearer {token}"},
        )
    assert response.status_code == 200
    assert response.json()["data"]["name"] == "Arroz"


@pytest.mark.asyncio
async def test_get_products_by_fair():
    async with AsyncClient(app=app, base_url="http://test") as client:
        token = await get_admin_token(client)
        response = await client.get(
            "/api/v1/products/fair/00000000-0000-0000-0000-000000000001",
            headers={"Authorization": f"Bearer {token}"},
        )
    assert response.status_code == 200
    assert isinstance(response.json()["data"], list)


@pytest.mark.asyncio
async def test_create_product_unauthorized():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/products/",
            json={
                "name": "Arroz",
                "price": 1.50,
                "unit": "pound",
                "category": "grains",
                "max_per_user": 2,
                "fair_id": "00000000-0000-0000-0000-000000000001",
            },
        )
    assert response.status_code == 403
