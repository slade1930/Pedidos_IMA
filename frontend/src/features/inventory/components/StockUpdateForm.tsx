// src/features/inventory/components/StockUpdateForm.tsx

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, ArrowRight, ClipboardList, Package, ScrollText, CircleDot, Boxes } from "lucide-react";
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

function InfoRow({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</span>
      <span className="flex-1 border-b border-dashed border-[var(--itas-soft-green)] dark:border-slate-700/70 mx-2"></span>
      <span className={mono ? "font-mono text-[10px] bg-slate-50 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400" : "font-extrabold text-slate-800 dark:text-white"}>
        {value}
      </span>
    </div>
  );
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

  const availablePct =
    item.total_stock > 0
      ? Math.max(0, Math.min(100, Math.round((item.available_stock / item.total_stock) * 100)))
      : 0;

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="space-y-6 bg-white/85 dark:bg-slate-950/70 p-6 md:p-8 rounded-3xl border border-slate-200/50 dark:border-slate-800 shadow-panel backdrop-blur-xl relative overflow-hidden transition-all duration-300"
    >
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute top-0 right-0 h-[180px] w-[180px] rounded-full bg-gradient-to-br from-[var(--itas-green)]/10 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-[160px] w-[160px] rounded-full bg-gradient-to-tr from-[var(--itas-gold)]/10 to-transparent blur-3xl" />
      {/* Hairline superior */}
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[var(--itas-green)] via-[var(--itas-gold)] to-[var(--itas-green)]" />

      <div className="relative">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center h-11 w-11 shrink-0 rounded-2xl gradient-gold text-white shadow-glow-gold">
            <ClipboardList className="h-5 w-5" strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">
              Actualizar Stock
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-medium">
              Ajusta las cantidades físicas de este producto
            </p>
          </div>
        </div>
      </div>

      {serverError && (
        <div className="rounded-2xl bg-rose-500/10 dark:bg-rose-950/20 border border-rose-500/25 p-4 flex items-start gap-3 backdrop-blur-md shadow-[0_0_18px_rgba(244,63,94,0.08)]">
          <svg className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm text-rose-600 dark:text-rose-300 font-medium">{serverError}</p>
        </div>
      )}

      {/* Info actual (Hoja de Balance Técnico) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--itas-soft-green)]/40 to-transparent dark:from-[var(--itas-green)]/10 dark:to-transparent border border-[var(--itas-green)]/15 dark:border-slate-800/70 p-5 space-y-3.5 shadow-inner">
        <div className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-[var(--itas-green)]/10 blur-2xl pointer-events-none" />
        <div className="flex items-center gap-2 mb-1">
          <Package className="h-4 w-4 text-[var(--itas-green)]" strokeWidth={2} />
          <span className="text-[11px] font-black uppercase tracking-widest text-[var(--itas-green)]">Hoja de balance técnico</span>
        </div>
        <InfoRow label="Producto ID" value={item.product_id} mono />
        <div className="flex items-center justify-between text-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Nivel actual</span>
          <span className="flex-1 border-b border-dashed border-[var(--itas-soft-green)] dark:border-slate-700/70 mx-2"></span>
          <StockBadge availableStock={item.available_stock} threshold={item.low_stock_threshold} size="sm" />
        </div>
        <InfoRow label="Stock total" value={item.total_stock} />
        <InfoRow label="Reservado" value={item.reserved_stock} />
        <InfoRow label="Entregado" value={item.delivered_stock} />
        <div className="flex items-center justify-between text-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Disponible</span>
          <span className="flex-1 border-b border-dashed border-[var(--itas-soft-green)] dark:border-slate-700/70 mx-2"></span>
          <span className="font-black text-gradient-green">{item.available_stock}</span>
        </div>
        <InfoRow label="Umbral Mínimo" value={item.low_stock_threshold} />

        {/* Barra de disponibilidad */}
        <div className="pt-1">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
            <span className="inline-flex items-center gap-1"><CircleDot className="h-3 w-3" strokeWidth={2} /> Disponibilidad</span>
            <span className="text-[var(--itas-green)]">{availablePct}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-200/70 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--itas-green)] to-[var(--itas-green-light)] transition-all duration-700"
              style={{ width: `${availablePct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Nuevo stock */}
      <div className="space-y-1.5 relative group">
        <label htmlFor="total_stock" className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 group-focus-within:text-[var(--itas-green)] transition-colors">
          Nuevo stock total
        </label>
        <div className="relative">
          <Boxes className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[var(--itas-green)] transition-colors" strokeWidth={2} />
          <input
            id="total_stock"
            type="number"
            min="0"
            step="1"
            disabled={isSubmitting}
            className={`block w-full rounded-xl border bg-slate-50/70 dark:bg-slate-900/40 pl-10 pr-4 py-3 text-sm shadow-card transition-all duration-300 ease-out placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[var(--itas-green)]/10 focus:bg-white dark:focus:bg-slate-950 focus:scale-[1.005] disabled:opacity-50 ${
              errors.total_stock
                ? "border-rose-400/60 dark:border-rose-900/60 focus:border-rose-500 focus:ring-rose-500/10"
                : "border-slate-200 dark:border-slate-800 focus:border-[var(--itas-green)]"
            }`}
            placeholder="0"
            {...register("total_stock", { valueAsNumber: true })}
          />
        </div>
        {errors.total_stock && (
          <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1.5 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
            {errors.total_stock.message}
          </p>
        )}
      </div>

      {/* Notas */}
      <div className="space-y-1.5 relative group">
        <label htmlFor="notes" className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 group-focus-within:text-[var(--itas-green)] transition-colors">
          Notas <span className="text-slate-400 font-normal lowercase italic">(opcional)</span>
        </label>
        <div className="relative">
          <ScrollText className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 group-focus-within:text-[var(--itas-green)] transition-colors" strokeWidth={2} />
          <textarea
            id="notes"
            rows={2}
            disabled={isSubmitting}
            className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 pl-10 pr-4 py-3 text-sm shadow-card transition-all duration-300 ease-out placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-4 focus:ring-[var(--itas-green)]/10 focus:bg-white dark:focus:bg-slate-950 focus:scale-[1.005] disabled:opacity-50 resize-none"
            placeholder="Notas explicativas del ajuste de inventario..."
            {...register("notes")}
          />
        </div>
      </div>

      {/* Botones */}
      <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100 dark:border-slate-800/60">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 px-5 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-white disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="group relative overflow-hidden rounded-xl gradient-ima px-6 py-3 text-sm font-bold text-white shadow-glow-green hover:shadow-[0_4px_30px_rgba(var(--itas-green-rgb),0.5)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all duration-300 cursor-pointer"
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
            ) : (
              <>
                Actualizar Stock
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={2.4} />
              </>
            )}
          </span>
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[var(--itas-green-light)] to-[var(--itas-green)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out" />
        </button>
      </div>
    </form>
  );
}

export default StockUpdateForm;
