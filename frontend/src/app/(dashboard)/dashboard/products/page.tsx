// src/app/(dashboard)/products/page.tsx

"use client";

import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ProductGrid } from "@/features/products/components/ProductGrid";
import { ProductForm } from "@/features/products/components/ProductForm";
import { productService } from "@/features/products/services/product.service";
import type { Product, CreateProductPayload, UpdateProductPayload } from "@/features/products/types/product.types";

// ─── TIPOS LOCALES ────────────────────────────────────────

type ModalMode = "create" | "edit" | null;

// ─── OPCIONES DE CATEGORÍA ────────────────────────────────

const CATEGORY_OPTIONS = [
  { value: "", label: "Todas las categorías" },
  { value: "vegetables", label: "Vegetales" },
  { value: "fruits", label: "Frutas" },
  { value: "grains", label: "Granos" },
  { value: "meats", label: "Carnes" },
  { value: "dairy", label: "Lácteos" },
  { value: "other", label: "Otro" },
];

// ─── COMPONENTE ────────────────────────────────────────────

/**
 * Página de Gestión de Productos
 * 
 * Ruta: /dashboard/products
 * Layout: (dashboard) → ProtectedLayout
 */
export default function ProductsPage() {
  const queryClient = useQueryClient();

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [serverError, setServerError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  // ─── MUTACIÓN: CREAR ────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data: CreateProductPayload) => productService.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      closeModal();
    },
    onError: (error: { message: string }) => {
      setServerError(error.message || "Error al crear producto");
    },
  });

  // ─── MUTACIÓN: ACTUALIZAR ───────────────────────────
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductPayload }) =>
      productService.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      closeModal();
    },
    onError: (error: { message: string }) => {
      setServerError(error.message || "Error al actualizar producto");
    },
  });

  // ─── MUTACIÓN: ELIMINAR ─────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setDeleteConfirm(null);
    },
  });

  // ─── HANDLERS ───────────────────────────────────────
  const openCreateModal = useCallback(() => {
    setSelectedProduct(null);
    setServerError(null);
    setModalMode("create");
  }, []);

  const openEditModal = useCallback((product: Product) => {
    setSelectedProduct(product);
    setServerError(null);
    setModalMode("edit");
  }, []);

  const closeModal = useCallback(() => {
    setModalMode(null);
    setSelectedProduct(null);
    setServerError(null);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = useCallback(
    (data: any) => {
      setServerError(null);

      if (modalMode === "create") {
        createMutation.mutate(data as CreateProductPayload);
      } else if (modalMode === "edit" && selectedProduct) {
        updateMutation.mutate({ id: selectedProduct.id, data: data as UpdateProductPayload });
      }
    },
    [modalMode, selectedProduct, createMutation, updateMutation]
  );

  const handleDeleteConfirm = useCallback(() => {
    if (deleteConfirm) {
      deleteMutation.mutate(deleteConfirm.id);
    }
  }, [deleteConfirm, deleteMutation]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  return (
    <div className="space-y-6 relative">
      {/* Luces de fondo ambientadas */}
      <div className="absolute top-[-80px] right-[-80px] -z-10 h-[300px] w-[300px] rounded-full bg-[#5C8A3C]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[200px] left-[-80px] -z-10 h-[300px] w-[300px] rounded-full bg-[#E8DDD0]/20 dark:bg-slate-900/30 blur-[120px] pointer-events-none" />

      {/* Cabecera de Página */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#4A3728] dark:text-white leading-none">
            Productos
          </h1>
          <p className="mt-2 text-sm text-[#4A3728]/60 dark:text-slate-400 font-medium">
            Gestiona y cataloga los productos del inventario general
          </p>
        </div>
        <button 
          onClick={openCreateModal}
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#3D5A1E] to-[#5C8A3C] px-5 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(92,138,60,0.18)] hover:shadow-[0_4px_25px_rgba(92,138,60,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
        >
          <svg className="h-5 w-5 mr-2 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nuevo Producto
        </button>
      </div>

      {/* Controles de Búsqueda y Filtro */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Buscador */}
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <div className="relative group">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4A3728]/50 dark:text-slate-500 group-focus-within:text-[#3D5A1E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input 
              type="text" 
              value={searchInput} 
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por nombre o SKU..."
              className="block w-full rounded-xl border border-[#E8DDD0] dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 pl-11 pr-4 py-3 text-sm shadow-sm placeholder-[#4A3728]/40 dark:placeholder-slate-650 focus:outline-none focus:ring-4 focus:ring-[#3D5A1E]/10 focus:border-[#3D5A1E] text-[#4A3728] dark:text-white transition-all duration-300" 
            />
          </div>
        </form>

        {/* 👈 Selector de Categoría */}
        <div className="relative group sm:w-64">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4A3728]/50 dark:text-slate-550 group-focus-within:text-[#3D5A1E] transition-colors pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="block w-full rounded-xl border border-[#E8DDD0] dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 pl-11 pr-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-4 focus:ring-[#3D5A1E]/10 focus:border-[#3D5A1E] text-[#4A3728] dark:text-white transition-all duration-300 appearance-none cursor-pointer"
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid de Productos */}
      <ProductGrid 
        search={search} 
        categoryFilter={categoryFilter} 
        onEdit={openEditModal} 
        onDelete={setDeleteConfirm} 
      />

      {/* Modal Crear/Editar */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-955/40 backdrop-blur-md transition-opacity" onClick={closeModal} />
          <div className="relative bg-white dark:bg-slate-950 rounded-3xl border border-[#E8DDD0]/30 dark:border-slate-900/60 shadow-[0_24px_60px_rgba(0,0,0,0.12)] w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={closeModal}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-650 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer" 
              aria-label="Cerrar"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <ProductForm 
              product={selectedProduct} 
              onSubmit={handleSubmit} 
              onCancel={closeModal}
              isSubmitting={isSubmitting} 
              serverError={serverError} 
            />
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminar */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-955/40 backdrop-blur-md transition-opacity" onClick={() => !isDeleting && setDeleteConfirm(null)} />
          <div className="relative bg-white dark:bg-slate-950 rounded-3xl border border-rose-500/10 dark:border-slate-900/60 shadow-[0_24px_60px_rgba(0,0,0,0.12)] w-full max-w-sm p-6 md:p-8 text-center animate-in fade-in zoom-in-95 duration-200">
            <div>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/20 text-rose-650 dark:text-rose-450 border border-rose-100 dark:border-rose-900/30 mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="text-lg font-extrabold text-[#4A3728] dark:text-white leading-snug">Eliminar Producto</h3>
              <p className="mt-2.5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                ¿Estás seguro de eliminar <span className="font-extrabold text-[#4A3728] dark:text-white">{deleteConfirm.name}</span>?
              </p>
            </div>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button 
                onClick={() => setDeleteConfirm(null)} 
                disabled={isDeleting}
                className="rounded-xl border border-slate-200 dark:border-slate-800 px-5 py-2.5 text-sm font-bold text-slate-655 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                onClick={handleDeleteConfirm} 
                disabled={isDeleting}
                className="rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 cursor-pointer"
              >
                {isDeleting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
