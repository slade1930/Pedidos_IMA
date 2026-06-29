# app/services/qr_service.py

import uuid
from io import BytesIO
from datetime import datetime, timezone, timedelta

import qrcode

from jose import jwt, JWTError

from app.core.config import settings


class QRService:

    @staticmethod
    def generate_qr_token(
        order_id: uuid.UUID,
    ) -> str:

        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.QR_EXPIRY_MINUTES
        )

        payload = {
            "sub": str(order_id),
            "type": "qr",
            "exp": expire,
            "iat": datetime.now(timezone.utc),
        }

        return jwt.encode(
            payload,
            settings.SECRET_KEY,
            algorithm=settings.ALGORITHM,
        )

    @staticmethod
    def decode_qr_token(
        token: str,
    ) -> dict | None:

        try:
            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=[settings.ALGORITHM],
            )

            if payload.get("type") != "qr":
                return None

            return payload

        except JWTError:
            return None

    @staticmethod
    def generate_qr_image(
        data: str,
    ) -> str:

        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=10,
            border=4,
        )

        qr.add_data(data)
        qr.make(fit=True)

        img = qr.make_image(
            fill_color="black",
            back_color="white",
        )

        buffer = BytesIO()

        img.save(buffer, format="PNG")

        buffer.seek(0)

        return "data:image/png;base64," + buffer.getvalue().hex()

    @staticmethod
    def is_qr_expired(
        token: str,
    ) -> bool:

        payload = QRService.decode_qr_token(token)

        return payload is None
