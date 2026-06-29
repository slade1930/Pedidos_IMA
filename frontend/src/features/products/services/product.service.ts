// src/features/products/services/product.service.ts

import { apiClient } from "@/lib/api/client";
import type {
  Product,
  CreateProductPayload,
  UpdateProductPayload,
  ProductsResponse,
  ProductFilters,
} from "@/features/products/types/product.types";

// ─── HELPER: Convertir File a Base64 ──────────────────────

/**
 * Convierte un archivo de imagen a string Base64 puro (sin el prefijo data:image/...)
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // reader.result viene como "data:image/png;base64,xxxxx"
      // Solo necesitamos la parte base64
      const base64String = (reader.result as string).split(",")[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── SERVICIO DE PRODUCTOS ────────────────────────────────

export const productService = {
  /**
   * Obtiene lista paginada de productos con filtros opcionales.
   * 
   * GET /api/v1/products
   */
  async getProducts(filters?: ProductFilters): Promise<ProductsResponse> {
    const params = new URLSearchParams();

    if (filters?.search) params.set("search", filters.search);
    if (filters?.category) params.set("category", filters.category);
    if (filters?.is_active !== undefined) params.set("is_active", String(filters.is_active));
    if (filters?.min_price !== undefined) params.set("min_price", String(filters.min_price));
    if (filters?.max_price !== undefined) params.set("max_price", String(filters.max_price));
    if (filters?.skip !== undefined) params.set("skip", String(filters.skip));
    if (filters?.limit !== undefined) params.set("limit", String(filters.limit));

    const queryString = params.toString();
    const endpoint = queryString ? `/products?${queryString}` : "/products";

    const response = await apiClient.get<ProductsResponse>(endpoint);
    return response.data;
  },

  /**
   * Obtiene un producto por su ID.
   * 
   * GET /api/v1/products/{id}
   */
  async getProduct(id: string): Promise<Product> {
    const response = await apiClient.get<Product>(`/products/${id}`);
    return response.data;
  },

  /**
   * Crea un nuevo producto.
   * Convierte la imagen a Base64 antes de enviar.
   * 
   * POST /api/v1/products
   */
  async createProduct(data: CreateProductPayload): Promise<Product> {
    // Crear una copia del payload para no mutar el original
    const payload: Record<string, unknown> = { ...data };

    // 👈 Si hay imagen, convertirla a Base64
    if (data.image && data.image instanceof File) {
      const base64Image = await fileToBase64(data.image);
      payload.image_base64 = base64Image;
      delete payload.image; // Eliminar el File, no se puede enviar en JSON
    } else {
      delete payload.image; // Eliminar si es null/undefined
    }

    const response = await apiClient.post<Product>("/products", payload);
    return response.data;
  },

  /**
   * Actualiza un producto existente.
   * Convierte la imagen a Base64 antes de enviar.
   * 
   * PUT /api/v1/products/{id}
   */
  async updateProduct(id: string, data: UpdateProductPayload): Promise<Product> {
    // Crear una copia del payload
    const payload: Record<string, unknown> = { ...data };

    // 👈 Si hay imagen, convertirla a Base64
    if (data.image && data.image instanceof File) {
      const base64Image = await fileToBase64(data.image);
      payload.image_base64 = base64Image;
      delete payload.image;
    } else {
      delete payload.image;
    }

    const response = await apiClient.put<Product>(`/products/${id}`, payload);
    return response.data;
  },

  /**
   * Elimina un producto.
   * 
   * DELETE /api/v1/products/{id}
   */
  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  },
};

export default productService;