// src/features/orders/components/OrderForm.tsx

"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createOrderSchema,
} from "@/features/orders/schemas/order.schema";
import type { CreateOrderPayload } from "@/features/orders/types/order.types";
import { useFairs } from "@/features/fairs/hooks/useFairs";
import { useProducts } from "@/features/products/hooks/useProducts";

// ─── TIPOS ─────────────────────────────────────────────────

type OrderFormInput = {
  fair_id: string;
  payment_method: "yappy" | "card" | "cash";
  items: {
    product_id: string;
    quantity: number;
  }[];
  notes?: string | null;
};

// ─── PROPS ─────────────────────────────────────────────────

interface OrderFormProps {
  order?: null; // Solo creación
  onSubmit: (data: CreateOrderPayload) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  serverError?: string | null;
}

// ─── CAMPOS DE ITEMS ───────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function OrderItemsFields({ register, control, errors, isSubmitting, products }: any) {
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pl-1">
          Desglose de Productos
        </h4>
        <button 
          type="button" 
          onClick={() => append({ product_id: "", quantity: 1 })}
          disabled={isSubmitting}
          className="inline-flex items-center gap-1 border border-dashed border-[#5C8A3C]/30 text-[#3D5A1E] dark:text-[#5C8A3C] hover:bg-[#3D5A1E]/5 hover:border-[#3D5A1E]/55 rounded-xl px-3 py-1.5 text-xs font-bold transition-all duration-200 disabled:opacity-50"
        >
          <svg className="w-3.5 h-3.5 mr-0.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Agregar producto
        </button>
      </div>

      {errors.items && !Array.isArray(errors.items) && (
        <p className="text-xs text-rose-500 mt-1 pl-1 animate-pulse">{errors.items.message}</p>
      )}

      <div className="space-y-3.5">
        {fields.map((field: { id: string }, index: number) => (
          <div 
            key={field.id} 
            className="flex items-end gap-3.5 p-4 bg-[#E8DDD0]/10 dark:bg-slate-900/30 rounded-2xl border border-[#E8DDD0]/25 dark:border-slate-800/80 shadow-inner"
          >
            {/* Producto select */}
            <div className="flex-1 space-y-1.5 relative group">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500 pl-0.5">Producto</label>
              <div className="relative">
                <select 
                  disabled={isSubmitting}
                  className={`block w-full rounded-xl border bg-white/70 dark:bg-slate-950 px-3 py-2 pr-10 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.015)] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#3D5A1E]/10 focus:border-[#3D5A1E] disabled:opacity-50 appearance-none text-slate-700 dark:text-slate-350 ${
                    errors.items?.[index]?.product_id ? "border-rose-350 focus:border-rose-500" : "border-slate-200 dark:border-slate-800"
                  }`}
                  {...register(`items.${index}.product_id`)}
                >
                  <option value="">Seleccionar</option>
                  {products.map((p: { id: string; name: string }) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 dark:text-slate-655">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
              {errors.items?.[index]?.product_id && (
                <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.items[index].product_id.message}</p>
              )}
            </div>

            {/* Cantidad input */}
            <div className="w-20 space-y-1.5 relative group">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500 pl-0.5">Cant.</label>
              <input 
                type="number" 
                min="1" 
                max="10" 
                disabled={isSubmitting}
                className={`block w-full rounded-xl border bg-white/70 dark:bg-slate-950 px-3 py-2 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.015)] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#3D5A1E]/10 focus:border-[#3D5A1E] disabled:opacity-50 ${
                  errors.items?.[index]?.quantity ? "border-rose-350 focus:border-rose-500" : "border-slate-200 dark:border-slate-800"
                }`}
                {...register(`items.${index}.quantity`, { valueAsNumber: true })} 
              />
              {errors.items?.[index]?.quantity && (
                <p className="text-[10px] text-rose-500 mt-1 font-medium">{errors.items[index].quantity.message}</p>
              )}
            </div>

            {/* Remove button */}
            {fields.length > 1 && (
              <button 
                type="button" 
                onClick={() => remove(index)} 
                disabled={isSubmitting}
                className="flex-shrink-0 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 hover:text-rose-600 active:scale-95 transition-all duration-200" 
                title="Eliminar producto"
              >
                <svg className="h-4 w-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ──────────────────────────────────

export function OrderForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
  serverError = null,
}: OrderFormProps) {
  const { data: fairsData } = useFairs({ limit: 100 });
  const fairs = Array.isArray(fairsData) ? fairsData : fairsData?.data ?? [];

  const { data: productsData } = useProducts({ limit: 100 });
  const products = Array.isArray(productsData) ? productsData : productsData?.data ?? [];

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<OrderFormInput>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      fair_id: "",
      payment_method: "cash",
      items: [{ product_id: "", quantity: 1 }],
      notes: "",
    },
  });

  const onFormSubmit = (data: OrderFormInput) => {
    onSubmit(data as CreateOrderPayload);
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
          Nueva Orden
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-medium">
          Registra una nueva transacción en el sistema
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

      {/* Feria */}
      <div className="space-y-1.5 relative group">
        <label htmlFor="fair_id" className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550 group-focus-within:text-[#3D5A1E] transition-colors">
          Feria
        </label>
        <div className="relative">
          <select 
            id="fair_id" 
            disabled={isSubmitting}
            className={`block w-full rounded-xl border bg-slate-50/50 dark:bg-slate-900/30 px-4 py-3 pr-10 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-[#3D5A1E]/10 focus:bg-white dark:focus:bg-slate-950 focus:scale-[1.005] disabled:opacity-50 appearance-none text-slate-700 dark:text-slate-350 ${
              errors.fair_id ? "border-rose-350 dark:border-rose-900/50 focus:border-rose-505" : "border-slate-200 dark:border-slate-800 focus:border-[#3D5A1E]"
            }`}
            {...register("fair_id")}
          >
            <option value="">Selecciona una feria</option>
            {fairs.map((fair: { id: string; name: string }) => (
              <option key={fair.id} value={fair.id}>{fair.name}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 dark:text-slate-655">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
            </svg>
          </div>
        </div>
        {errors.fair_id && <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1.5 animate-pulse"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" />{errors.fair_id.message}</p>}
      </div>

      {/* Método de pago */}
      <div className="space-y-1.5 relative group">
        <label htmlFor="payment_method" className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550 group-focus-within:text-[#3D5A1E] transition-colors">
          Método de pago
        </label>
        <div className="relative">
          <select 
            id="payment_method" 
            disabled={isSubmitting}
            className={`block w-full rounded-xl border bg-slate-50/50 dark:bg-slate-900/30 px-4 py-3 pr-10 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-[#3D5A1E]/10 focus:bg-white dark:focus:bg-slate-950 focus:scale-[1.005] disabled:opacity-50 appearance-none text-slate-700 dark:text-slate-350 ${
              errors.payment_method ? "border-rose-350 dark:border-rose-900/50 focus:border-rose-505" : "border-slate-200 dark:border-slate-800 focus:border-[#3D5A1E]"
            }`}
            {...register("payment_method")}
          >
            <option value="yappy">Yappy</option>
            <option value="card">Tarjeta</option>
            <option value="cash">Efectivo</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 dark:text-slate-655">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
            </svg>
          </div>
        </div>
        {errors.payment_method && <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1.5 animate-pulse"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" />{errors.payment_method.message}</p>}
      </div>

      {/* Items */}
      <OrderItemsFields register={register} control={control} errors={errors} isSubmitting={isSubmitting} products={products} />

      {/* Notas */}
      <div className="space-y-1.5 relative group">
        <label htmlFor="notes" className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550 group-focus-within:text-[#3D5A1E] transition-colors">
          Notas <span className="text-slate-400 font-normal lowercase italic">(opcional)</span>
        </label>
        <textarea 
          id="notes" 
          rows={2} 
          disabled={isSubmitting}
          className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 px-4 py-3 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300 ease-out placeholder:text-slate-400 dark:placeholder:text-slate-650 focus:outline-none focus:ring-4 focus:ring-[#3D5A1E]/10 focus:bg-white dark:focus:bg-slate-950 focus:scale-[1.005] disabled:opacity-50 resize-none"
          placeholder="Notas adicionales sobre la orden..."
          {...register("notes")} 
        />
      </div>

      {/* Botones de acción */}
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
                Creando...
              </>
            ) : "Crear Orden"}
          </span>
          <span className="absolute inset-0 bg-gradient-to-r from-[#5C8A3C] to-[#3D5A1E] opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"></span>
        </button>
      </div>
    </form>
  );
}

export default OrderForm;