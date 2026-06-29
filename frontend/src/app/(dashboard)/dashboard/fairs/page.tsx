// src/app/(dashboard)/fairs/page.tsx

"use client";

import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FairList } from "@/features/fairs/components/FairList";
import { FairForm } from "@/features/fairs/components/FairForm";
import { fairService } from "@/features/fairs/services/fair.service";
import type { Fair, CreateFairPayload, UpdateFairPayload } from "@/features/fairs/types/fair.types";

// ─── TIPOS LOCALES ────────────────────────────────────────

type ModalMode = "create" | "edit" | null;

// ─── COMPONENTE ────────────────────────────────────────────

/**
 * Página de Gestión de Ferias
 * 
 * Ruta: /dashboard/fairs
 * Layout: (dashboard) → ProtectedLayout
 */
export default function FairsPage() {
  const queryClient = useQueryClient();

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedFair, setSelectedFair] = useState<Fair | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Fair | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [serverError, setServerError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  // ─── MUTACIÓN: CREAR ────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data: CreateFairPayload) => fairService.createFair(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fairs"] });
      closeModal();
    },
    onError: (error: { message: string }) => {
      setServerError(error.message || "Error al crear feria");
    },
  });

  // ─── MUTACIÓN: ACTUALIZAR ───────────────────────────
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFairPayload }) =>
      fairService.updateFair(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fairs"] });
      closeModal();
    },
    onError: (error: { message: string }) => {
      setServerError(error.message || "Error al actualizar feria");
    },
  });

  // ─── MUTACIÓN: ELIMINAR ─────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => fairService.deleteFair(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fairs"] });
      setDeleteConfirm(null);
    },
  });

  // ─── HANDLERS ───────────────────────────────────────
  const openCreateModal = useCallback(() => {
    setSelectedFair(null);
    setServerError(null);
    setModalMode("create");
  }, []);

  const openEditModal = useCallback((fair: Fair) => {
    setSelectedFair(fair);
    setServerError(null);
    setModalMode("edit");
  }, []);

  const closeModal = useCallback(() => {
    setModalMode(null);
    setSelectedFair(null);
    setServerError(null);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = useCallback(
    (data: any) => {
      setServerError(null);

      if (modalMode === "create") {
        createMutation.mutate(data as CreateFairPayload);
      } else if (modalMode === "edit" && selectedFair) {
        updateMutation.mutate({ id: selectedFair.id, data: data as UpdateFairPayload });
      }
    },
    [modalMode, selectedFair, createMutation, updateMutation]
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
            Ferias
          </h1>
          <p className="mt-2 text-sm text-[#4A3728]/60 dark:text-slate-400 font-medium">
            Gestiona y visualiza las ferias activas del sistema
          </p>
        </div>
        <button 
          onClick={openCreateModal}
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#3D5A1E] to-[#5C8A3C] px-5 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(92,138,60,0.18)] hover:shadow-[0_4px_25px_rgba(92,138,60,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
        >
          <svg className="h-5 w-5 mr-2 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nueva Feria
        </button>
      </div>

      {/* Buscador & Filtrador */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <div className="relative group">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4A3728]/50 dark:text-slate-500 group-focus-within:text-[#3D5A1E] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input 
              type="text" 
              value={searchInput} 
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por nombre o ubicación..."
              className="block w-full rounded-xl border border-[#E8DDD0] dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 pl-11 pr-4 py-3 text-sm shadow-sm placeholder-[#4A3728]/40 dark:placeholder-slate-650 focus:outline-none focus:ring-4 focus:ring-[#3D5A1E]/10 focus:border-[#3D5A1E] text-[#4A3728] dark:text-white transition-all duration-300" 
            />
          </div>
        </form>
        
        {/* Selector de Estado */}
        <div className="relative min-w-[200px]">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full rounded-xl border border-[#E8DDD0] dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 pl-4 pr-10 py-3 text-sm shadow-sm focus:outline-none focus:ring-4 focus:ring-[#3D5A1E]/10 focus:border-[#3D5A1E] text-[#4A3728] dark:text-white transition-all duration-300 appearance-none"
          >
            <option value="">Todos los estados</option>
            <option value="upcoming">Próxima</option>
            <option value="active">Activa</option>
            <option value="paused">Pausada</option>
            <option value="finished">Finalizada</option>
            <option value="cancelled">Cancelada</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#4A3728]/60 dark:text-slate-500">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Grid List de Ferias */}
      <FairList search={search} statusFilter={statusFilter} onEdit={openEditModal} onDelete={setDeleteConfirm} />

      {/* Modal Crear/Editar */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md transition-opacity" onClick={closeModal} />
          <div className="relative bg-white dark:bg-slate-950 rounded-3xl border border-[#E8DDD0]/30 dark:border-slate-900/60 shadow-[0_24px_60px_rgba(0,0,0,0.12)] w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={closeModal}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-650 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors" 
              aria-label="Cerrar"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <FairForm fair={selectedFair} onSubmit={handleSubmit} onCancel={closeModal}
              isSubmitting={isSubmitting} serverError={serverError} />
          </div>
        </div>
      )}

      {/* Modal Confirmar Eliminar */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md transition-opacity" onClick={() => !isDeleting && setDeleteConfirm(null)} />
          <div className="relative bg-white dark:bg-slate-950 rounded-3xl border border-rose-500/10 dark:border-slate-900/60 shadow-[0_24px_60px_rgba(0,0,0,0.12)] w-full max-w-sm p-6 md:p-8 text-center animate-in fade-in zoom-in-95 duration-200">
            <div>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/20 text-rose-650 dark:text-rose-450 border border-rose-100 dark:border-rose-900/30 mb-4">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="text-lg font-extrabold text-[#4A3728] dark:text-white leading-snug">Eliminar Feria</h3>
              <p className="mt-2.5 text-sm text-slate-505 dark:text-slate-400 leading-relaxed font-normal">
                ¿Estás seguro de eliminar <span className="font-extrabold text-[#4A3728] dark:text-white">{deleteConfirm.name}</span>?
              </p>
            </div>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button 
                onClick={() => setDeleteConfirm(null)} 
                disabled={isDeleting}
                className="rounded-xl border border-slate-200 dark:border-slate-800 px-5 py-2.5 text-sm font-bold text-slate-655 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95 transition-all duration-200"
              >
                Cancelar
              </button>
              <button 
                onClick={handleDeleteConfirm} 
                disabled={isDeleting}
                className="rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:shadow-lg active:scale-95 transition-all duration-200"
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