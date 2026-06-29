# app/api/routes/notifications.py
from fastapi import APIRouter, Depends
from app.api.dependencies.auth_dependencies import get_current_staff
from app.models.user_model import User
from app.schemas.response_schema import ResponseSchema

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/health", response_model=ResponseSchema)
async def notifications_health(
    _: User = Depends(get_current_staff),
):
    return ResponseSchema(message="Servicio de notificaciones activo")
