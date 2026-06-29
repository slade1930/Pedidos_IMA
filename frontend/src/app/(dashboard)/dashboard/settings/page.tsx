"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { userService } from "@/features/users/services/user.service";
import type { UpdateUserPayload } from "@/features/users/types/user.types";
import { motion } from "framer-motion";

// ─── COMPONENTE ────────────────────────────────────────────

/**
 * Página de Configuración
 * 
 * Ruta: /dashboard/settings
 * Layout: (dashboard) → ProtectedLayout
 */
export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ─── MUTACIÓN: ACTUALIZAR PERFIL ────────────────────
  const profileMutation = useMutation({
    mutationFn: (data: UpdateUserPayload) => {
      if (!user) throw new Error("No autenticado");
      return userService.updateMe(data);
    },
    onSuccess: (data) => {
      setUser(data);
      setProfileSuccess(true);
      setErrorMessage(null);
      setTimeout(() => setProfileSuccess(false), 4000);
    },
    onError: (error: { message: string }) => {
      setErrorMessage(error.message || "Error al actualizar perfil");
    },
  });

  // ─── MUTACIÓN: CAMBIAR CONTRASEÑA ───────────────────
  const passwordMutation = useMutation({
    mutationFn: (password: string) => {
      if (!user) throw new Error("No autenticado");
      return userService.updateMe({ password } as UpdateUserPayload);
    },
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess(true);
      setErrorMessage(null);
      setTimeout(() => setPasswordSuccess(false), 4000);
    },
    onError: (error: { message: string }) => {
      setErrorMessage(error.message || "Error al cambiar contraseña");
    },
  });

  // ─── HANDLERS ───────────────────────────────────────
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setProfileSuccess(false);

    if (!fullName.trim()) {
      setErrorMessage("El nombre es obligatorio");
      return;
    }

    if (!email.trim()) {
      setErrorMessage("El correo electrónico es obligatorio");
      return;
    }

    profileMutation.mutate({
      full_name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim() || null,
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setPasswordSuccess(false);

    if (!currentPassword) {
      setErrorMessage("Debes ingresar tu contraseña actual");
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setErrorMessage("La nueva contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden");
      return;
    }

    passwordMutation.mutate(newPassword);
  };

  const isSubmitting = profileMutation.isPending || passwordMutation.isPending;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-8 max-w-2xl text-white"
    >
      {/* Estilos CSS personalizados de la paleta Chocolate, Verde, Amarillo y Blanco */}
      <style>{`
        .chocolate-panel {
          background-color: #2D1A10; /* Chocolate oscuro */
          border: 2px solid #3A5F26; /* Verde */
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        }
        .yellow-btn {
          background-color: #FBBF24; /* Amarillo */
          color: #1E120C; /* Chocolate oscuro */
          font-weight: 700;
          box-shadow: 0 4px 14px rgba(251, 191, 36, 0.4);
          transition: all 0.2s ease-in-out;
        }
        .yellow-btn:hover {
          background-color: #F59E0B;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(245, 158, 11, 0.5);
        }
        .yellow-btn:active {
          transform: translateY(1px);
        }
        .chocolate-input {
          background-color: #1E120C;
          border: 2px solid #3A5F26;
          color: #FFFFFF;
        }
        .chocolate-input:focus {
          border-color: #FBBF24;
          outline: none;
        }
      `}</style>

      {/* Cabecera */}
      <div className="border-b-2 border-[#3A5F26] pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Configuración</h1>
        <p className="mt-2 text-sm text-gray-200 font-medium">Gestiona tu perfil y la seguridad de tu cuenta</p>
      </div>

      {/* Alerta de Error */}
      {errorMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-red-950/80 border-2 border-red-600 p-4 shadow-lg"
        >
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <p className="text-sm text-red-200 font-bold">{errorMessage}</p>
          </div>
        </motion.div>
      )}

      {/* Sección: Perfil */}
      <div className="chocolate-panel rounded-2xl p-6 space-y-6">
        {/* Cabecera de Sección */}
        <div className="flex items-center gap-4 pb-4 border-b border-[#3A5F26]/30">
          <div className="h-12 w-12 rounded-xl bg-[#FBBF24] border-2 border-[#3A5F26] flex items-center justify-center shadow-md">
            <span className="text-lg font-black text-[#1E120C]">
              {user?.full_name?.charAt(0).toUpperCase() ?? "U"}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Información del Perfil</h2>
            <p className="text-xs text-gray-300 font-semibold mt-0.5">Actualiza tu información personal de contacto</p>
          </div>
        </div>

        {/* Alerta Éxito Perfil */}
        {profileSuccess && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl bg-[#1B4314]/80 border-2 border-[#22C55E] p-4 shadow-md"
          >
            <p className="text-sm text-[#4ADE80] font-bold">Perfil actualizado correctamente</p>
          </motion.div>
        )}

        {/* Formulario Perfil */}
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="full_name" className="block text-sm font-bold text-white">Nombre completo</label>
            <input 
              id="full_name" 
              type="text" 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)}
              disabled={isSubmitting}
              className="chocolate-input block w-full rounded-xl px-4 py-3 text-sm placeholder-gray-400 focus:ring-2 focus:ring-[#FBBF24] disabled:opacity-50 transition-all"
              placeholder="Tu nombre completo" 
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-bold text-white">Correo electrónico</label>
            <input 
              id="email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className="chocolate-input block w-full rounded-xl px-4 py-3 text-sm placeholder-gray-400 focus:ring-2 focus:ring-[#FBBF24] disabled:opacity-50 transition-all"
              placeholder="correo@ejemplo.com" 
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="block text-sm font-bold text-white">
              Teléfono <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input 
              id="phone" 
              type="tel" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)}
              disabled={isSubmitting}
              className="chocolate-input block w-full rounded-xl px-4 py-3 text-sm placeholder-gray-400 focus:ring-2 focus:ring-[#FBBF24] disabled:opacity-50 transition-all"
              placeholder="6666-6666" 
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t-2 border-[#3A5F26]/30">
            <div className="text-sm font-bold text-white">
              Rol de cuenta:{" "}
              <span className="inline-flex rounded-lg bg-black/50 border border-[#3A5F26] px-3 py-1 text-xs font-bold text-[#FBBF24] capitalize shadow-inner">
                {user?.role ?? "—"}
              </span>
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="yellow-btn rounded-xl px-5 py-2.5 text-sm disabled:opacity-50 transition-all cursor-pointer"
            >
              {profileMutation.isPending ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>

      {/* Sección: Contraseña */}
      <div className="chocolate-panel rounded-2xl p-6 space-y-6">
        {/* Cabecera de Sección */}
        <div className="pb-4 border-b border-[#3A5F26]/30">
          <h2 className="text-lg font-bold text-white">Cambiar Contraseña</h2>
          <p className="text-xs text-gray-300 font-semibold mt-0.5">Asegura tu cuenta actualizando tu contraseña periódicamente</p>
        </div>

        {/* Alerta Éxito Contraseña */}
        {passwordSuccess && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl bg-[#1B4314]/80 border-2 border-[#22C55E] p-4 shadow-md"
          >
            <p className="text-sm text-[#4ADE80] font-bold">Contraseña actualizada correctamente</p>
          </motion.div>
        )}

        {/* Formulario Contraseña */}
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="currentPassword" className="block text-sm font-bold text-white">Contraseña actual</label>
            <input 
              id="currentPassword" 
              type="password" 
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)} 
              disabled={isSubmitting}
              autoComplete="current-password"
              className="chocolate-input block w-full rounded-xl px-4 py-3 text-sm placeholder-gray-400 focus:ring-2 focus:ring-[#FBBF24] disabled:opacity-50 transition-all"
              placeholder="••••••••" 
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="newPassword" className="block text-sm font-bold text-white">Nueva contraseña</label>
            <input 
              id="newPassword" 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)} 
              disabled={isSubmitting}
              autoComplete="new-password"
              className="chocolate-input block w-full rounded-xl px-4 py-3 text-sm placeholder-gray-400 focus:ring-2 focus:ring-[#FBBF24] disabled:opacity-50 transition-all"
              placeholder="Mínimo 8 caracteres" 
            />
            {newPassword && newPassword.length < 8 && (
              <p className="mt-1 text-xs text-red-400 font-bold">La contraseña debe tener al menos 8 caracteres</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-bold text-white">Confirmar nueva contraseña</label>
            <input 
              id="confirmPassword" 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} 
              disabled={isSubmitting}
              autoComplete="new-password"
              className={`chocolate-input block w-full rounded-xl px-4 py-3 text-sm placeholder-gray-400 focus:ring-2 focus:ring-[#FBBF24] disabled:opacity-50 transition-all ${
                confirmPassword && newPassword !== confirmPassword ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""
              }`}
              placeholder="Repite la contraseña" 
            />
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="mt-1 text-xs text-red-500 font-bold">Las contraseñas no coinciden</p>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t-2 border-[#3A5F26]/30">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="yellow-btn rounded-xl px-5 py-2.5 text-sm disabled:opacity-50 transition-all cursor-pointer"
            >
              {passwordMutation.isPending ? "Cambiando..." : "Cambiar Contraseña"}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}