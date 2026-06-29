// src/features/fairs/services/fair.service.ts

import { apiClient } from "@/lib/api/client";
import type {
  Fair,
  CreateFairPayload,
  UpdateFairPayload,
  FairsResponse,
  FairFilters,
} from "@/features/fairs/types/fair.types";

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

// ─── SERVICIO DE FERIAS ───────────────────────────────────

export const fairService = {
  /**
   * Obtiene lista paginada de ferias con filtros opcionales.
   * 
   * GET /api/v1/fairs
   */
  async getFairs(filters?: FairFilters): Promise<FairsResponse> {
    const params = new URLSearchParams();

    if (filters?.search) params.set("search", filters.search);
    if (filters?.status) params.set("status", filters.status);
    if (filters?.start_date) params.set("start_date", filters.start_date);
    if (filters?.end_date) params.set("end_date", filters.end_date);
    if (filters?.skip !== undefined) params.set("skip", String(filters.skip));
    if (filters?.limit !== undefined) params.set("limit", String(filters.limit));

    const queryString = params.toString();
    const endpoint = queryString ? `/fairs?${queryString}` : "/fairs";

    const response = await apiClient.get<FairsResponse>(endpoint);
    return response.data;
  },

  /**
   * Obtiene una feria por su ID.
   * 
   * GET /api/v1/fairs/{id}
   */
  async getFair(id: string): Promise<Fair> {
    const response = await apiClient.get<Fair>(`/fairs/${id}`);
    return response.data;
  },

  /**
   * Crea una nueva feria.
   * Convierte la imagen a Base64 antes de enviar.
   * 
   * POST /api/v1/fairs
   */
  async createFair(data: CreateFairPayload): Promise<Fair> {
    // Crear una copia del payload para no mutar el original
    const payload: Record<string, unknown> = { ...data };

    // Si hay imagen, convertirla a Base64
    if (data.image && data.image instanceof File) {
      const base64Image = await fileToBase64(data.image);
      payload.image_base64 = base64Image;
      delete payload.image; // Eliminar el File, no se puede enviar en JSON
    } else {
      delete payload.image; // Eliminar si es null/undefined
    }

    const response = await apiClient.post<Fair>("/fairs", payload);
    return response.data;
  },

  /**
   * Actualiza una feria existente.
   * Convierte la imagen a Base64 antes de enviar.
   * 
   * PUT /api/v1/fairs/{id}
   */
  async updateFair(id: string, data: UpdateFairPayload): Promise<Fair> {
    // Crear una copia del payload
    const payload: Record<string, unknown> = { ...data };

    // Si hay imagen, convertirla a Base64
    if (data.image && data.image instanceof File) {
      const base64Image = await fileToBase64(data.image);
      payload.image_base64 = base64Image;
      delete payload.image;
    } else {
      delete payload.image;
    }

    const response = await apiClient.put<Fair>(`/fairs/${id}`, payload);
    return response.data;
  },

  /**
   * Elimina una feria.
   * 
   * DELETE /api/v1/fairs/{id}
   */
  async deleteFair(id: string): Promise<void> {
    await apiClient.delete(`/fairs/${id}`);
  },
};

export default fairService;