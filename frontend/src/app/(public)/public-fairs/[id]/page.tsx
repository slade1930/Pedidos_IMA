// src/app/(public)/public-fairs/[id]/page.tsx

"use client";

import { useParams } from "next/navigation";
import { useFair } from "@/features/fairs/hooks/useFair";
import { FairStatusBadge } from "@/features/fairs/components/FairStatusBadge";

// ─── UTILITARIOS ───────────────────────────────────────────

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-PA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-PA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── COMPONENTE ────────────────────────────────────────────

/**
 * Página Pública de Feria
 * 
 * Ruta: /public-fairs/:id
 * Layout: (public) → PublicLayout
 */
export default function PublicFairPage() {
  const params = useParams();
  const fairId = params.id as string;

  const { data: fair, isPending, isError } = useFair(fairId);

  // ─── LOADING ────────────────────────────────────────
  if (isPending) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  // ─── ERROR ──────────────────────────────────────────
  if (isError || !fair) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900">Feria no encontrada</h1>
        <p className="mt-2 text-sm text-gray-500">La feria que buscas no existe o no está disponible.</p>
      </div>
    );
  }

  // ─── RENDER ─────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex mb-4">
          <FairStatusBadge status={fair.status} size="md" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">{fair.name}</h1>
        {fair.location && (
          <div className="mt-3 flex items-center justify-center gap-1.5 text-gray-500">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <span>{fair.location}</span>
          </div>
        )}
      </div>

      {/* Fechas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-sm text-gray-500 mb-1">Fecha de inicio</p>
          <p className="text-lg font-semibold text-gray-900">{formatDate(fair.start_date)}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-sm text-gray-500 mb-1">Fecha de finalización</p>
          <p className="text-lg font-semibold text-gray-900">{formatDate(fair.end_date)}</p>
        </div>
      </div>

      {/* Descripción */}
      {fair.description && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Acerca de esta feria</h2>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">{fair.description}</p>
        </div>
      )}

      {/* Información adicional */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Información</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">Estado</span>
            <FairStatusBadge status={fair.status} size="sm" />
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">ID de referencia</span>
            <span className="text-sm text-gray-900 font-mono">{fair.id}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-500">Última actualización</span>
            <span className="text-sm text-gray-900">{fair.updated_at ? formatDateTime(fair.updated_at) : "—"}</span>
          </div>
        </div>
      </div>

      {/* Footer informativo */}
      <div className="text-center py-4">
        <p className="text-xs text-gray-400">
          Esta es una página pública de IMA System.{" "}
          <a href="/login" className="text-indigo-600 hover:text-indigo-500">
            Inicia sesión
          </a>{" "}
          para acceder al sistema completo.
        </p>
      </div>
    </div>
  );
}