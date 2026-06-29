# app/schemas/__init__.py
from app.schemas.response_schema import (
    ResponseSchema,
    PaginatedResponseSchema,
    ErrorResponseSchema,
)
from app.schemas.auth_schema import (
    LoginSchema,
    TokenSchema,
    TokenPayloadSchema,
    RefreshTokenSchema,
    ChangePasswordSchema,
)
from app.schemas.user_schema import (
    UserCreateSchema,
    UserUpdateSchema,
    UserResponseSchema,
    UserAdminUpdateSchema,
)
from app.schemas.fair_schema import (
    FairCreateSchema,
    FairUpdateSchema,
    FairResponseSchema,
)
from app.schemas.product_schema import (
    ProductCreateSchema,
    ProductUpdateSchema,
    ProductResponseSchema,
)
from app.schemas.inventory_schema import (
    InventoryCreateSchema,
    InventoryUpdateSchema,
    InventoryResponseSchema,
)
from app.schemas.order_schema import (
    OrderCreateSchema,
    OrderItemCreateSchema,
    OrderStatusUpdateSchema,
    OrderItemResponseSchema,
    OrderResponseSchema,
)
from app.schemas.payment_schema import (
    PaymentCreateSchema,
    PaymentUpdateSchema,
    PaymentResponseSchema,
)
