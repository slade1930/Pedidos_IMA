"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import type { User } from "@/features/users/types/user.types";

// ─── PROPS ─────────────────────────────────────────────────

interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
}

// ─── UTILITARIOS ───────────────────────────────────────────

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-PA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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

// ─── COMPONENTE ────────────────────────────────────────────

export function UserCard({ user, onEdit, onDelete }: UserCardProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="bg-gradient-to-br from-white/95 via-white/80 to-[#E8DDD0]/20 backdrop-blur-md rounded-2xl border border-[#E8DDD0]/40 overflow-hidden shadow-sm hover:shadow-md hover:shadow-[#4A3728]/5 transition-all duration-300 relative group"
      style={{
        boxShadow: isHovered
          ? "0 14px 34px -10px rgba(61, 90, 30, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6)"
          : "0 1px 3px 0 rgba(0, 0, 0, 0.02), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
      }}
    >
      {/* Dynamic Cursor Spotlight Glow */}
      <span
        className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-500 z-0"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(150px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(92, 138, 60, 0.07), transparent 85%)`,
        }}
      />

      {/* Header Info */}
      <div className="px-6 pt-6 pb-4.5 flex items-center gap-4 relative z-10">
        <div className="flex-shrink-0 h-13 w-13 rounded-full bg-gradient-to-br from-[#3D5A1E]/10 to-[#5C8A3C]/20 border border-white/40 flex items-center justify-center shadow-inner relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="text-base font-black text-[#3D5A1E] tracking-tight">{user.full_name}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-black text-[#4A3728] tracking-tight truncate leading-tight">{user.full_name}</h3>
          <p className="text-xs font-semibold text-neutral-400/90 truncate mt-0.5">{user.email}</p>
        </div>
        <div className="flex-shrink-0">
          <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide leading-none capitalize ${getRoleBadgeClass(user.role)}`}>
            {user.role}
          </span>
        </div>
      </div>

      {/* User Attributes Grid */}
      <div className="px-6 py-4.5 border-t border-[#E8DDD0]/20 space-y-3 relative z-10 bg-white/30">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-[#4A3728]/50 uppercase tracking-widest">Cédula</span>
          <span className="text-xs font-bold text-[#4A3728]">{user.cedula}</span>
        </div>

        {user.phone && (
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#4A3728]/50 uppercase tracking-widest">Teléfono</span>
            <span className="text-xs font-bold text-[#4A3728]">{user.phone}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-[#4A3728]/50 uppercase tracking-widest">Estado</span>
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${user.is_active ? "text-[#3D5A1E]" : "text-[#C94B32]"}`}>
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
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-[#4A3728]/50 uppercase tracking-widest">Verificado</span>
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${user.is_verified ? "text-[#3D5A1E]" : "text-[#C78500]"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${user.is_verified ? "bg-[#3D5A1E] shadow-[0_0_4px_#3D5A1E]" : "bg-[#F2A900] shadow-[0_0_4px_#F2A900]"}`} />
            {user.is_verified ? "Sí" : "No"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-[#4A3728]/50 uppercase tracking-widest">ID</span>
          <span className="text-[10px] font-mono font-semibold text-neutral-400 select-all">{user.id}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-[#4A3728]/50 uppercase tracking-widest">Creado</span>
          <span className="text-xs font-semibold text-[#4A3728]/85">{formatDateTime(user.created_at)}</span>
        </div>
      </div>

      {/* Action Bar Footer */}
      {(onEdit || onDelete) && (
        <div className="px-6 py-3 border-t border-[#E8DDD0]/35 bg-[#E8DDD0]/10 flex items-center justify-end gap-1 relative z-10">
          {onEdit && (
            <button 
              onClick={() => onEdit(user)}
              className="rounded-xl px-3.5 py-1.5 text-xs font-bold text-[#3D5A1E] border border-transparent hover:bg-[#3D5A1E]/8 hover:border-[#3D5A1E]/30 bg-transparent transition-all duration-200"
            >
              Editar
            </button>
          )}
          {onDelete && (
            <button 
              onClick={() => onDelete(user)}
              className="rounded-xl px-3.5 py-1.5 text-xs font-bold text-[#C94B32] border border-transparent hover:bg-[#C94B32]/8 hover:border-[#C94B32]/30 bg-transparent transition-all duration-200"
            >
              Desactivar
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default UserCard;