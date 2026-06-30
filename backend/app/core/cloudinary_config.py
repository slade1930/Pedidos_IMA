# app/core/cloudinary_config.py
import cloudinary
import os
from app.utils.logger import log


def init_cloudinary():
    """Inicializa la configuración de Cloudinary"""
    
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME", "jzzpsfo1")
    api_key = os.getenv("CLOUDINARY_API_KEY", "924245547215195")
    api_secret = os.getenv("CLOUDINARY_API_SECRET", "")
    
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
