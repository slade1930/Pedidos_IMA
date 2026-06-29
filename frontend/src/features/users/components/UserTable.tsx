"use client";

import { useState } from "react";
import { motion, type Variants } from "framer-motion";
import { useUsers } from "@/features/users/hooks/useUsers";
import type { User } from "@/features/users/types/user.types";
import type { UserRole } from "@/features/auth/types/auth.types";

// ─── CONSTANTES ────────────────────────────────────────────

const PAGE_SIZE = 10;

const VALID_ROLES: UserRole[] = ["admin", "staff", "client"];

// ─── PROPS ─────────────────────────────────────────────────

interface UserTableProps {
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  search?: string;
  roleFilter?: string;
}

// ─── UTILITARIOS ───────────────────────────────────────────

function isValidRole(role: string): role is UserRole {
  return VALID_ROLES.includes(role as UserRole);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-PA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getRoleBadgeClass(role: string): string {
  switch (role) {
    case "admin":
      return "bg-gradient-to-r from-purple-500/10 to-purple-600/15 border-purple-500/25 text-purple-700 shadow-sm";
    case "staff":
      return "bg-gradient-to-r from-blue-500/10 to-blue-600/15 border-blue-500/25 text-blue-700 shadow-sm";
    case "client":
      return "bg-gradient-to-r from-[#4A3728]/5 to-[#4A3728]/12 border-[#4A3728]/20 text-[#4A3728] shadow-sm";
    default:
      return "bg-gradient-to-r from-gray-500/10 to-gray-600/15 border-gray-500/25 text-gray-700 shadow-sm";
  }
}

// ─── SKELETON ──────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="animate-pulse divide-y divide-[#E8DDD0]/15">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-6 py-4.5 border-b border-[#E8DDD0]/10"
        >
          <div className="h-4 w-16 bg-[#E8DDD0]/35 rounded-md" />
          <div className="h-4 w-28 bg-[#E8DDD0]/40 rounded-md" />
          <div className="h-4 w-36 bg-[#E8DDD0]/30 rounded-md" />
          <div className="h-5 w-16 bg-[#E8DDD0]/35 rounded-full" />
          <div className="h-4 w-20 bg-[#E8DDD0]/30 rounded-md" />
          <div className="h-4.5 w-24 bg-[#E8DDD0]/30 rounded-md" />
          <div className="h-7 w-28 bg-[#E8DDD0]/25 rounded-xl ml-auto" />
        </div>
      ))}
    </div>
  );
}

// ─── COMPONENTE ────────────────────────────────────────────

export function UserTable({ onEdit, onDelete, search, roleFilter }: UserTableProps) {
  const [skip, setSkip] = useState(0);
  const page = Math.floor(skip / PAGE_SIZE) + 1;

  const filters = {
    skip,
    limit: PAGE_SIZE,
    ...(search && { search }),
    ...(roleFilter && isValidRole(roleFilter) && { role: roleFilter }),
  };

  const { data, isPending, isError, error, isFetching } = useUsers(filters);

  const users = data?.data ?? [];
  const totalPages = data?.pages ?? 1;
  const totalItems = data?.total ?? 0;

  // Stagger animation configuration
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.03 },
    },
  };

  const rowVariants: Variants = {
    hidden: { opacity: 0, y: 8 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 350, damping: 28 } 
    },
  };

  // ─── RENDER ─────────────────────────────────────────

  return (
    <div className="bg-gradient-to-br from-white/95 via-white/80 to-[#E8DDD0]/20 backdrop-blur-md rounded-2xl border border-[#E8DDD0]/40 shadow-sm overflow-hidden transition-all duration-300">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-[#E8DDD0]/40 bg-[#E8DDD0]/15">
              <th className="px-6 py-3.5 text-left text-[10px] font-bold text-[#4A3728]/60 uppercase tracking-widest leading-none">
                Cédula
              </th>
              <th className="px-6 py-3.5 text-left text-[10px] font-bold text-[#4A3728]/60 uppercase tracking-widest leading-none">
                Nombre
              </th>
              <th className="px-6 py-3.5 text-left text-[10px] font-bold text-[#4A3728]/60 uppercase tracking-widest leading-none">
                Email
              </th>
              <th className="px-6 py-3.5 text-left text-[10px] font-bold text-[#4A3728]/60 uppercase tracking-widest leading-none">
                Rol
              </th>
              <th className="px-6 py-3.5 text-left text-[10px] font-bold text-[#4A3728]/60 uppercase tracking-widest leading-none">
                Estado
              </th>
              <th className="px-6 py-3.5 text-left text-[10px] font-bold text-[#4A3728]/60 uppercase tracking-widest leading-none">
                Creado
              </th>
              <th className="px-6 py-3.5 text-right text-[10px] font-bold text-[#4A3728]/60 uppercase tracking-widest leading-none">
                Acciones
              </th>
            </tr>
          </thead>
          
          {isPending ? (
            <tbody>
              <tr>
                <td colSpan={7} className="p-0">
                  <TableSkeleton />
                </td>
              </tr>
            </tbody>
          ) : isError ? (
            <tbody>
              <tr>
                <td colSpan={7} className="px-6 py-14 text-center">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-red-50 text-red-600 mb-3 border border-red-200/50">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  </div>
                  <p className="text-red-700 font-bold text-base leading-none">Error al cargar usuarios</p>
                  <p className="text-xs text-neutral-400 mt-2 max-w-xs mx-auto">
                    {(error as { message?: string })?.message || "Intenta nuevamente"}
                  </p>
                </td>
              </tr>
            </tbody>
          ) : users.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-[#E8DDD0]/40 text-[#4A3728]/70 mb-3 relative">
                    <div className="absolute inset-0 rounded-full bg-[#4A3728]/10 animate-ping opacity-25" />
                    <svg className="h-6 w-6 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-[#4A3728] leading-none">No se encontraron usuarios</p>
                  <p className="text-xs text-[#4A3728]/55 mt-2 max-w-[240px] mx-auto">Prueba ajustando los filtros de búsqueda o el rol seleccionado.</p>
                </td>
              </tr>
            </tbody>
          ) : (
            <motion.tbody 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="divide-y divide-[#E8DDD0]/20"
            >
              {users.map((user) => (
                <motion.tr
                  key={user.id}
                  variants={rowVariants}
                  whileHover={{ backgroundColor: "rgba(232, 221, 208, 0.15)" }}
                  className="transition-colors border-b border-[#E8DDD0]/15"
                >
                  <td className="px-6 py-4 text-neutral-400 font-mono text-[10px] tracking-wider font-semibold whitespace-nowrap">
                    {user.cedula}
                  </td>
                  <td className="px-6 py-4 text-[#4A3728] font-bold whitespace-nowrap">
                    {user.full_name}
                  </td>
                  <td className="px-6 py-4 text-neutral-500 font-medium whitespace-nowrap">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide leading-none capitalize ${getRoleBadgeClass(user.role)}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                        user.is_active ? "text-[#3D5A1E]" : "text-[#C94B32]"
                      }`}
                    >
                      {user.is_active ? (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5C8A3C] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3D5A1E] shadow-[0_0_6px_#3D5A1E]"></span>
                        </span>
                      ) : (
                        <span className="relative flex h-2 w-2">
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C94B32] shadow-[0_0_6px_#C94B32]"></span>
                        </span>
                      )}
                      {user.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-neutral-500 font-medium whitespace-nowrap">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEdit?.(user)}
                        className="rounded-xl px-3 py-1.5 text-xs font-bold text-[#3D5A1E] border border-transparent hover:bg-[#3D5A1E]/8 hover:border-[#3D5A1E]/30 bg-transparent transition-all duration-200"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onDelete?.(user)}
                        className="rounded-xl px-3 py-1.5 text-xs font-bold text-[#C94B32] border border-transparent hover:bg-[#C94B32]/8 hover:border-[#C94B32]/30 bg-transparent transition-all duration-200"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          )}
        </table>
      </div>

      {/* Paginación */}
      {!isPending && !isError && users.length > 0 && (
        <div className="flex items-center justify-between px-6 py-4.5 border-t border-[#E8DDD0]/40 bg-[#E8DDD0]/10">
          <p className="text-xs font-semibold text-[#4A3728]/70">
            Mostrando{" "}
            <span className="font-extrabold text-[#4A3728]">{skip + 1}</span>
            {" "}-{" "}
            <span className="font-extrabold text-[#4A3728]">
              {Math.min(skip + PAGE_SIZE, totalItems)}
            </span>
            {" "}de{" "}
            <span className="font-extrabold text-[#4A3728]">{totalItems}</span> usuarios
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSkip((p) => Math.max(0, p - PAGE_SIZE))}
              disabled={skip <= 0 || isFetching}
              className="rounded-xl border border-[#E8DDD0] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#4A3728] bg-white/60 hover:bg-[#E8DDD0]/25 disabled:opacity-40 disabled:hover:bg-white/60 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            >
              Anterior
            </button>
            <span className="text-xs font-bold text-[#4A3728]/80">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setSkip((p) => Math.min((totalPages - 1) * PAGE_SIZE, p + PAGE_SIZE))}
              disabled={skip >= (totalPages - 1) * PAGE_SIZE || isFetching}
              className="rounded-xl border border-[#E8DDD0] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#4A3728] bg-white/60 hover:bg-[#E8DDD0]/25 disabled:opacity-40 disabled:hover:bg-white/60 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserTable;