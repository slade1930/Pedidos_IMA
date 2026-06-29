// src/features/products/components/ProductCategoryBadge.tsx

// ─── PROPS ─────────────────────────────────────────────────

interface ProductCategoryBadgeProps {
  /** Nombre de la categoría */
  category: string;
  /** Tamaño del badge */
  size?: "sm" | "md";
}

// ─── ESTILOS ───────────────────────────────────────────────

const SIZE_STYLES = {
  sm: "px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase",
  md: "px-2.5 py-0.5 text-[9px] sm:px-3 sm:py-1 sm:text-[10px] font-bold tracking-wider uppercase",
} as const;

const DOT_SIZE = {
  sm: "h-1 w-1 mr-1.5",
  md: "h-1.5 w-1.5 mr-1.5",
} as const;

// ─── COMPONENTE ────────────────────────────────────────────

/**
 * ProductCategoryBadge
 * 
 * Badge reutilizable para mostrar la categoría de un producto.
 * 
 * A diferencia de otros badges (rol, estado), la categoría es texto libre.
 * Por eso usa un estilo neutro y consistente para cualquier valor.
 * 
 * Uso:
 * ```tsx
 * <ProductCategoryBadge category="Electrónica" />
 * <ProductCategoryBadge category="Ropa" size="sm" />
 * ```
 */
export function ProductCategoryBadge({
  category,
  size = "md",
}: ProductCategoryBadgeProps) {
  if (!category) return null;

  return (
    <span
      className={`inline-flex items-center rounded-full bg-[#E8DDD0]/15 dark:bg-slate-900/50 text-[#4A3728] dark:text-slate-300 border border-[#E8DDD0]/35 dark:border-slate-800/80 backdrop-blur-md shadow-[0_2px_8px_rgba(74,55,40,0.01)] transition-all duration-300 hover:bg-[#E8DDD0]/25 dark:hover:bg-slate-900/80 selection:bg-transparent ${SIZE_STYLES[size]}`}
    >
      <span className={`rounded-full bg-[#5C8A3C]/70 dark:bg-[#5C8A3C] shrink-0 ${DOT_SIZE[size]}`} />
      {category}
    </span>
  );
}

export default ProductCategoryBadge;