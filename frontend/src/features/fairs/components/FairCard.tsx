// src/features/fairs/components/FairCard.tsx

import Image from "next/image";
import type { Fair, FairStatus } from "@/features/fairs/types/fair.types";

// ─── PROPS ─────────────────────────────────────────────────

interface FairCardProps {
  fair: Fair;
  onEdit?: (fair: Fair) => void;
  onDelete?: (fair: Fair) => void;
}

// ─── UTILITARIOS ───────────────────────────────────────────

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-PA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusBadgeClass(status: FairStatus): string {
  switch (status) {
    case "upcoming":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-250/30 dark:border-amber-500/20";
    case "active":
      return "bg-emerald-500/10 text-emerald-705 dark:text-emerald-450 border-emerald-250/30 dark:border-emerald-500/20";
    case "paused":
      return "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-250/30 dark:border-orange-500/20";
    case "finished":
      return "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-250/30 dark:border-sky-500/20";
    case "cancelled":
      return "bg-rose-500/10 text-rose-700 dark:text-rose-450 border-rose-250/30 dark:border-rose-500/20";
    default:
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200/40 dark:border-slate-800";
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

// Retorna un gradiente específico de acuerdo al estado para alimentar el Skew Panel trasero
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

// Devuelve una imagen temática diferente según el ID de la feria para evitar repeticiones visuales
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

// 👈 NUEVO: Construir URL completa de la imagen
function getImageUrl(fair: Fair): string {
  // Si tiene image_url del backend, construir URL completa
  if (fair.image_url) {
    // Si ya es una URL completa (http/https), usarla directamente
    if (fair.image_url.startsWith("http")) {
      return fair.image_url;
    }
    // Si es una ruta relativa, agregar la URL base de la API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    return `${apiUrl}${fair.image_url}`;
  }
  // Fallback a imagen de Unsplash
  return getFallbackImage(fair.id);
}

// ─── COMPONENTE ────────────────────────────────────────────

export function FairCard({ fair, onEdit, onDelete }: FairCardProps) {
  const { from, to } = getGradientColors(fair.status);
  const imageUrl = getImageUrl(fair); // 👈 Usar la nueva función

  return (
    <>
      <div className="group relative w-full transition-all duration-500">
        
        {/* Paneles de Gradiente Skew traseros */}
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

        {/* Blobs de cristal flotantes al hacer Hover */}
        <span className="pointer-events-none absolute inset-0 z-10">
          <span className="absolute top-0 left-0 w-0 h-0 rounded-2xl opacity-0 bg-white/10 dark:bg-white/5 backdrop-blur-[8px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all duration-500 ease-out animate-blob-custom group-hover:top-[-45px] group-hover:left-[45px] group-hover:w-[70px] group-hover:h-[70px] group-hover:opacity-100" />
          <span className="absolute bottom-0 right-0 w-0 h-0 rounded-2xl opacity-0 bg-white/10 dark:bg-white/5 backdrop-blur-[8px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all duration-500 ease-out animate-blob-custom animation-delay-2000 group-hover:bottom-[-45px] group-hover:right-[45px] group-hover:w-[70px] group-hover:h-[70px] group-hover:opacity-100" />
        </span>

        {/* Contenedor del Contenido (Glassmorphic) */}
        <div className="relative z-20 w-full p-5 bg-white/90 dark:bg-slate-950/85 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/80 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.01)] transition-all duration-500 group-hover:bg-white/95 group-hover:dark:bg-slate-950/95 group-hover:border-transparent dark:group-hover:border-transparent group-hover:translate-y-[-4px]">
          
          {/* Imagen de la Feria */}
          <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden mb-4 border border-slate-100 dark:border-slate-900/60 shadow-inner bg-slate-100 dark:bg-slate-800">
            {/* 👈 Usar Next Image para optimización, con fallback a img para URLs externas */}
            {imageUrl.startsWith("http") && !imageUrl.includes(process.env.NEXT_PUBLIC_API_URL || "localhost") ? (
              <img 
                src={imageUrl} 
                alt={fair.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
              />
            ) : (
              <Image
                src={imageUrl}
                alt={fair.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-slate-950/10 to-transparent" />
            
            {/* Status Badge overlay */}
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

          {/* Título & Ubicación */}
          <div className="mb-3.5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
              {fair.name}
            </h3>
            <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <svg className="h-4 w-4 text-slate-450 dark:text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">{fair.location}</span>
            </div>
          </div>

          {/* Descripción */}
          {fair.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4 font-normal">
              {fair.description}
            </p>
          )}

          {/* Detalles de Fecha e ID */}
          <div className="space-y-2.5 pb-4 border-b border-slate-100 dark:border-slate-900/50">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="uppercase tracking-wider text-slate-400 dark:text-slate-500">Inicio</span>
              <span className="flex-1 border-b border-dashed border-slate-200 dark:border-slate-800 mx-2"></span>
              <span className="font-semibold text-slate-700 dark:text-slate-350">{formatDateTime(fair.start_date)}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="uppercase tracking-wider text-slate-400 dark:text-slate-500">Finalización</span>
              <span className="flex-1 border-b border-dashed border-slate-200 dark:border-slate-800 mx-2"></span>
              <span className="font-semibold text-slate-700 dark:text-slate-350">{formatDateTime(fair.end_date)}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="uppercase tracking-wider text-slate-400 dark:text-slate-500">ID Feria</span>
              <span className="flex-1 border-b border-dashed border-slate-200 dark:border-slate-800 mx-2"></span>
              <span className="font-mono text-[10px] bg-slate-100/60 dark:bg-slate-900/80 border border-slate-200/20 dark:border-slate-800 px-2 py-0.5 rounded-lg text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                {fair.id}
              </span>
            </div>
          </div>

          {/* Acciones */}
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
                  className="rounded-xl px-4 py-2 text-xs font-bold text-rose-600 dark:text-rose-450 border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/20 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:border-rose-300 dark:hover:border-rose-900 active:scale-95 transition-all duration-200"
                >
                  Eliminar
                </button>
              )}
            </div>
          )}

        </div>
      </div>

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
    </>
  );
}

export default FairCard;