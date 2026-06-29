// src/features/fairs/types/fair.types.ts

// ─── ESTADOS DE FERIA ─────────────────────────────────────

/** Estados posibles de una feria */
export type FairStatus = "upcoming" | "active" | "paused" | "finished" | "cancelled";

// ─── FERIA ────────────────────────────────────────────────

/**
 * Estructura completa de una feria retornada por el backend.
 * 
 * GET /api/v1/fairs/{id}
 * GET /api/v1/fairs (elemento del array data)
 */
export interface Fair {
  id: string;
  name: string;
  description: string;
  location: string;
  province: string;
  start_date: string;
  end_date: string;
  max_orders: number;
  status: FairStatus;
  is_active: boolean;
  image_url?: string | null;  // 👈 NUEVO: URL de la imagen de la feria
  created_at: string;
  updated_at?: string;
}

// ─── CREAR FERIA ──────────────────────────────────────────

/**
 * Datos requeridos para crear una nueva feria.
 * 
 * POST /api/v1/fairs
 */
export interface CreateFairPayload {
  name: string;
  description: string;
  location: string;
  province: string;
  start_date: string;
  end_date: string;
  max_orders?: number;
  status?: FairStatus;
  image?: File | null;  // 👈 NUEVO: Imagen para subir (File del input)
}

// ─── ACTUALIZAR FERIA ─────────────────────────────────────

/**
 * Datos para actualizar una feria existente.
 * Todos los campos son opcionales.
 * 
 * PUT /api/v1/fairs/{id}
 */
export interface UpdateFairPayload {
  name?: string;
  description?: string;
  location?: string;
  province?: string;
  start_date?: string;
  end_date?: string;
  max_orders?: number;
  status?: FairStatus;
  is_active?: boolean;
  image?: File | null;  // 👈 NUEVO: Nueva imagen para subir (File del input)
}

// ─── RESPUESTAS ───────────────────────────────────────────

/** Respuesta paginada de ferias */
export interface FairsResponse {
  success: boolean;
  message: string;
  data: Fair[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

/** Respuesta al crear/actualizar una feria */
export interface FairResponse {
  success: boolean;
  message: string;
  data: Fair;
}

// ─── FILTROS ──────────────────────────────────────────────

/** Filtros aceptados por GET /api/v1/fairs */
export interface FairFilters {
  search?: string;
  status?: FairStatus;
  start_date?: string;
  end_date?: string;
  skip?: number;
  limit?: number;
}