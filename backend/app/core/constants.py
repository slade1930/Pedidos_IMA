from enum import Enum


# Roles
class UserRole(str, Enum):
    ADMIN = "admin"
    STAFF = "staff"
    CLIENT = "client"


# Estado pedidos
class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    READY = "ready"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    EXPIRED = "expired"


# Métodos pago
class PaymentMethod(str, Enum):
    YAPPY = "yappy"
    CARD = "card"
    CASH = "cash"


# Estado pagos
class PaymentStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


# Ferias
class FairStatus(str, Enum):
    UPCOMING = "upcoming"
    ACTIVE = "active"
    PAUSED = "paused"
    FINISHED = "finished"
    CANCELLED = "cancelled"


# Configuración global
class SystemLimits:
    MAX_PRODUCTS_PER_ORDER = 10
    MAX_ORDERS_PER_USER_PER_FAIR = 1
    QR_EXPIRY_MINUTES = 60
