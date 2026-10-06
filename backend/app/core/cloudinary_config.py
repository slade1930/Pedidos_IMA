# app/core/cloudinary_config.py
import cloudinary
from app.core.config import settings
from app.utils.logger import log


def init_cloudinary():
    """Inicializa la configuración de Cloudinary"""
    
    cloud_name = settings.CLOUDINARY_CLOUD_NAME
    api_key = settings.CLOUDINARY_API_KEY
    api_secret = settings.CLOUDINARY_API_SECRET
    
    log.info(f"☁️  Configurando Cloudinary - cloud_name: {cloud_name}")
    
    if not api_secret:
        log.warning("⚠️  CLOUDINARY_API_SECRET no configurado")
        return
    
    cloudinary.config(
        cloud_name=cloud_name,
        api_key=api_key,
        api_secret=api_secret,
        secure=True,
    )
    
    log.info("✅ Cloudinary inicializado correctamente")
