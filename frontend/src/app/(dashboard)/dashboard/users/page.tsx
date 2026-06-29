"use client";

import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { UserTable } from "@/features/users/components/UserTable";
import { UserForm } from "@/features/users/components/UserForm";
import { userService } from "@/features/users/services/user.service";
import type { User, CreateUserPayload, AdminUpdateUserPayload } from "@/features/users/types/user.types";
import type { UserRole } from "@/features/auth/types/auth.types";

// ─── TIPOS LOCALES ────────────────────────────────────────

type ModalMode = "create" | "edit" | null;

// ─── COMPONENTE ────────────────────────────────────────────

/**
 * Página de Gestión de Usuarios
 * 
 * Ruta: /dashboard/users
 * Layout: (dashboard) → ProtectedLayout
 */
export default function UsersPage() {
  const queryClient = useQueryClient();

  // ─── ESTADO LOCAL ───────────────────────────────────
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<User | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [serverError, setServerError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  // ─── MUTACIÓN: CREAR ────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data: CreateUserPayload) => userService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      closeModal();
    },
    onError: (error: { message: string }) => {
      setServerError(error.message || "Error al crear usuario");
    },
  });

  // ─── MUTACIÓN: ACTUALIZAR ───────────────────────────
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdminUpdateUserPayload }) =>
      userService.adminUpdate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      closeModal();
    },
    onError: (error: { message: string }) => {
      setServerError(error.message || "Error al actualizar usuario");
    },
  });

  // ─── MUTACIÓN: DESACTIVAR ───────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => userService.deactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setDeleteConfirm(null);
    },
  });

  // ─── HANDLERS ───────────────────────────────────────
  const openCreateModal = useCallback(() => {
    setSelectedUser(null);
    setServerError(null);
    setModalMode("create");
  }, []);

  const openEditModal = useCallback((user: User) => {
    setSelectedUser(user);
    setServerError(null);
    setModalMode("edit");
  }, []);

  const closeModal = useCallback(() => {
    setModalMode(null);
    setSelectedUser(null);
    setServerError(null);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = useCallback(
    (data: any) => {
      setServerError(null);

      if (modalMode === "create") {
        createMutation.mutate(data as CreateUserPayload);
      } else if (modalMode === "edit" && selectedUser) {
        updateMutation.mutate({ id: selectedUser.id, data: data as AdminUpdateUserPayload });
      }
    },
    [modalMode, selectedUser, createMutation, updateMutation]
  );

  const handleDeleteConfirm = useCallback(() => {
    if (deleteConfirm) {
      deleteMutation.mutate(deleteConfirm.id);
    }
  }, [deleteConfirm, deleteMutation]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  // ─── RENDER ─────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#4A3728] tracking-tight leading-none">Usuarios</h1>
          <p className="mt-1.5 text-xs font-semibold text-neutral-400/90 uppercase tracking-wider">Gestiona los usuarios del sistema</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#3D5A1E] to-[#5C8A3C] hover:from-[#2D4A0E] hover:to-[#3D5A1E] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all duration-200 shadow-[0_2px_8px_rgba(61,90,30,0.15)] hover:shadow-[0_4px_16px_rgba(61,90,30,0.25)]"
        >
          <svg className="h-4.5 w-4.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nuevo Usuario
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <div className="relative bg-[#E8DDD0]/15 hover:bg-[#E8DDD0]/25 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#3D5A1E]/15 border border-[#E8DDD0]/80 focus-within:border-[#3D5A1E]/60 transition-all duration-200 rounded-xl">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#3D5A1E]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input 
              type="text" 
              value={searchInput} 
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por nombre o email..."
              className="block w-full bg-transparent pl-10 pr-4 py-2.5 text-sm text-[#4A3728] placeholder-neutral-400/80 focus:outline-none" 
            />
          </div>
        </form>
        <select 
          value={roleFilter} 
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-[#E8DDD0]/15 hover:bg-[#E8DDD0]/25 focus:bg-white focus:ring-2 focus:ring-[#3D5A1E]/15 border border-[#E8DDD0]/80 focus:border-[#3D5A1E]/60 transition-all duration-200 rounded-xl px-4 py-2.5 text-sm text-[#4A3728] font-bold focus:outline-none cursor-pointer shadow-sm"
        >
          <option value="">Todos los roles</option>
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
          <option value="client">Client</option>
        </select>
      </div>

      {/* Users Table */}
      <UserTable search={search} roleFilter={roleFilter} onEdit={openEditModal} onDelete={setDeleteConfirm} />

      {/* Modal Crear/Editar */}
      <AnimatePresence>
        {modalMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Chocolate-tinted blur backdrop */}
            <div className="absolute inset-0 bg-[#4A3728]/40 backdrop-blur-sm" onClick={closeModal} />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative bg-gradient-to-br from-white via-white to-[#E8DDD0]/15 backdrop-blur-xl border border-white/60 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 relative z-10"
            >
              <button 
                onClick={closeModal}
                className="absolute top-4 right-4 p-1.5 rounded-xl text-neutral-400/80 hover:text-[#4A3728] hover:bg-[#E8DDD0]/20 transition-all duration-200" 
                aria-label="Cerrar"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <UserForm 
                user={selectedUser} 
                onSubmit={handleSubmit} 
                onCancel={closeModal}
                isSubmitting={isSubmitting} 
                serverError={serverError} 
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Confirmar Desactivar */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Chocolate-tinted blur backdrop */}
            <div className="absolute inset-0 bg-[#4A3728]/40 backdrop-blur-sm" onClick={() => !isDeleting && setDeleteConfirm(null)} />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative bg-gradient-to-br from-white via-white to-[#E8DDD0]/15 backdrop-blur-xl border border-white/60 rounded-2xl shadow-2xl w-full max-w-sm p-6 relative z-10"
            >
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 text-[#C94B32] shadow-sm relative overflow-hidden">
                  <span className="absolute inset-0 rounded-full bg-red-500/5 animate-pulse" />
                  <svg className="h-6 w-6 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-black text-[#4A3728] tracking-tight">Desactivar Usuario</h3>
                <p className="mt-2 text-sm text-neutral-500">
                  ¿Estás seguro de desactivar a <span className="font-bold text-[#4A3728]">{deleteConfirm.full_name}</span>?
                </p>
              </div>
              <div className="mt-6 flex items-center justify-center gap-3">
                <button 
                  onClick={() => setDeleteConfirm(null)} 
                  disabled={isDeleting}
                  className="rounded-xl border border-[#E8DDD0] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#4A3728] bg-white/60 hover:bg-[#E8DDD0]/20 disabled:opacity-40 disabled:hover:bg-white/60 transition-all duration-200 shadow-sm"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleDeleteConfirm} 
                  disabled={isDeleting}
                  className="rounded-xl bg-gradient-to-r from-[#C94B32] to-[#de5d43] hover:from-[#b53e26] hover:to-[#C94B32] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-[0_2px_8px_rgba(201,75,50,0.15)] hover:shadow-[0_4px_16px_rgba(201,75,50,0.25)]"
                >
                  {isDeleting ? "Desactivando..." : "Desactivar"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}