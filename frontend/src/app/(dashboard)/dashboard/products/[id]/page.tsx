// src/app/(dashboard)/products/[id]/page.tsx

"use client";

import { useParams, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useProduct } from "@/features/products/hooks/useProduct";
import { ProductCard } from "@/features/products/components/ProductCard";
import { ProductForm } from "@/features/products/components/ProductForm";
import { productService } from "@/features/products/services/product.service";
import type { UpdateProductPayload } from "@/features/products/types/product.types";

// ─── COMPONENTE ────────────────────────────────────────────

/**
 * Página de Detalle de Producto
 * 
 * Ruta: /dashboard/products/:id
 * Layout: (dashboard) → ProtectedLayout
 */
export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const productId = params.id as string;

  const { data: product, isPending, isError } = useProduct(productId);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // ─── MUTACIÓN: ACTUALIZAR ───────────────────────────
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductPayload }) =>
      productService.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setShowEditModal(false);
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
      router.push("/dashboard/products");
    },
  });

  // ─── HANDLERS ───────────────────────────────────────
  const handleEdit = () => {
    setServerError(null);
    setShowEditModal(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditSubmit = (data: any) => {
    updateMutation.mutate({ id: productId, data: data as UpdateProductPayload });
  };

  const handleDelete = () => {
    deleteMutation.mutate(productId);
  };

  // ─── LOADING ────────────────────────────────────────
  if (isPending) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  // ─── ERROR ──────────────────────────────────────────
  if (isError || !product) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Producto no encontrado</h2>
        <p className="mt-2 text-sm text-gray-500">El producto que buscas no existe o fue eliminado.</p>
        <button onClick={() => router.push("/dashboard/products")}
          className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors">
          Volver a Productos
        </button>
      </div>
    );
  }

  // ─── RENDER ─────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push("/dashboard/products")}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Productos
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-900 font-medium truncate">{product.name}</span>
      </div>

      <div className="max-w-2xl">
        <ProductCard product={product} onEdit={handleEdit} onDelete={() => setShowDeleteConfirm(true)} />
      </div>

      {/* Modal Editar */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-600/50" onClick={() => setShowEditModal(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <button onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors" aria-label="Cerrar">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <ProductForm product={product} onSubmit={handleEditSubmit} onCancel={() => setShowEditModal(false)}
              isSubmitting={updateMutation.isPending} serverError={serverError} />
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminar */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-600/50" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Eliminar Producto</h3>
              <p className="mt-2 text-sm text-gray-500">
                ¿Estás seguro de eliminar <span className="font-medium text-gray-900">{product.name}</span>?
              </p>
            </div>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} disabled={deleteMutation.isPending}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors">
                Cancelar
              </button>
              <button onClick={handleDelete} disabled={deleteMutation.isPending}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50 transition-colors">
                {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}