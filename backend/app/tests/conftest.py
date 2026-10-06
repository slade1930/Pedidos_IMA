# app/tests/conftest.py
from datetime import datetime, timedelta
import uuid

import httpx
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.constants import FairStatus
from app.core.database import Base, get_db
from app.core.security import hash_password
from app.main import app
from app.models.fair_model import Fair
from app.models.inventory_model import Inventory
from app.models.product_model import Product, ProductCategory, ProductUnit
from app.models.user_model import User, UserRole

# Base de datos en memoria solo para tests
# StaticPool: una única conexión compartida (clave para :memory: con async)
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine_test = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
    poolclass=StaticPool,
    connect_args={"check_same_thread": False},
)

AsyncSessionTest = async_sessionmaker(
    bind=engine_test,
    class_=AsyncSession,
    expire_on_commit=False,
)


# Sobreescribir la dependencia de DB con la de tests
async def override_get_db():
    async with AsyncSessionTest() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


app.dependency_overrides[get_db] = override_get_db


FAIR_ID = uuid.UUID("00000000-0000-0000-0000-000000000001")
PRODUCT_ID = uuid.UUID("00000000-0000-0000-0000-000000000002")
PRODUCT_ID_2 = uuid.UUID("00000000-0000-0000-0000-000000000003")

SEED_USERS = [
    {
        "id": uuid.UUID("00000000-0000-0000-0000-00000000000a"),
        "email": "admin@itas.gob.pa",
        "password": "Admin1234",
        "full_name": "Admin Test",
        "cedula": "8-000-0001",
        "role": UserRole.ADMIN,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-00000000000b"),
        "email": "staff@itas.gob.pa",
        "password": "Staff1234",
        "full_name": "Staff Test",
        "cedula": "8-000-0002",
        "role": UserRole.STAFF,
    },
    {
        "id": uuid.UUID("00000000-0000-0000-0000-00000000000c"),
        "email": "cliente@itas.gob.pa",
        "password": "Cliente1234",
        "full_name": "Cliente Test",
        "cedula": "8-000-0003",
        "role": UserRole.CLIENT,
    },
]


async def seed_database() -> None:
    """Crea las tablas y siembra usuarios/feria/producto/inventario de prueba."""
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionTest() as session:
        for data in SEED_USERS:
            user = User(
                id=data["id"],
                email=data["email"],
                full_name=data["full_name"],
                cedula=data["cedula"],
                hashed_password=hash_password(data["password"]),
                role=data["role"],
            )
            session.add(user)

        fair = Fair(
            id=FAIR_ID,
            name="Feria de Prueba",
            location="Panamá",
            province="Panamá",
            status=FairStatus.ACTIVE,
            start_date=datetime.utcnow() - timedelta(days=1),
            end_date=datetime.utcnow() + timedelta(days=30),
            max_orders=500,
        )
        session.add(fair)

        product = Product(
            id=PRODUCT_ID,
            fair_id=FAIR_ID,
            name="Arroz",
            sku="SKU-TEST-001",
            price=1.50,
            unit=ProductUnit.POUND,
            category=ProductCategory.GRAINS,
            max_per_user=5,
        )
        session.add(product)

        product2 = Product(
            id=PRODUCT_ID_2,
            fair_id=FAIR_ID,
            name="Frijol",
            sku="SKU-TEST-002",
            price=2.00,
            unit=ProductUnit.POUND,
            category=ProductCategory.GRAINS,
            max_per_user=10,
        )
        session.add(product2)

        inventory = Inventory(
            product_id=PRODUCT_ID,
            fair_id=FAIR_ID,
            total_stock=100,
            reserved_stock=0,
            delivered_stock=0,
            low_stock_threshold=10,
        )
        session.add(inventory)

        inventory2 = Inventory(
            product_id=PRODUCT_ID_2,
            fair_id=FAIR_ID,
            total_stock=2,
            reserved_stock=0,
            delivered_stock=0,
            low_stock_threshold=10,
        )
        session.add(inventory2)

        await session.commit()


@pytest.fixture(scope="session", autouse=True)
async def setup_database():
    await seed_database()
    yield
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


# Cliente HTTP reutilizable
@pytest.fixture
async def client():
    transport = httpx.ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac