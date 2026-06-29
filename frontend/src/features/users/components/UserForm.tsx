"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createUserSchema,
  updateUserSchema,
} from "@/features/users/schemas/user.schema";
import type { User } from "@/features/users/types/user.types";

// ─── TIPOS DEL FORMULARIO ──────────────────────────────────

type CreateUserInput = {
  full_name: string;
  cedula: string;
  email: string;
  phone?: string;
  password: string;
  confirm_password: string;
  role?: "admin" | "staff" | "client";
};

type UpdateUserInput = {
  full_name?: string;
  email?: string;
  phone?: string;
  role?: "admin" | "staff" | "client";
  is_active?: boolean;
  is_verified?: boolean;
};

// ─── PROPS ─────────────────────────────────────────────────

interface UserFormProps {
  user?: User | null;
  onSubmit: (data: CreateUserInput | UpdateUserInput) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  serverError?: string | null;
}

// ─── FORMULARIO CREACIÓN ───────────────────────────────────

function CreateUserFormContent({
  onSubmit,
  onCancel,
  isSubmitting = false,
  serverError,
}: Omit<UserFormProps, "user">) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      full_name: "",
      cedula: "",
      email: "",
      phone: "",
      password: "",
      confirm_password: "",
      role: "client",
    },
  });

  const onFormSubmit = (data: CreateUserInput) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="border-b border-[#E8DDD0]/30 pb-4">
        <h3 className="text-lg font-black text-[#4A3728] tracking-tight">Nuevo Usuario</h3>
        <p className="mt-1 text-xs text-neutral-400 font-medium">
          Completa los datos para crear un nuevo usuario
        </p>
      </div>

      {serverError && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3.5 flex items-start gap-2.5">
          <svg className="h-4.5 w-4.5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-xs font-bold text-red-800">{serverError}</p>
        </div>
      )}

      <div className="space-y-4">
        <UserFormFields
          register={register}
          errors={errors}
          isSubmitting={isSubmitting}
          showPassword
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-5 border-t border-[#E8DDD0]/30">
        {onCancel && (
          <button 
            type="button" 
            onClick={onCancel} 
            disabled={isSubmitting}
            className="rounded-xl border border-[#E8DDD0] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#4A3728] bg-white/60 hover:bg-[#E8DDD0]/20 disabled:opacity-40 disabled:hover:bg-white/60 transition-all duration-200 shadow-sm"
          >
            Cancelar
          </button>
        )}
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="rounded-xl bg-gradient-to-r from-[#3D5A1E] to-[#5C8A3C] hover:from-[#2D4A0E] hover:to-[#3D5A1E] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-[0_2px_8px_rgba(61,90,30,0.15)] hover:shadow-[0_4px_16px_rgba(61,90,30,0.25)]"
        >
          {isSubmitting ? "Creando..." : "Crear Usuario"}
        </button>
      </div>
    </form>
  );
}

// ─── FORMULARIO EDICIÓN ────────────────────────────────────

function EditUserFormContent({
  user,
  onSubmit,
  onCancel,
  isSubmitting = false,
  serverError,
}: UserFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      role: undefined,
      is_active: undefined,
      is_verified: undefined,
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        full_name: user.full_name,
        email: user.email,
        phone: user.phone ?? "",
        role: user.role,
        is_active: user.is_active,
        is_verified: user.is_verified,
      });
    }
  }, [user, reset]);

  const onFormSubmit = (data: UpdateUserInput) => {
    const cleanedData = Object.fromEntries(
      Object.entries(data).filter(
        ([, value]) => value !== "" && value !== undefined
      )
    );
    onSubmit(cleanedData as UpdateUserInput);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="border-b border-[#E8DDD0]/30 pb-4">
        <h3 className="text-lg font-black text-[#4A3728] tracking-tight">Editar Usuario</h3>
        <p className="mt-1 text-xs text-neutral-400 font-medium">
          Modifica los campos que deseas actualizar
        </p>
      </div>

      {serverError && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3.5 flex items-start gap-2.5">
          <svg className="h-4.5 w-4.5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-xs font-bold text-red-800">{serverError}</p>
        </div>
      )}

      <div className="space-y-4">
        <UserFormFields
          register={register}
          errors={errors}
          isSubmitting={isSubmitting}
          showPassword={false}
          showAdminFields
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-5 border-t border-[#E8DDD0]/30">
        {onCancel && (
          <button 
            type="button" 
            onClick={onCancel} 
            disabled={isSubmitting}
            className="rounded-xl border border-[#E8DDD0] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#4A3728] bg-white/60 hover:bg-[#E8DDD0]/20 disabled:opacity-40 disabled:hover:bg-white/60 transition-all duration-200 shadow-sm"
          >
            Cancelar
          </button>
        )}
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="rounded-xl bg-gradient-to-r from-[#3D5A1E] to-[#5C8A3C] hover:from-[#2D4A0E] hover:to-[#3D5A1E] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shadow-[0_2px_8px_rgba(61,90,30,0.15)] hover:shadow-[0_4px_16px_rgba(61,90,30,0.25)]"
        >
          {isSubmitting ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </form>
  );
}

// ─── CAMPOS DEL FORMULARIO ─────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function UserFormFields({ register, errors, isSubmitting, showPassword, showAdminFields }: any) {
  const inputBaseClass = "block w-full rounded-xl border bg-[#E8DDD0]/10 px-3.5 py-2.5 text-sm text-[#4A3728] placeholder-neutral-400/80 hover:bg-[#E8DDD0]/15 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D5A1E]/15 disabled:opacity-40 disabled:bg-[#E8DDD0]/5 transition-all duration-200 shadow-sm";

  return (
    <>
      {/* Nombre completo */}
      <div className="space-y-1.5">
        <label htmlFor="full_name" className="block text-xs font-bold text-[#4A3728]/70 uppercase tracking-widest leading-none">
          Nombre completo
        </label>
        <input 
          id="full_name" 
          type="text" 
          disabled={isSubmitting}
          className={`${inputBaseClass} ${errors.full_name ? "border-red-400/80 focus:border-red-500 focus:ring-red-500/10" : "border-[#E8DDD0]/80 focus:border-[#3D5A1E]/60 focus:ring-[#3D5A1E]/20"}`}
          placeholder="Nombre completo"
          {...register("full_name")} 
        />
        {errors.full_name && (
          <p className="text-xs font-bold text-red-600 mt-1 flex items-center gap-1">
            <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {errors.full_name.message}
          </p>
        )}
      </div>

      {/* Cédula */}
      <div className="space-y-1.5">
        <label htmlFor="cedula" className="block text-xs font-bold text-[#4A3728]/70 uppercase tracking-widest leading-none">
          Cédula
        </label>
        <input 
          id="cedula" 
          type="text" 
          disabled={isSubmitting || !showPassword}
          className={`${inputBaseClass} ${errors.cedula ? "border-red-400/80 focus:border-red-500 focus:ring-red-500/10" : "border-[#E8DDD0]/80 focus:border-[#3D5A1E]/60 focus:ring-[#3D5A1E]/20"}`}
          placeholder="8-888-8888"
          {...register("cedula")} 
        />
        {errors.cedula && (
          <p className="text-xs font-bold text-red-600 mt-1 flex items-center gap-1">
            <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {errors.cedula.message}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-xs font-bold text-[#4A3728]/70 uppercase tracking-widest leading-none">
          Correo electrónico
        </label>
        <input 
          id="email" 
          type="email" 
          disabled={isSubmitting}
          className={`${inputBaseClass} ${errors.email ? "border-red-400/80 focus:border-red-500 focus:ring-red-500/10" : "border-[#E8DDD0]/80 focus:border-[#3D5A1E]/60 focus:ring-[#3D5A1E]/20"}`}
          placeholder="correo@ejemplo.com"
          {...register("email")} 
        />
        {errors.email && (
          <p className="text-xs font-bold text-red-600 mt-1 flex items-center gap-1">
            <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Teléfono */}
      <div className="space-y-1.5">
        <label htmlFor="phone" className="block text-xs font-bold text-[#4A3728]/70 uppercase tracking-widest leading-none">
          Teléfono <span className="text-neutral-400/80 font-normal lowercase tracking-normal font-sans ml-1">(opcional)</span>
        </label>
        <input 
          id="phone" 
          type="tel" 
          disabled={isSubmitting}
          className={`${inputBaseClass} ${errors.phone ? "border-red-400/80 focus:border-red-500 focus:ring-red-500/10" : "border-[#E8DDD0]/80 focus:border-[#3D5A1E]/60 focus:ring-[#3D5A1E]/20"}`}
          placeholder="6666-6666"
          {...register("phone")} 
        />
        {errors.phone && (
          <p className="text-xs font-bold text-red-600 mt-1 flex items-center gap-1">
            <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {errors.phone.message}
          </p>
        )}
      </div>

      {/* Contraseña (solo creación) */}
      {showPassword && (
        <>
          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-xs font-bold text-[#4A3728]/70 uppercase tracking-widest leading-none">
              Contraseña
            </label>
            <input 
              id="password" 
              type="password" 
              disabled={isSubmitting}
              className={`${inputBaseClass} ${errors.password ? "border-red-400/80 focus:border-red-500 focus:ring-red-500/10" : "border-[#E8DDD0]/80 focus:border-[#3D5A1E]/60 focus:ring-[#3D5A1E]/20"}`}
              placeholder="Mínimo 8 caracteres"
              {...register("password")} 
            />
            {errors.password && (
              <p className="text-xs font-bold text-red-600 mt-1 flex items-center gap-1">
                <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirm_password" className="block text-xs font-bold text-[#4A3728]/70 uppercase tracking-widest leading-none">
              Confirmar contraseña
            </label>
            <input 
              id="confirm_password" 
              type="password" 
              disabled={isSubmitting}
              className={`${inputBaseClass} ${errors.confirm_password ? "border-red-400/80 focus:border-red-500 focus:ring-red-500/10" : "border-[#E8DDD0]/80 focus:border-[#3D5A1E]/60 focus:ring-[#3D5A1E]/20"}`}
              placeholder="Repite la contraseña"
              {...register("confirm_password")} 
            />
            {errors.confirm_password && (
              <p className="text-xs font-bold text-red-600 mt-1 flex items-center gap-1">
                <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {errors.confirm_password.message}
              </p>
            )}
          </div>
        </>
      )}

      {/* Rol */}
      <div className="space-y-1.5">
        <label htmlFor="role" className="block text-xs font-bold text-[#4A3728]/70 uppercase tracking-widest leading-none">
          Rol
        </label>
        <select 
          id="role" 
          disabled={isSubmitting}
          className="block w-full rounded-xl border bg-[#E8DDD0]/10 px-3.5 py-2.5 text-sm text-[#4A3728] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3D5A1E]/15 disabled:opacity-40 border-[#E8DDD0]/80 focus:border-[#3D5A1E]/60 focus:ring-[#3D5A1E]/20 transition-all duration-200 shadow-sm"
          {...register("role")}
        >
          {!showPassword && <option value="">Sin cambios</option>}
          <option value="client">Client</option>
          <option value="staff">Staff</option>
          <option value="admin">Admin</option>
        </select>
        {errors.role && (
          <p className="text-xs font-bold text-red-600 mt-1 flex items-center gap-1">
            <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {errors.role.message}
          </p>
        )}
      </div>

      {/* Campos admin */}
      {showAdminFields && (
        <div className="pt-2 space-y-3">
          <div className="flex items-center gap-3 group/check cursor-pointer">
            <input 
              id="is_active" 
              type="checkbox" 
              disabled={isSubmitting}
              className="h-4.5 w-4.5 rounded-lg border-[#E8DDD0] text-[#3D5A1E] focus:ring-[#3D5A1E]/30 focus:ring-offset-0 transition-colors duration-150 cursor-pointer accent-[#3D5A1E]"
              {...register("is_active")} 
            />
            <label htmlFor="is_active" className="text-sm font-bold text-[#4A3728]/70 select-none cursor-pointer group-hover/check:text-[#4A3728]">
              Usuario activo
            </label>
          </div>

          <div className="flex items-center gap-3 group/check cursor-pointer">
            <input 
              id="is_verified" 
              type="checkbox" 
              disabled={isSubmitting}
              className="h-4.5 w-4.5 rounded-lg border-[#E8DDD0] text-[#3D5A1E] focus:ring-[#3D5A1E]/30 focus:ring-offset-0 transition-colors duration-150 cursor-pointer accent-[#3D5A1E]"
              {...register("is_verified")} 
            />
            <label htmlFor="is_verified" className="text-sm font-bold text-[#4A3728]/70 select-none cursor-pointer group-hover/check:text-[#4A3728]">
              Usuario verificado
            </label>
          </div>
        </div>
      )}
    </>
  );
}

// ─── COMPONENTE PRINCIPAL ──────────────────────────────────

export function UserForm(props: UserFormProps) {
  if (props.user) {
    return <EditUserFormContent {...props} user={props.user} />;
  }

  return <CreateUserFormContent {...props} />;
}

export default UserForm;