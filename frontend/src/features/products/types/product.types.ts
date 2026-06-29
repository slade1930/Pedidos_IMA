// src/features/products/types/product.types.ts

// ─── UNIDADES Y CATEGORÍAS ────────────────────────────────

export type ProductUnit = "pound" | "kilogram" | "unit" | "dozen" | "bag";

export type ProductCategory = "vegetables" | "fruits" | "grains" | "meats" | "dairy" | "other";

// ─── PRODUCTO ─────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  image_url: string | null;
  price: number;
  unit: ProductUnit;
  category: ProductCategory;
  max_per_user: number;
  fair_id: string;
  is_available: boolean;
  is_featured: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// ─── CREAR PRODUCTO ───────────────────────────────────────

export interface CreateProductPayload {
  name: string;
  sku?: string;  // 👈 Agregado (el backend lo requiere)
  description?: string | null;
  image?: File | null;  // 👈 NUEVO: Imagen para subir
  price: number;
  unit: ProductUnit;
  category: ProductCategory;
  max_per_user?: number;
  fair_id: string;
}

// ─── ACTUALIZAR PRODUCTO ──────────────────────────────────

export interface UpdateProductPayload {
  name?: string;
  sku?: string;  // 👈 Agregado
  description?: string | null;
  image?: File | null;  // 👈 NUEVO: Imagen para subir/actualizar
  price?: number;
  unit?: ProductUnit;
  category?: ProductCategory;
  max_per_user?: number;
  is_active?: boolean;
}

// ─── RESPUESTAS ───────────────────────────────────────────

export interface ProductsResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ProductResponse {
  success: boolean;
  message: string;
  data: Product;
}

// ─── FILTROS ──────────────────────────────────────────────

export interface ProductFilters {
  search?: string;
  category?: string;
  is_active?: boolean;
  min_price?: number;
  max_price?: number;
  skip?: number;
  limit?: number;
}