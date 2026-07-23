// src/app/(dashboard)/dashboard/inventory/page.tsx

"use client";

import { useState, useCallback, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { InventoryTable } from "@/features/inventory/components/InventoryTable";
import { StockUpdateForm } from "@/features/inventory/components/StockUpdateForm";
import { inventoryService } from "@/features/inventory/services/inventory.service";
import { useFairs } from "@/features/fairs/hooks/useFairs";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useDebounce } from "@/hooks/useDebounce";
import type { InventoryItem, CreateInventoryPayload, UpdateStockPayload } from "@/features/inventory/types/inventory.types";

// ─── SCHEMA ────────────────────────────────────────────────

const createInventorySchema = z.object({
  product_id: z.string().min(1, "Selecciona un producto"),
  fair_id: z.string().min(1, "Selecciona una feria"),
  total_stock: z.number({ message: "Ingresa un valor válido" }).min(0, "El stock no puede ser negativo"),
  notes: z.string().optional().or(z.literal("")),
});

type CreateInventoryFormValues = z.infer<typeof createInventorySchema>;

// ─── COMPONENTE ────────────────────────────────────────────

export default function InventoryPage() {
  const queryClient = useQueryClient();

  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [fairFilter, setFairFilter] = useState<string>("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Búsqueda en tiempo real con debounce
  const debouncedSearch = useDebounce(searchInput, 300);

  // Ferias para selectores
  const { data: fairsData } = useFairs({ limit: 100 });
  const fairs = Array.isArray(fairsData) ? fairsData : fairsData?.data ?? [];

  // 👈 Productos filtrados por feria seleccionada
  const { data: productsData } = useProducts({
    limit: 100,
    ...(fairFilter && { fair_id: fairFilter }),
  });
  const products = Array.isArray(productsData) ? productsData : productsData?.data ?? [];

  // ─── FORM CREAR ─────────────────────────────────────
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors: formErrors },
  } = useForm<CreateInventoryFormValues>({
    resolver: zodResolver(createInventorySchema),
    defaultValues: {
      product_id: "",
      fair_id: fairFilter || "",
      total_stock: 0,
      notes: "",
    },
  });

  // Actualizar fair_id en el form cuando cambia el filtro
  const watchedFairId = watch("fair_id");

  // 👈 Productos del formulario filtrados por la feria seleccionada en el form
  const { data: formProductsData } = useProducts({
    limit: 100,
    ...(watchedFairId && { fair_id: watchedFairId }),
  });
  const formProducts = Array.isArray(formProductsData) ? formProductsData : formProductsData?.data ?? [];

  // ─── MUTACIÓN: CREAR ────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data: CreateInventoryPayload) => inventoryService.createInventory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setShowCreateModal(false);
      reset();
    },
    onError: (error: { message: string }) => {
      setServerError(error.message || "Error al crear inventario");
    },
  });

  // ─── MUTACIÓN: ACTUALIZAR STOCK ─────────────────────
  const updateStockMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStockPayload }) =>
      inventoryService.updateStock(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setSelectedItem(null);
    },
    onError: (error: { message: string }) => {
      setServerError(error.message || "Error al actualizar stock");
    },
  });

  const openUpdateModal = useCallback((item: InventoryItem) => {
    setSelectedItem(item);
    setServerError(null);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedItem(null);
    setServerError(null);
  }, []);

  const handleUpdateSubmit = useCallback(
    (data: UpdateStockPayload) => {
      if (selectedItem) {
        updateStockMutation.mutate({ id: selectedItem.id, data });
      }
    },
    [selectedItem, updateStockMutation]
  );

  const handleCreateSubmit = useCallback(
    (data: CreateInventoryFormValues) => {
      setServerError(null);
      createMutation.mutate({
        product_id: data.product_id,
        fair_id: data.fair_id,
        total_stock: data.total_stock,
        notes: data.notes || null,
      });
    },
    [createMutation]
  );

  return (
    <div className="space-y-6 relative">
      <div className="absolute top-[-80px] right-[-80px] -z-10 h-[300px] w-[300px] rounded-full bg-[#5C8A3C]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[200px] left-[-80px] -z-10 h-[300px] w-[300px] rounded-full bg-[#E8DDD0]/20 dark:bg-slate-900/30 blur-[120px] pointer-events-none" />

      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#4A3728] dark:text-white leading-none">
            Inventario
          </h1>
          <p className="mt-2 text-sm text-[#4A3728]/60 dark:text-slate-400 font-medium">
            Control de existencias de productos por feria en tiempo real
          </p>
        </div>
        <button 
          onClick={() => { setServerError(null); reset(); setShowCreateModal(true); }}
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#3D5A1E] to-[#5C8A3C] px-5 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(92,138,60,0.18)] hover:shadow-[0_4px_25px_rgba(92,138,60,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
        >
          <svg className="h-5 w-5 mr-2 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nuevo Inventario
        </button>
      </div>

      {/* Filtros: Feria + Búsqueda + Stock Bajo */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Selector de Feria */}
        <div className="relative sm:w-56">
          <select 
            value={fairFilter} 
            onChange={(e) => setFairFilter(e.target.value)}
            className="block w-full rounded-xl border border-[#E8DDD0] dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 pl-4 pr-10 py-3 text-sm shadow-sm focus:outline-none focus:ring-4 focus:ring-[#3D5A1E]/10 focus:border-[#3D5A1E] text-[#4A3728] dark:text-white transition-all duration-300 appearance-none cursor-pointer"
          >
            <option value="">Todas las ferias</option>
            {fairs.map((fair: { id: string; name: string }) => (
              <option key={fair.id} value={fair.id}>{fair.name}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#4A3728]/60 dark:text-slate-500">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
            </svg>
          </div>
        </div>

        {/* Buscador en tiempo real */}
        <div className="relative group flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4A3728]/50 dark:text-slate-500 group-focus-within:text-[#3D5A1E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input 
            type="text" 
            value={searchInput} 
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por producto o SKU..."
            className="block w-full rounded-xl border border-[#E8DDD0] dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 pl-11 pr-4 py-3 text-sm shadow-sm placeholder-[#4A3728]/40 dark:placeholder-slate-650 focus:outline-none focus:ring-4 focus:ring-[#3D5A1E]/10 focus:border-[#3D5A1E] text-[#4A3728] dark:text-white transition-all duration-300" 
          />
        </div>

        {/* Toggle Stock Bajo */}
        <label className="flex items-center gap-3 rounded-xl border border-[#E8DDD0] dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 px-4 py-2.5 text-sm shadow-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850 transition-all duration-300 group">
          <div className="relative">
            <input 
              type="checkbox" 
              checked={lowStockFilter} 
              onChange={(e) => setLowStockFilter(e.target.checked)}
              className="sr-only peer" 
            />
            <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-700 peer-checked:bg-[#3D5A1E] dark:peer-checked:bg-[#5C8A3C] transition-all duration-300" />
          </div>
          <span className="text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider group-hover:text-[#3D5A1E] dark:group-hover:text-[#5C8A3C] transition-colors whitespace-nowrap">
            Stock bajo
          </span>
        </label>
      </div>

      {/* Tabla de Inventario */}
      <InventoryTable
        search={debouncedSearch}
        lowStockFilter={lowStockFilter || undefined}
        locationFilter={fairFilter || undefined}
        onUpdateStock={openUpdateModal}
      />

      {/* Modal Crear Inventario */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md transition-opacity" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-white dark:bg-slate-950 rounded-3xl border border-[#E8DDD0]/30 dark:border-slate-900/60 shadow-[0_24px_60px_rgba(0,0,0,0.12)] w-full max-w-md max-h-[90vh] overflow-y-auto p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-655 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer" 
              aria-label="Cerrar"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <form onSubmit={handleSubmit(handleCreateSubmit)} className="space-y-6">
              <div>
                <h3 className="text-xl font-bold tracking-tight bg-gradient-to-r from-[#4A3728] via-slate-800 to-indigo-900 dark:from-white dark:to-slate-450 bg-clip-text text-transparent">
                  Nuevo Registro
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-medium">
                  Cataloga un producto dentro de una feria específica
                </p>
              </div>

              {serverError && (
                <div className="rounded-2xl bg-rose-550/10 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-4 flex items-start gap-3">
                  <p className="text-sm text-[#C94B32] font-semibold">{serverError}</p>
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
                    disabled={createMutation.isPending}
                    className={`block w-full rounded-xl border bg-slate-50/50 dark:bg-slate-900/30 px-4 py-3 pr-10 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-[#3D5A1E]/10 focus:bg-white dark:focus:bg-slate-950 focus:scale-[1.005] disabled:opacity-50 appearance-none text-slate-700 dark:text-slate-350 ${
                      formErrors.fair_id ? "border-rose-350 dark:border-rose-900/50 focus:border-rose-500 focus:ring-rose-500/10" : "border-slate-200 dark:border-slate-800 focus:border-[#3D5A1E]"
                    }`}
                    {...register("fair_id")}
                  >
                    <option value="">Selecciona una feria</option>
                    {fairs.map((fair: { id: string; name: string }) => (
                      <option key={fair.id} value={fair.id}>{fair.name}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 dark:text-slate-650">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
                {formErrors.fair_id && <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1.5 animate-pulse"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" />{formErrors.fair_id.message}</p>}
              </div>

              {/* 👈 Producto - Filtrado por feria seleccionada */}
              <div className="space-y-1.5 relative group">
                <label htmlFor="product_id" className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550 group-focus-within:text-[#3D5A1E] transition-colors">
                  Producto {watchedFairId ? "(de esta feria)" : "(selecciona feria primero)"}
                </label>
                <div className="relative">
                  <select 
                    id="product_id" 
                    disabled={createMutation.isPending || !watchedFairId}
                    className={`block w-full rounded-xl border bg-slate-50/50 dark:bg-slate-900/30 px-4 py-3 pr-10 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-[#3D5A1E]/10 focus:bg-white dark:focus:bg-slate-950 focus:scale-[1.005] disabled:opacity-50 appearance-none text-slate-700 dark:text-slate-350 ${
                      formErrors.product_id ? "border-rose-350 dark:border-rose-900/50 focus:border-rose-500 focus:ring-rose-500/10" : "border-slate-200 dark:border-slate-800 focus:border-[#3D5A1E]"
                    }`}
                    {...register("product_id")}
                  >
                    <option value="">{watchedFairId ? "Selecciona un producto" : "Selecciona una feria primero"}</option>
                    {formProducts.map((p: { id: string; name: string; category: string }) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 dark:text-slate-650">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
                {formErrors.product_id && <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1.5 animate-pulse"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" />{formErrors.product_id.message}</p>}
              </div>

              {/* Stock Inicial */}
              <div className="space-y-1.5 relative group">
                <label htmlFor="total_stock" className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-555 group-focus-within:text-[#3D5A1E] transition-colors">
                  Stock inicial
                </label>
                <input 
                  id="total_stock" 
                  type="number" 
                  min="0" 
                  disabled={createMutation.isPending}
                  className={`block w-full rounded-xl border bg-slate-50/50 dark:bg-slate-900/30 px-4 py-3 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300 ease-out placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#3D5A1E]/10 focus:bg-white dark:focus:bg-slate-955 focus:scale-[1.005] disabled:opacity-50 ${
                    formErrors.total_stock ? "border-rose-350 dark:border-rose-900/50 focus:border-rose-500 focus:ring-rose-500/10" : "border-slate-200 dark:border-slate-800 focus:border-[#3D5A1E]"
                  }`}
                  placeholder="0"
                  {...register("total_stock", { valueAsNumber: true })} 
                />
                {formErrors.total_stock && <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1.5 animate-pulse"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" />{formErrors.total_stock.message}</p>}
              </div>

              {/* Notas */}
              <div className="space-y-1.5 relative group">
                <label htmlFor="notes" className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550 group-focus-within:text-[#3D5A1E] transition-colors">
                  Notas <span className="text-slate-400 font-normal lowercase italic">(opcional)</span>
                </label>
                <textarea 
                  id="notes" 
                  rows={2} 
                  disabled={createMutation.isPending}
                  className="block w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 px-4 py-3 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300 ease-out placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-4 focus:ring-[#3D5A1E]/10 focus:bg-white dark:focus:bg-slate-950 focus:scale-[1.005] disabled:opacity-50 resize-none"
                  placeholder="Notas iniciales del lote..."
                  {...register("notes")} 
                />
              </div>

              <div className="flex justify-end gap-3 pt-5 border-t border-slate-100 dark:border-slate-900/50">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)} 
                  disabled={createMutation.isPending}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 px-5 py-3 text-sm font-semibold text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-white disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={createMutation.isPending}
                  className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#3D5A1E] to-[#5C8A3C] px-6 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(92,138,60,0.15)] hover:shadow-[0_4px_25px_rgba(92,138,60,0.3)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all duration-300 group cursor-pointer"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {createMutation.isPending ? "Creando..." : "Crear Inventario"}
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-[#5C8A3C] to-[#3D5A1E] opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"></span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Actualizar Stock */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md transition-opacity" onClick={closeModal} />
          <div className="relative bg-white dark:bg-slate-950 rounded-3xl border border-[#E8DDD0]/30 dark:border-slate-900/60 shadow-[0_24px_60px_rgba(0,0,0,0.12)] w-full max-w-md max-h-[90vh] overflow-y-auto p-0 animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={closeModal}
              className="absolute top-5 right-5 z-40 p-1.5 rounded-xl text-slate-400 hover:text-slate-655 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer" 
              aria-label="Cerrar"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <StockUpdateForm item={selectedItem} onSubmit={handleUpdateSubmit} onCancel={closeModal}
              isSubmitting={updateStockMutation.isPending} serverError={serverError} />
          </div>
        </div>
      )}
    </div>
  );
}
