// src/features/products/components/ProductCard.tsx

import type { Product } from "@/features/products/types/product.types";

// ─── CONSTANTES ────────────────────────────────────────────

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─── PROPS ─────────────────────────────────────────────────

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

// ─── UTILITARIOS DE DISEÑO ─────────────────────────────────

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-PA", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(price);
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

function getUnitLabel(unit: string): string {
  switch (unit) {
    case "pound": return "Libra";
    case "kilogram": return "Kilogramo";
    case "unit": return "Unidad";
    case "dozen": return "Docena";
    case "bag": return "Bolsa";
    default: return unit;
  }
}

function getCategoryLabel(category: string): string {
  switch (category) {
    case "vegetables": return "Vegetales";
    case "fruits": return "Frutas";
    case "grains": return "Granos";
    case "meats": return "Carnes";
    case "dairy": return "Lácteos";
    case "other": return "Otro";
    default: return category;
  }
}

function getCategoryGradient(category: string): { from: string; to: string } {
  switch (category) {
    case "vegetables":
      return { from: "#10b981", to: "#4ade80" };
    case "fruits":
      return { from: "#f59e0b", to: "#f97316" };
    case "grains":
      return { from: "#d97706", to: "#854d0e" };
    case "meats":
      return { from: "#ef4444", to: "#f43f5e" };
    case "dairy":
      return { from: "#38bdf8", to: "#3b82f6" };
    default:
      return { from: "#4A3728", to: "#E8DDD0" };
  }
}

// ✅ CORREGIDO: Solo usa la imagen del backend, sin fallback aleatorio
function getImageUrl(product: Product): string {
  if (product.image_url) {
    if (product.image_url.startsWith("http")) {
      return product.image_url;
    }
    return `${API_URL}${product.image_url}`;
  }
  return ""; // Sin imagen
}

// ─── COMPONENTE ────────────────────────────────────────────

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const { from, to } = getCategoryGradient(product.category);
  const imageUrl = getImageUrl(product);

  return (
    <>
      <div className="group relative w-full transition-all duration-500">
        
        {/* Paneles de Gradiente Traseros (Skew) */}
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

        {/* Contenedor del Contenido (Glassmorphic) */}
        <div className="relative z-20 w-full p-5 bg-white/90 dark:bg-slate-950/85 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/80 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.015)] transition-all duration-500 group-hover:bg-white/95 group-hover:dark:bg-slate-950/95 group-hover:border-transparent dark:group-hover:border-transparent group-hover:translate-y-[-4px] flex flex-col justify-between h-full">
          
          <div>
            {/* Imagen de Producto con overlays */}
            <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden mb-4 border border-slate-100 dark:border-slate-900/60 shadow-inner bg-slate-100 dark:bg-slate-800">
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-14 h-14 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                  </svg>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-slate-950/10 to-transparent pointer-events-none" />
              
              {/* Badges de Estado e Importancia Overlay */}
              <div className="absolute top-3 right-3 z-30 flex flex-col gap-1.5 items-end">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wide backdrop-blur-md shadow-md border ${
                  product.is_active 
                    ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:border-emerald-550/20" 
                    : "bg-rose-500/10 text-rose-600 border-rose-500/30 dark:border-rose-550/20"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${product.is_active ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                  {product.is_active ? "Activo" : "Inactivo"}
                </span>
                {product.is_featured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-705 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider backdrop-blur-md shadow-md">
                    Destacado
                  </span>
                )}
              </div>
            </div>

            {/* Cabecera / Título */}
            <div className="mb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
                {product.name}
              </h3>
              <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold font-mono tracking-wider uppercase mt-1">
                SKU: {product.sku}
              </p>
            </div>

            {/* Chips de Clasificación */}
            <div className="mb-4 flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-[#E8DDD0]/15 dark:bg-slate-900/50 text-[#4A3728] dark:text-slate-350 border border-[#E8DDD0]/35 dark:border-slate-800/80 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                <span className="w-1 h-1 rounded-full bg-[#5C8A3C] mr-1 shrink-0" />
                {getCategoryLabel(product.category)}
              </span>
              <span className="inline-flex rounded-full bg-slate-100 dark:bg-slate-900 text-slate-650 dark:text-slate-400 border border-slate-200/20 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                {getUnitLabel(product.unit)}
              </span>
            </div>

            {/* Descripción */}
            {product.description && (
              <p className="text-sm text-slate-600 dark:text-slate-450 leading-relaxed font-normal mb-4">
                {product.description}
              </p>
            )}
          </div>

          <div>
            {/* Detalles Técnicos */}
            <div className="px-1 py-4 border-t border-slate-100 dark:border-slate-900/50 space-y-3.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Precio</span>
                <span className="flex-1 border-b border-dashed border-slate-150 dark:border-slate-850 mx-2"></span>
                <span className="text-base font-black text-[#4A3728] dark:text-white">{formatPrice(product.price)}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Máx. por usuario</span>
                <span className="flex-1 border-b border-dashed border-slate-150 dark:border-slate-850 mx-2"></span>
                <span className="font-semibold text-slate-700 dark:text-slate-350">{product.max_per_user}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Disponible</span>
                <span className="flex-1 border-b border-dashed border-slate-150 dark:border-slate-850 mx-2"></span>
                <span className={`font-extrabold flex items-center gap-1 text-[11px] uppercase tracking-wider ${product.is_available ? "text-emerald-700 dark:text-emerald-450" : "text-rose-650 dark:text-rose-450"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${product.is_available ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                  {product.is_available ? "Sí" : "No"}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">ID Producto</span>
                <span className="flex-1 border-b border-dashed border-slate-150 dark:border-slate-850 mx-2"></span>
                <span className="font-mono text-[10px] bg-slate-50/50 dark:bg-slate-900/40 border border-slate-150/40 dark:border-slate-800 px-2 py-0.5 rounded-lg text-slate-500 dark:text-slate-400 truncate max-w-[120px]">{product.id}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Feria ID</span>
                <span className="flex-1 border-b border-dashed border-slate-150 dark:border-slate-850 mx-2"></span>
                <span className="font-mono text-[10px] bg-slate-50/50 dark:bg-slate-900/40 border border-slate-150/40 dark:border-slate-800 px-2 py-0.5 rounded-lg text-slate-500 dark:text-slate-400 truncate max-w-[120px]">{product.fair_id}</span>
              </div>

              {product.created_at && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Creado</span>
                  <span className="flex-1 border-b border-dashed border-slate-150 dark:border-slate-850 mx-2"></span>
                  <span className="font-semibold text-slate-700 dark:text-slate-350">{formatDateTime(product.created_at)}</span>
                </div>
              )}

              {product.updated_at && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Actualizado</span>
                  <span className="flex-1 border-b border-dashed border-slate-150 dark:border-slate-850 mx-2"></span>
                  <span className="font-semibold text-slate-700 dark:text-slate-350">{formatDateTime(product.updated_at)}</span>
                </div>
              )}
            </div>

            {/* Acciones */}
            {(onEdit || onDelete) && (
              <div className="pt-4 border-t border-slate-150/60 dark:border-slate-900/50 flex items-center justify-end gap-2.5">
                {onEdit && (
                  <button 
                    onClick={() => onEdit(product)}
                    className="rounded-xl px-4 py-2 text-xs font-bold text-indigo-650 dark:text-indigo-400 border border-slate-200 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 hover:border-indigo-300 dark:hover:border-indigo-900 active:scale-95 transition-all duration-200"
                  >
                    Editar
                  </button>
                )}
                {onDelete && (
                  <button 
                    onClick={() => onDelete(product)}
                    className="rounded-xl px-4 py-2 text-xs font-bold text-rose-600 dark:text-rose-455 border border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:border-rose-300 dark:hover:border-rose-900 active:scale-95 transition-all duration-200"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Estilos locales para las micro-animaciones */}
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

export default ProductCard;
