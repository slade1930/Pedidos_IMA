// src/features/inventory/components/StockUpdateForm.tsx

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { StockBadge } from "@/features/inventory/components/StockBadge";
import type { InventoryItem, UpdateStockPayload } from "@/features/inventory/types/inventory.types";

// ─── SCHEMA ────────────────────────────────────────────────

const stockUpdateSchema = z.object({
  total_stock: z
    .number({ message: "Ingresa un valor de stock válido" })
    .min(0, "El stock no puede ser negativo"),
  notes: z.string().optional().or(z.literal("")),
});

type StockUpdateFormValues = z.infer<typeof stockUpdateSchema>;

// ─── PROPS ─────────────────────────────────────────────────

interface StockUpdateFormProps {
  item: InventoryItem;
  onSubmit: (data: UpdateStockPayload) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  serverError?: string | null;
}

// ─── COMPONENTE ────────────────────────────────────────────

export function StockUpdateForm({
  item,
  onSubmit,
  onCancel,
  isSubmitting = false,
  serverError = null,
}: StockUpdateFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StockUpdateFormValues>({
    resolver: zodResolver(stockUpdateSchema),
    defaultValues: {
      total_stock: item.total_stock,
      notes: item.notes || "",
    },
  });

  const onFormSubmit = (data: StockUpdateFormValues) => {
    const payload: UpdateStockPayload = {
      total_stock: data.total_stock,
      ...(data.notes && data.notes !== "" && { notes: data.notes }),
    };
    onSubmit(payload);
  };

  return (
    <form 
      onSubmit={handleSubmit(onFormSubmit)} 
      className="space-y-6 bg-white/80 dark:bg-slate-950/70 p-6 md:p-8 rounded-3xl border border-slate-100 dark:border-slate-900/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] backdrop-blur-xl relative overflow-hidden transition-all duration-300"
    >
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 -z-10 h-[150px] w-[150px] rounded-full bg-gradient-to-br from-[#5C8A3C]/5 to-violet-500/0 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -z-10 h-[150px] w-[150px] rounded-full bg-gradient-to-tr from-[#E8DDD0]/15 to-indigo-500/0 blur-3xl pointer-events-none" />

      <div className="relative pb-2">
        <h3 className="text-xl font-bold tracking-tight bg-gradient-to-r from-[#4A3728] via-slate-800 to-indigo-900 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
          Actualizar Stock
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-medium">
          Ajusta las cantidades físicas de este producto
        </p>
      </div>

      {serverError && (
        <div className="rounded-2xl bg-rose-550/10 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <svg className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm text-rose-705 dark:text-rose-350 font-medium">{serverError}</p>
        </div>
      )}

      {/* Info actual (Hoja de Balance Técnico) */}
      <div className="rounded-2xl bg-[#E8DDD0]/10 dark:bg-slate-900/30 border border-[#E8DDD0]/25 dark:border-slate-800/80 p-5 space-y-3.5 shadow-inner">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Producto ID</span>
          <span className="flex-1 border-b border-dashed border-[#E8DDD0]/30 dark:border-slate-800/60 mx-2"></span>
          <span className="font-mono text-[10px] bg-slate-50 dark:bg-slate-900 border border-slate-205/30 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">
            {item.product_id}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Nivel actual</span>
          <span className="flex-1 border-b border-dashed border-[#E8DDD0]/30 dark:border-slate-800/60 mx-2"></span>
          <StockBadge availableStock={item.available_stock} threshold={item.low_stock_threshold} size="sm" />
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Stock total</span>
          <span className="flex-1 border-b border-dashed border-[#E8DDD0]/30 dark:border-slate-800/60 mx-2"></span>
          <span className="font-extrabold text-slate-800 dark:text-white">{item.total_stock}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Reservado</span>
          <span className="flex-1 border-b border-dashed border-[#E8DDD0]/30 dark:border-slate-800/60 mx-2"></span>
          <span className="font-semibold text-slate-700 dark:text-slate-350">{item.reserved_stock}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Entregado</span>
          <span className="flex-1 border-b border-dashed border-[#E8DDD0]/30 dark:border-slate-800/60 mx-2"></span>
          <span className="font-semibold text-slate-700 dark:text-slate-350">{item.delivered_stock}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Disponible</span>
          <span className="flex-1 border-b border-dashed border-[#E8DDD0]/30 dark:border-slate-800/60 mx-2"></span>
          <span className="font-black text-[#3D5A1E] dark:text-emerald-450">{item.available_stock}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Umbral Mínimo</span>
          <span className="flex-1 border-b border-dashed border-[#E8DDD0]/30 dark:border-slate-800/60 mx-2"></span>
          <span className="font-semibold text-slate-700 dark:text-slate-350">{item.low_stock_threshold}</span>
        </div>
      </div>

      {/* Nuevo stock */}
      <div className="space-y-1.5 relative group">
        <label htmlFor="total_stock" className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550 group-focus-within:text-[#3D5A1E] transition-colors">
          Nuevo stock total
        </label>
        <input 
          id="total_stock" 
          type="number" 
          min="0" 
          step="1" 
          disabled={isSubmitting}
          className={`block w-full rounded-xl border bg-slate-50/50 dark:bg-slate-900/30 px-4 py-3 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300 ease-out placeholder:text-slate-450 focus:outline-none focus:ring-4 focus:ring-[#3D5A1E]/10 focus:bg-white dark:focus:bg-slate-950 focus:scale-[1.005] disabled:opacity-50 ${
            errors.total_stock 
              ? "border-rose-350 dark:border-rose-900/50 focus:border-rose-500 focus:ring-rose-500/10" 
              : "border-slate-200 dark:border-slate-800 focus:border-[#3D5A1E]"
          }`}
          placeholder="0"
          {...register("total_stock", { valueAsNumber: true })} 
        />
        {errors.total_stock && (
          <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1.5 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            {errors.total_stock.message}
          </p>
        )}
      </div>

      {/* Notas */}
      <div className="space-y-1.5 relative group">
        <label htmlFor="notes" className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550 group-focus-within:text-[#3D5A1E] transition-colors">
          Notas <span className="text-slate-400 font-normal lowercase italic">(opcional)</span>
        </label>
        <textarea 
          id="notes" 
          rows={2} 
          disabled={isSubmitting}
          className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 px-4 py-3 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300 ease-out placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-4 focus:ring-[#3D5A1E]/10 focus:bg-white dark:focus:bg-slate-950 focus:scale-[1.005] disabled:opacity-50 resize-none"
          placeholder="Notas explicativas del ajuste de inventario..."
          {...register("notes")} 
        />
      </div>

      {/* Botones */}
      <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100 dark:border-slate-900/50">
        {onCancel && (
          <button 
            type="button" 
            onClick={onCancel} 
            disabled={isSubmitting}
            className="rounded-xl border border-slate-200 dark:border-slate-800 px-5 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-white disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          >
            Cancelar
          </button>
        )}
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#3D5A1E] to-[#5C8A3C] px-6 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(92,138,60,0.15)] hover:shadow-[0_4px_25px_rgba(92,138,60,0.3)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all duration-300 group"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4}></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Actualizando...
              </>
            ) : "Actualizar Stock"}
          </span>
          <span className="absolute inset-0 bg-gradient-to-r from-[#5C8A3C] to-[#3D5A1E] opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"></span>
        </button>
      </div>
    </form>
  );
}

export default StockUpdateForm;