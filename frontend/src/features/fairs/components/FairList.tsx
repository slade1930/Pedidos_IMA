// src/features/fairs/components/FairList.tsx

"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { useFairs } from "@/features/fairs/hooks/useFairs";
import { FairStatusBadge } from "./FairStatusBadge";
import type { Fair, FairStatus } from "@/features/fairs/types/fair.types";

// ─── CONSTANTES ────────────────────────────────────────────

const PAGE_SIZE = 9;
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─── PROPS ─────────────────────────────────────────────────

interface FairListProps {
  onEdit?: (fair: Fair) => void;
  onDelete?: (fair: Fair) => void;
  search?: string;
  statusFilter?: string;
}

// ─── UTILITARIOS DE DISEÑO ─────────────────────────────────

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-PA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getStatusBadgeClass(status: FairStatus): string {
  switch (status) {
    case "upcoming":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200/40 dark:border-amber-500/20";
    case "active":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-450 border-emerald-200/40 dark:border-emerald-500/20";
    case "paused":
      return "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200/40 dark:border-orange-500/20";
    case "finished":
      return "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-200/40 dark:border-sky-500/20";
    case "cancelled":
      return "bg-rose-500/10 text-rose-700 dark:text-rose-450 border-rose-200/40 dark:border-rose-500/20";
    default:
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-350 border-slate-200/40 dark:border-slate-800";
  }
}

function getStatusLabel(status: FairStatus): string {
  switch (status) {
    case "upcoming":
      return "Próxima";
    case "active":
      return "Activa";
    case "paused":
      return "Pausada";
    case "finished":
      return "Finalizada";
    case "cancelled":
      return "Cancelada";
    default:
      return status;
  }
}

function getGradientColors(status: FairStatus): { from: string; to: string } {
  switch (status) {
    case "active":
      return { from: "#10b981", to: "#06b6d4" };
    case "upcoming":
      return { from: "#f59e0b", to: "#ec4899" };
    case "paused":
      return { from: "#f97316", to: "#ef4444" };
    case "finished":
      return { from: "#3b82f6", to: "#6366f1" };
    case "cancelled":
      return { from: "#ec4899", to: "#f43f5e" };
    default:
      return { from: "#6366f1", to: "#a855f7" };
  }
}

function getFallbackImage(id: string): string {
  const images = [
    "https://images.unsplash.com/photo-1531058020387-3be344559be6?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=600&q=80",
  ];
  const index = id ? id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % images.length : 0;
  return images[index];
}

// 👈 FUNCIÓN PARA CONSTRUIR URL COMPLETA DE IMAGEN
function getImageUrl(fair: Fair): string {
  if (fair.image_url) {
    // Si ya es una URL completa (http/https), usarla directamente
    if (fair.image_url.startsWith("http")) {
      return fair.image_url;
    }
    // Si es ruta relativa, agregar la URL del backend
    return `${API_URL}${fair.image_url}`;
  }
  // Fallback a imagen de Unsplash
  return getFallbackImage(fair.id);
}

// ─── SKELETON EN CUADRÍCULA ────────────────────────────────

function ListSkeleton() {
  return (
    <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="relative w-full p-5 border border-slate-250/20 dark:border-slate-800 rounded-3xl bg-white/40 dark:bg-slate-900/20 backdrop-blur-md flex flex-col justify-between aspect-[4/5]">
          <div>
            <div className="w-full aspect-[16/10] bg-slate-200/50 dark:bg-slate-800/50 rounded-2xl mb-4" />
            <div className="h-5 w-2/3 bg-slate-200/50 dark:bg-slate-800/50 rounded-md mb-2" />
            <div className="h-3.5 w-1/2 bg-slate-200/30 dark:bg-slate-800/30 rounded-md mb-6" />
            <div className="space-y-3">
              <div className="h-3 w-full bg-slate-200/20 dark:bg-slate-800/20 rounded" />
              <div className="h-3 w-full bg-slate-200/20 dark:bg-slate-800/20 rounded" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <div className="h-8 w-16 bg-slate-200/40 dark:bg-slate-800/40 rounded-xl" />
            <div className="h-8 w-16 bg-slate-200/30 dark:bg-slate-800/30 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ──────────────────────────────────

export function FairList({ onEdit, onDelete, search, statusFilter }: FairListProps) {
  const [skip, setSkip] = useState(0);
  const page = Math.floor(skip / PAGE_SIZE) + 1;

  const filters = {
    skip,
    limit: PAGE_SIZE,
    ...(search && { search }),
    ...(statusFilter && statusFilter !== "" && { status: statusFilter as FairStatus }),
  };

  const { data, isPending, isError, error, isFetching } = useFairs(filters);

  const fairs = Array.isArray(data) ? data : data?.data ?? [];
  const totalPages = !Array.isArray(data) ? data?.pages ?? 1 : 1;
  const totalItems = !Array.isArray(data) ? data?.total ?? fairs.length : fairs.length;

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 300, damping: 25 } 
    },
  };

  return (
    <div className="space-y-8 w-full">
      {isPending && <ListSkeleton />}

      {isError && !isPending && (
        <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center flex flex-col items-center justify-center backdrop-blur-md">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-red-50 dark:bg-red-950/30 text-red-650 dark:text-red-400 mb-4 border border-red-200/50 dark:border-red-900/50">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-red-700 dark:text-red-405 font-bold text-lg leading-none">Error al cargar ferias</p>
          <p className="text-xs text-neutral-400 mt-2.5 max-w-xs mx-auto">
            {(error as { message?: string })?.message || "Intenta nuevamente"}
          </p>
        </div>
      )}

      {!isPending && !isError && fairs.length === 0 && (
        <div className="rounded-3xl border border-slate-200/50 dark:border-slate-800 bg-white/70 dark:bg-slate-950/40 backdrop-blur p-16 text-center flex flex-col items-center justify-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 mb-4 relative border border-slate-200 dark:border-slate-850">
            <div className="absolute inset-0 rounded-2xl bg-slate-400/10 animate-ping opacity-25" />
            <svg className="mx-auto h-7 w-7 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72l1.189-1.19A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72M6.75 18h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .414.336.75.75.75z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-white leading-none">No hay ferias</h3>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 max-w-[240px] mx-auto">No se encontraron ferias con los filtros actuales.</p>
        </div>
      )}

      {/* Grid del Listado de Tarjetas */}
      {!isPending && !isError && fairs.length > 0 && (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-4"
        >
          {fairs.map((fair) => {
            const { from, to } = getGradientColors(fair.status);
            const imageUrl = getImageUrl(fair); // 👈 Usar la función corregida

            return (
              <motion.div 
                key={fair.id} 
                variants={itemVariants}
                className="group relative w-full transition-all duration-500"
              >
                {/* Paneles traseros Skew */}
                <span
                  className="absolute top-0 left-[20px] w-[calc(100%-40px)] h-full rounded-3xl transform skew-x-[6deg] transition-all duration-500 group-hover:skew-x-0 group-hover:left-0 group-hover:w-full"
                  style={{
                    background: `linear-gradient(315deg, ${from}, ${to})`,
                  }}
                />
                <span
                  className="absolute top-0 left-[20px] w-[calc(100%-40px)] h-full rounded-3xl transform skew-x-[6deg] blur-[22px] opacity-60 transition-all duration-500 group-hover:skew-x-0 group-hover:left-0 group-hover:w-full"
                  style={{
                    background: `linear-gradient(315deg, ${from}, ${to})`,
                  }}
                />

                {/* Blobs de Cristal Flotantes en Hover */}
                <span className="pointer-events-none absolute inset-0 z-10">
                  <span className="absolute top-0 left-0 w-0 h-0 rounded-2xl opacity-0 bg-white/10 dark:bg-white/5 backdrop-blur-[8px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all duration-500 ease-out animate-blob-custom group-hover:top-[-45px] group-hover:left-[45px] group-hover:w-[70px] group-hover:h-[70px] group-hover:opacity-100" />
                  <span className="absolute bottom-0 right-0 w-0 h-0 rounded-2xl opacity-0 bg-white/10 dark:bg-white/5 backdrop-blur-[8px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all duration-500 ease-out animate-blob-custom animation-delay-2000 group-hover:bottom-[-45px] group-hover:right-[45px] group-hover:w-[70px] group-hover:h-[70px] group-hover:opacity-100" />
                </span>

                {/* Contenido (Glassmorphic) */}
                <div className="relative z-20 w-full p-5 bg-white/90 dark:bg-slate-950/85 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/80 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.01)] transition-all duration-500 group-hover:bg-white/95 group-hover:dark:bg-slate-950/95 group-hover:border-transparent dark:group-hover:border-transparent group-hover:translate-y-[-4px] flex flex-col justify-between h-full min-h-[440px]">
                  
                  <div>
                    {/* Imagen con overlay de estado */}
                    <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden mb-4 border border-slate-100 dark:border-slate-900/60 shadow-inner">
                      <img 
                        src={imageUrl} 
                        alt={fair.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                        onError={(e) => {
                          // Si falla la carga, usar fallback
                          (e.target as HTMLImageElement).src = getFallbackImage(fair.id);
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-slate-950/10 to-transparent" />
                      
                      {/* Estado overlay */}
                      <div className="absolute top-3 right-3 z-30">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide capitalize backdrop-blur-md shadow-md border ${getStatusBadgeClass(fair.status)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            fair.status === "active" ? "bg-emerald-500 animate-pulse" :
                            fair.status === "upcoming" ? "bg-amber-500" :
                            fair.status === "paused" ? "bg-orange-500" :
                            fair.status === "finished" ? "bg-sky-500" :
                            "bg-rose-500"
                          }`} />
                          {getStatusLabel(fair.status)}
                        </span>
                      </div>
                    </div>

                    {/* Nombre & Dirección */}
                    <div className="mb-3">
                      <h4 className="text-lg font-extrabold text-slate-900 dark:text-white truncate group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                        {fair.name}
                      </h4>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 truncate">
                        {fair.location}, {fair.province}
                      </p>
                    </div>

                    {/* Descripción Corta */}
                    {fair.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4 font-normal">
                        {fair.description}
                      </p>
                    )}
                  </div>

                  <div>
                    {/* Detalles Técnicos */}
                    <div className="space-y-2.5 pb-4 border-b border-slate-100 dark:border-slate-900/50">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="uppercase tracking-wider text-slate-400 dark:text-slate-500">Inicio</span>
                        <span className="flex-1 border-b border-dashed border-slate-200 dark:border-slate-800 mx-2"></span>
                        <span className="font-semibold text-slate-700 dark:text-slate-350">{formatDate(fair.start_date)}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="uppercase tracking-wider text-slate-400 dark:text-slate-500">Fin</span>
                        <span className="flex-1 border-b border-dashed border-slate-200 dark:border-slate-800 mx-2"></span>
                        <span className="font-semibold text-slate-700 dark:text-slate-350">{formatDate(fair.end_date)}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className="uppercase tracking-wider text-slate-400 dark:text-slate-500">ID Feria</span>
                        <span className="flex-1 border-b border-dashed border-slate-200 dark:border-slate-800 mx-2"></span>
                        <span className="font-mono text-[10px] bg-slate-100/60 dark:bg-slate-900/80 border border-slate-200/20 dark:border-slate-800 px-2 py-0.5 rounded-lg text-slate-500 dark:text-slate-400 truncate max-w-[130px]">
                          {fair.id}
                        </span>
                      </div>
                    </div>

                    {/* Botones de acción */}
                    {(onEdit || onDelete) && (
                      <div className="pt-3.5 flex items-center justify-end gap-2.5">
                        {onEdit && (
                          <button 
                            onClick={() => onEdit(fair)}
                            className="rounded-xl px-4 py-2 text-xs font-bold text-indigo-650 dark:text-indigo-400 border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/20 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 hover:border-indigo-300 dark:hover:border-indigo-900 active:scale-95 transition-all duration-200"
                          >
                            Editar
                          </button>
                        )}
                        {onDelete && (
                          <button 
                            onClick={() => onDelete(fair)}
                            className="rounded-xl px-4 py-2 text-xs font-bold text-rose-600 dark:text-rose-455 border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/20 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:border-rose-300 dark:hover:border-rose-900 active:scale-95 transition-all duration-200"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Paginación */}
      {!isPending && !isError && fairs.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4.5 border border-slate-200/40 dark:border-slate-800/40 bg-white/60 dark:bg-slate-950/40 backdrop-blur-md rounded-2xl shadow-inner mt-8">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Mostrando{" "}
            <span className="font-extrabold text-slate-800 dark:text-white">{skip + 1}</span>
            {" "}-{" "}
            <span className="font-extrabold text-slate-800 dark:text-white">{Math.min(skip + PAGE_SIZE, totalItems)}</span>
            {" "}de{" "}
            <span className="font-extrabold text-slate-800 dark:text-white">{totalItems}</span> ferias
          </p>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSkip((p) => Math.max(0, p - PAGE_SIZE))}
              disabled={skip <= 0 || isFetching}
              className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-350 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-850 disabled:opacity-40 disabled:hover:bg-white/85 transition-all duration-200 shadow-sm"
            >
              Anterior
            </button>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Página {page} de {totalPages}</span>
            <button 
              onClick={() => setSkip((p) => Math.min((totalPages - 1) * PAGE_SIZE, p + PAGE_SIZE))}
              disabled={skip >= (totalPages - 1) * PAGE_SIZE || isFetching}
              className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-350 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-850 disabled:opacity-40 disabled:hover:bg-white/85 transition-all duration-200 shadow-sm"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes blob-float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-10px) scale(1.06); }
        }
        .animate-blob-custom {
          animation: blob-float 4s ease-in-out infinite;
        }
        .animation-delay-2000 {
          animation-delay: -2s;
        }
      `}</style>
    </div>
  );
}

export default FairList;