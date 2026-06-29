# app/models/__init__.py

from app.models.user_model import User
from app.models.fair_model import Fair
from app.models.product_model import Product
from app.models.inventory_model import Inventory
from app.models.order_model import Order
from app.models.order_item_model import OrderItem
from app.models.payment_model import Payment

__all__ = [
    "User",
    "Fair",
    "Product",
    "Inventory",
    "Order",
    "OrderItem",
    "Payment",
]
