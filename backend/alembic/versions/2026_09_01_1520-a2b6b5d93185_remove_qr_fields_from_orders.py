"""remove qr fields from orders

Revision ID: a2b6b5d93185
Revises: 6b0754765a92
Create Date: 2026-09-01 15:20:00.000000+00:00

Se elimina el soporte QR (qr_token / qr_used): el sistema ahora usa
el código de retiro (pickup_code) en lugar de escaneo de QR.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "a2b6b5d93185"
down_revision: Union[str, Sequence[str], None] = "6b0754765a92"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # qr_token tenía unique=True (UNIQUE constraint, no índice) y qr_used Boolean.
    op.drop_column("orders", "qr_used")
    op.drop_column("orders", "qr_token")


def downgrade() -> None:
    """Downgrade schema."""
    op.add_column("orders", sa.Column("qr_token", sa.String(length=500), nullable=True))
    op.add_column("orders", sa.Column("qr_used", sa.Boolean(), nullable=False, server_default=sa.text("0")))
    op.create_unique_constraint("orders_qr_token_key", "orders", ["qr_token"])