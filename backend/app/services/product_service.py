# app/services/product_service.py
import base64
import uuid
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import cloudinary.uploader  # 👈 NUEVO
from app.repositories.product_repository import ProductRepository
from app.repositories.fair_repository import FairRepository
from app.models.product_model import Product
from app.schemas.product_schema import ProductCreateSchema, ProductUpdateSchema


class ProductService:

    def __init__(self, db: AsyncSession):
        self.db = db
        self.product_repo = ProductRepository(db)
        self.fair_repo = FairRepository(db)

    async def get_all(self, skip: int = 0, limit: int = 10) -> list[Product]:
        return await self.product_repo.get_all(skip, limit)

    async def get_total_count(self) -> int:
        return await self.product_repo.get_total_count()

    async def create(self, data: ProductCreateSchema) -> Product:
        # Verificar que la feria existe
        fair = await self.fair_repo.get_by_id(data.fair_id)
        if not fair:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Feria no encontrada",
            )

        # Extraer imagen Base64 si existe
        image_base64 = data.image_base64
        image_url = None
        
        if image_base64:
            image_url = self._save_base64_image(image_base64, data.name, data.sku)
        
        # Crear diccionario sin image_base64
        product_data = data.model_dump(exclude={"image_base64"})
        product_data["image_url"] = image_url

        product = Product(**product_data)
        return await self.product_repo.create(product)

    async def get_by_id(self, product_id: uuid.UUID) -> Product:
        product = await self.product_repo.get_by_id(product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado",
            )
        return product

    async def get_by_fair(self, fair_id: uuid.UUID) -> list[Product]:
        return await self.product_repo.get_by_fair(fair_id)

    async def get_by_category(self, category: str, fair_id: uuid.UUID) -> list[Product]:
        return await self.product_repo.get_by_category(category, fair_id)

    async def update(self, product_id: uuid.UUID, data: ProductUpdateSchema) -> Product:
        product = await self.get_by_id(product_id)
        
        # Procesar nueva imagen si se envió
        update_data = data.model_dump(exclude_none=True)
        
        if "image_base64" in update_data:
            image_base64 = update_data.pop("image_base64")
            
            if image_base64:
                # Eliminar imagen anterior si existe
                if product.image_url:
                    self._delete_image(product.image_url)
                
                # Guardar nueva imagen
                image_url = self._save_base64_image(
                    image_base64, 
                    data.name or product.name, 
                    data.sku or product.sku
                )
                update_data["image_url"] = image_url
            else:
                # Si se envía vacío, eliminar la imagen
                if product.image_url:
                    self._delete_image(product.image_url)
                update_data["image_url"] = None
        
        return await self.product_repo.update(product_id, update_data)

    async def deactivate(self, product_id: uuid.UUID) -> bool:
        return await self.product_repo.soft_delete(product_id)

    # ─── MÉTODOS PRIVADOS PARA IMÁGENES (CLOUDINARY) ────

    def _save_base64_image(self, base64_string: str, product_name: str, sku: str) -> str:
        """
        Sube una imagen Base64 a Cloudinary.
        Retorna la URL segura (HTTPS) de la imagen.
        """
        try:
            # Generar nombre único
            safe_name = product_name.lower().replace(" ", "-")[:30]
            safe_sku = sku.lower().replace(" ", "-")[:20]
            unique_id = uuid.uuid4().hex[:8]
            
            # Subir a Cloudinary
            result = cloudinary.uploader.upload(
                f"data:image/png;base64,{base64_string}",
                folder="products",
                public_id=f"{safe_name}-{safe_sku}-{unique_id}",
                overwrite=True,
                resource_type="image",
            )
            
            # Retornar URL segura (HTTPS)
            return result["secure_url"]
            
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Error al subir la imagen: {str(e)}",
            )

    def _delete_image(self, image_url: str) -> None:
        """
        Elimina una imagen de Cloudinary.
        """
        try:
            # Verificar que sea una URL de Cloudinary
            if "cloudinary.com" in image_url:
                # Extraer public_id de la URL
                parts = image_url.split("/")
                upload_index = next((i for i, p in enumerate(parts) if p == "upload"), -1)
                if upload_index != -1:
                    public_id_parts = parts[upload_index + 1:]
                    public_id = "/".join(public_id_parts).rsplit(".", 1)[0]
                    
                    cloudinary.uploader.destroy(public_id)
        except Exception as e:
            print(f"Error al eliminar imagen {image_url}: {e}")
