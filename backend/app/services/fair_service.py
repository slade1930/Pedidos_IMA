import base64
import os
import uuid
from pathlib import Path
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.fair_repository import FairRepository
from app.models.fair_model import Fair
from app.schemas.fair_schema import FairCreateSchema, FairUpdateSchema

# ─── CONFIGURACIÓN ────────────────────────────────────────

# Directorio donde se guardan las imágenes
UPLOAD_DIR = Path("static/images/fairs")

# Extensión por defecto para imágenes
DEFAULT_IMAGE_EXTENSION = "png"


class FairService:

    def __init__(self, db: AsyncSession):
        self.db = db
        self.fair_repo = FairRepository(db)

    async def get_all(self, skip: int = 0, limit: int = 10) -> list[Fair]:
        return await self.fair_repo.get_all(skip, limit)

    async def get_total_count(self) -> int:
        return await self.fair_repo.get_total_count()

    async def create(self, data: FairCreateSchema) -> Fair:
        # 👈 Extraer la imagen Base64 si existe
        image_base64 = data.image_base64
        image_url = None
        
        if image_base64:
            image_url = self._save_base64_image(image_base64, data.name)
        
        # Crear el diccionario de datos sin el campo image_base64
        fair_data = data.model_dump(exclude={"image_base64"})
        fair_data["image_url"] = image_url
        
        fair = Fair(**fair_data)
        return await self.fair_repo.create(fair)

    async def get_by_id(self, fair_id: uuid.UUID) -> Fair:
        fair = await self.fair_repo.get_by_id(fair_id)
        if not fair:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Feria no encontrada",
            )
        return fair

    async def get_active(self) -> list[Fair]:
        return await self.fair_repo.get_active_fairs()

    async def get_upcoming(self) -> list[Fair]:
        return await self.fair_repo.get_upcoming_fairs()

    async def get_by_province(self, province: str) -> list[Fair]:
        return await self.fair_repo.get_by_province(province)

    async def update(self, fair_id: uuid.UUID, data: FairUpdateSchema) -> Fair:
        fair = await self.get_by_id(fair_id)
        
        # 👈 Procesar nueva imagen si se envió
        update_data = data.model_dump(exclude_none=True)
        
        if "image_base64" in update_data:
            image_base64 = update_data.pop("image_base64")
            
            if image_base64:
                # Eliminar imagen anterior si existe
                if fair.image_url:
                    self._delete_image(fair.image_url)
                
                # Guardar nueva imagen
                image_url = self._save_base64_image(image_base64, data.name or fair.name)
                update_data["image_url"] = image_url
            else:
                # Si se envía None, eliminar la imagen
                if fair.image_url:
                    self._delete_image(fair.image_url)
                update_data["image_url"] = None
        
        return await self.fair_repo.update(fair_id, update_data)

    async def deactivate(self, fair_id: uuid.UUID) -> bool:
        return await self.fair_repo.soft_delete(fair_id)

    # ─── MÉTODOS PRIVADOS PARA IMÁGENES ──────────────────

    def _save_base64_image(self, base64_string: str, fair_name: str) -> str:
        """
        Guarda una imagen Base64 en el sistema de archivos.
        Retorna la URL relativa de la imagen.
        """
        try:
            # Decodificar Base64
            image_data = base64.b64decode(base64_string)
            
            # Crear directorio si no existe
            UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
            
            # Generar nombre único para el archivo
            safe_name = fair_name.lower().replace(" ", "-")[:50]
            unique_id = uuid.uuid4().hex[:8]
            filename = f"{safe_name}-{unique_id}.{DEFAULT_IMAGE_EXTENSION}"
            filepath = UPLOAD_DIR / filename
            
            # Guardar archivo
            with open(filepath, "wb") as f:
                f.write(image_data)
            
            # Retornar URL relativa
            return f"/static/images/fairs/{filename}"
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Error al guardar la imagen: {str(e)}",
            )

    def _delete_image(self, image_url: str) -> None:
        """
        Elimina una imagen del sistema de archivos.
        """
        try:
            # Convertir URL relativa a ruta absoluta
            if image_url.startswith("/"):
                filepath = Path(image_url.lstrip("/"))
            else:
                filepath = Path(image_url)
            
            # Eliminar archivo si existe
            if filepath.exists():
                filepath.unlink()
        except Exception as e:
            # Loguear error pero no detener el flujo
            print(f"Error al eliminar imagen {image_url}: {e}")