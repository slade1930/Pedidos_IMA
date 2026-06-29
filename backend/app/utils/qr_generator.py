# app/utils/qr_generator.py
import qrcode
import base64
import uuid
from io import BytesIO
from datetime import datetime, timezone


def generate_qr_token(order_id: uuid.UUID) -> str:
    timestamp = datetime.now(timezone.utc).isoformat()
    raw = f"{order_id}:{timestamp}:{uuid.uuid4()}"
    return base64.urlsafe_b64encode(raw.encode()).decode()


def generate_qr_image_base64(data: str) -> str:
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)

    b64 = base64.b64encode(buffer.getvalue()).decode()
    return f"data:image/png;base64,{b64}"


def decode_qr_token(token: str) -> dict | None:
    try:
        decoded = base64.urlsafe_b64decode(token.encode()).decode()
        parts = decoded.split(":")
        return {
            "order_id": parts[0],
            "timestamp": ":".join(parts[1:4]),
            "nonce": parts[4] if len(parts) > 4 else None,
        }
    except Exception:
        return None
