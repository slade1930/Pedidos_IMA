// src/features/inventory/types/inventory.types.ts

// ─── INVENTARIO ───────────────────────────────────────────

export interface InventoryItem {
  id: string;
  product_id: string;
  product_name?: string;  // 👈 NUEVO
  fair_id: string;
  total_stock: number;
  reserved_stock: number;
  delivered_stock: number;
  available_stock: number;
  low_stock_threshold: number;
  is_available: boolean;
  notes: string | null;
  created_at?: string;
  updated_at?: string;
}

// ─── CREAR REGISTRO ───────────────────────────────────────

export interface CreateInventoryPayload {
  product_id: string;
  fair_id: string;
  total_stock: number;
  notes?: string | null;
}

// ─── ACTUALIZAR STOCK ─────────────────────────────────────

export interface UpdateStockPayload {
  total_stock?: number;
  notes?: string | null;
}

// ─── RESPUESTAS ───────────────────────────────────────────

export interface InventoryResponse {
  data: InventoryItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// ─── FILTROS ──────────────────────────────────────────────

export interface InventoryFilters {
  search?: string;
  fair_id?: string;
  low_stock?: boolean;
  skip?: number;
  limit?: number;
}
