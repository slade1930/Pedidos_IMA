// src/features/fairs/components/FairForm.tsx

"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import {
  createFairSchema,
  updateFairSchema,
} from "@/features/fairs/schemas/fair.schema";
import type { Fair } from "@/features/fairs/types/fair.types";

// ─── TIPOS ─────────────────────────────────────────────────

type CreateFairInput = {
  name: string;
  description: string;
  location: string;
  province: string;
  start_date: string;
  end_date: string;
  max_orders?: number;
  status?: "upcoming" | "active" | "paused" | "finished" | "cancelled";
  image?: File | null;
};

type UpdateFairInput = {
  name?: string;
  description?: string;
  location?: string;
  province?: string;
  start_date?: string;
  end_date?: string;
  max_orders?: number | null;
  status?: "upcoming" | "active" | "paused" | "finished" | "cancelled";
  is_active?: boolean;
  image?: File | null;
};

// ─── PROPS ─────────────────────────────────────────────────

interface FairFormProps {
  fair?: Fair | null;
  onSubmit: (data: CreateFairInput | UpdateFairInput) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  serverError?: string | null;
}

// ─── COMPONENTE DE SUBIDA DE IMAGEN ───────────────────────

function ImageUploadField({
  currentImageUrl,
  onImageSelect,
  isSubmitting,
}: {
  currentImageUrl?: string | null;
  onImageSelect: (file: File | null) => void;
  isSubmitting?: boolean;
}) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onImageSelect(file);
    } else {
      setPreview(null);
      onImageSelect(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleFileChange(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemove = () => {
    setPreview(null);
    onImageSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        Imagen de la feria
      </label>

      {preview ? (
        /* Previsualización de imagen */
        <div className="relative group/preview rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/50">
          <div className="relative w-full h-48">
            <Image
              src={preview}
              alt="Vista previa de la feria"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          {/* Overlay con botones al hacer hover */}
          <div className="absolute inset-0 bg-black/0 group-hover/preview:bg-black/30 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover/preview:opacity-100">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting}
              className="px-3 py-1.5 bg-white/90 hover:bg-white text-slate-700 rounded-lg text-xs font-bold shadow-lg backdrop-blur-sm transition-all hover:scale-105"
            >
              Cambiar
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={isSubmitting}
              className="px-3 py-1.5 bg-rose-500/90 hover:bg-rose-500 text-white rounded-lg text-xs font-bold shadow-lg backdrop-blur-sm transition-all hover:scale-105"
            >
              Eliminar
            </button>
          </div>
        </div>
      ) : (
        /* Zona de drop para subir imagen */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
            isDragging
              ? "border-indigo-500 bg-indigo-500/5 scale-[1.02]"
              : "border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-900/30"
          }`}
        >
          <div className="flex flex-col items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
              isDragging
                ? "bg-indigo-500/10 text-indigo-500 scale-110"
                : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
            }`}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                {isDragging ? "¡Suelta la imagen aquí!" : "Arrastra una imagen o haz clic"}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                PNG, JPG o WebP hasta 5MB
              </p>
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        onChange={(e) => {
          const file = e.target.files?.[0];
          handleFileChange(file || null);
        }}
        className="hidden"
        disabled={isSubmitting}
      />
    </div>
  );
}

// ─── CAMPOS COMPARTIDOS ────────────────────────────────────

function FairFormFields({
  register,
  errors,
  isSubmitting,
  isEditing,
  fair,
  onImageSelect,
}: {
  register: any;
  errors: any;
  isSubmitting: boolean;
  isEditing: boolean;
  fair?: Fair | null;
  onImageSelect?: (file: File | null) => void;
}) {
  return (
    <>
      {/* 👈 NUEVO: Campo de imagen */}
      <ImageUploadField
        currentImageUrl={fair?.image_url || null}
        onImageSelect={onImageSelect || (() => {})}
        isSubmitting={isSubmitting}
      />

      {/* Nombre de la feria */}
      <div className="space-y-1.5 relative group">
        <label htmlFor="name" className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors">
          Nombre de la feria
        </label>
        <input 
          id="name" 
          type="text" 
          disabled={isSubmitting}
          className={`block w-full rounded-xl border bg-slate-50/50 dark:bg-slate-900/30 px-4 py-3 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300 ease-out placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white dark:focus:bg-slate-950 focus:scale-[1.005] disabled:opacity-50 ${
            errors.name 
              ? "border-rose-350 dark:border-rose-900/50 focus:border-rose-500 focus:ring-rose-500/10" 
              : "border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500/80"
          }`}
          placeholder="Ej: Feria de las Flores 2026"
          {...register("name")} 
        />
        {errors.name && (
          <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1.5 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Descripción */}
      <div className="space-y-1.5 relative group">
        <label htmlFor="description" className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors">
          Descripción
        </label>
        <textarea 
          id="description" 
          rows={3} 
          disabled={isSubmitting}
          className={`block w-full rounded-xl border bg-slate-50/50 dark:bg-slate-900/30 px-4 py-3 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300 ease-out placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white dark:focus:bg-slate-950 focus:scale-[1.005] disabled:opacity-50 resize-none ${
            errors.description 
              ? "border-rose-350 dark:border-rose-900/50 focus:border-rose-500 focus:ring-rose-500/10" 
              : "border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500/80"
          }`}
          placeholder="Descripción detallada de la feria..."
          {...register("description")} 
        />
        {errors.description && (
          <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1.5 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Ubicación y Provincia */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5 relative group">
          <label htmlFor="location" className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors">
            Ubicación
          </label>
          <input 
            id="location" 
            type="text" 
            disabled={isSubmitting}
            className={`block w-full rounded-xl border bg-slate-50/50 dark:bg-slate-900/30 px-4 py-3 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300 ease-out placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white dark:focus:bg-slate-950 focus:scale-[1.005] disabled:opacity-50 ${
              errors.location 
                ? "border-rose-350 dark:border-rose-900/50 focus:border-rose-500 focus:ring-rose-500/10" 
                : "border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500/80"
            }`}
            placeholder="Ej: Centro de Convenciones"
            {...register("location")} 
          />
          {errors.location && (
            <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              {errors.location.message}
            </p>
          )}
        </div>
        <div className="space-y-1.5 relative group">
          <label htmlFor="province" className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors">
            Provincia
          </label>
          <input 
            id="province" 
            type="text" 
            disabled={isSubmitting}
            className={`block w-full rounded-xl border bg-slate-50/50 dark:bg-slate-900/30 px-4 py-3 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300 ease-out placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white dark:focus:bg-slate-950 focus:scale-[1.005] disabled:opacity-50 ${
              errors.province 
                ? "border-rose-350 dark:border-rose-900/50 focus:border-rose-500 focus:ring-rose-500/10" 
                : "border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500/80"
            }`}
            placeholder="Ej: Coclé"
            {...register("province")} 
          />
          {errors.province && (
            <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              {errors.province.message}
            </p>
          )}
        </div>
      </div>

      {/* Fechas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5 relative group">
          <label htmlFor="start_date" className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors">
            Fecha de inicio
          </label>
          <input 
            id="start_date" 
            type="date" 
            disabled={isSubmitting}
            className={`block w-full rounded-xl border bg-slate-50/50 dark:bg-slate-900/30 px-4 py-3 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white dark:focus:bg-slate-950 focus:scale-[1.005] disabled:opacity-50 text-slate-700 dark:text-slate-300 ${
              errors.start_date 
                ? "border-rose-350 dark:border-rose-900/50 focus:border-rose-500 focus:ring-rose-500/10" 
                : "border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500/80"
            }`}
            {...register("start_date")} 
          />
          {errors.start_date && (
            <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              {errors.start_date.message}
            </p>
          )}
        </div>
        <div className="space-y-1.5 relative group">
          <label htmlFor="end_date" className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors">
            Fecha de finalización
          </label>
          <input 
            id="end_date" 
            type="date" 
            disabled={isSubmitting}
            className={`block w-full rounded-xl border bg-slate-50/50 dark:bg-slate-900/30 px-4 py-3 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white dark:focus:bg-slate-950 focus:scale-[1.005] disabled:opacity-50 text-slate-700 dark:text-slate-300 ${
              errors.end_date 
                ? "border-rose-350 dark:border-rose-900/50 focus:border-rose-500 focus:ring-rose-500/10" 
                : "border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500/80"
            }`}
            {...register("end_date")} 
          />
          {errors.end_date && (
            <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              {errors.end_date.message}
            </p>
          )}
        </div>
      </div>

      {/* Máximo de órdenes */}
      <div className="space-y-1.5 relative group">
        <label htmlFor="max_orders" className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors">
          Máximo de órdenes <span className="text-slate-400 dark:text-slate-600 font-normal lowercase italic">(opcional, default 500)</span>
        </label>
        <input 
          id="max_orders" 
          type="number" 
          min="1" 
          disabled={isSubmitting}
          className={`block w-full rounded-xl border bg-slate-50/50 dark:bg-slate-900/30 px-4 py-3 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300 ease-out placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white dark:focus:bg-slate-950 focus:scale-[1.005] disabled:opacity-50 ${
            errors.max_orders 
              ? "border-rose-350 dark:border-rose-900/50 focus:border-rose-500 focus:ring-rose-500/10" 
              : "border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500/80"
          }`}
          placeholder="500"
          {...register("max_orders", { valueAsNumber: true })} 
        />
        {errors.max_orders && (
          <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1.5 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            {errors.max_orders.message}
          </p>
        )}
      </div>

      {isEditing && (
        <>
          {/* Estado */}
          <div className="space-y-1.5 relative group">
            <label htmlFor="status" className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors">
              Estado
            </label>
            <div className="relative">
              <select 
                id="status" 
                disabled={isSubmitting}
                className={`block w-full rounded-xl border bg-slate-50/50 dark:bg-slate-900/30 px-4 py-3 pr-10 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white dark:focus:bg-slate-950 focus:scale-[1.005] disabled:opacity-50 appearance-none text-slate-700 dark:text-slate-300 ${
                  errors.status 
                    ? "border-rose-350 dark:border-rose-900/50 focus:border-rose-500 focus:ring-rose-500/10" 
                    : "border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-400"
                }`}
                {...register("status")}
              >
                <option value="">Sin cambios</option>
                <option value="upcoming">Próxima</option>
                <option value="active">Activa</option>
                <option value="paused">Pausada</option>
                <option value="finished">Finalizada</option>
                <option value="cancelled">Cancelada</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 dark:text-slate-600">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
            {errors.status && (
              <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1.5 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                {errors.status.message}
              </p>
            )}
          </div>

          {/* Checkbox Feria Activa */}
          <div className="flex items-center gap-3 group/cb cursor-pointer pt-2">
            <div className="relative flex items-center">
              <input 
                id="is_active" 
                type="checkbox" 
                disabled={isSubmitting}
                className="peer sr-only"
                {...register("is_active")} 
              />
              <div className="h-5 w-5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 peer-checked:bg-indigo-650 dark:peer-checked:bg-indigo-500 peer-checked:border-indigo-650 dark:peer-checked:border-indigo-500 transition-all duration-300 flex items-center justify-center shadow-sm peer-focus-visible:ring-4 peer-focus-visible:ring-indigo-500/10">
                <svg className="w-3.5 h-3.5 text-white scale-0 peer-checked:scale-100 transition-transform duration-300 ease-out" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <label htmlFor="is_active" className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover/cb:text-indigo-600 dark:group-hover/cb:text-indigo-400 cursor-pointer transition-colors selection:bg-transparent">
              Feria activa
            </label>
          </div>
        </>
      )}
    </>
  );
}

// ─── FORMULARIO CREACIÓN ───────────────────────────────────

function CreateFairFormContent({
  onSubmit,
  onCancel,
  isSubmitting = false,
  serverError,
}: Omit<FairFormProps, "fair">) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateFairInput>({
    resolver: zodResolver(createFairSchema),
    defaultValues: {
      name: "",
      description: "",
      location: "",
      province: "",
      start_date: "",
      end_date: "",
      max_orders: 500,
      status: "upcoming",
    },
  });

  const onFormSubmit = (data: CreateFairInput) => {
    onSubmit({ ...data, image: selectedImage });
  };

  return (
    <form 
      onSubmit={handleSubmit(onFormSubmit)} 
      className="space-y-6 bg-white/80 dark:bg-slate-950/70 p-6 md:p-8 rounded-3xl border border-slate-100 dark:border-slate-900/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl relative overflow-hidden transition-all duration-300 hover:shadow-[0_20px_60px_rgba(79,70,229,0.06)] dark:hover:shadow-[0_20px_60px_rgba(79,70,229,0.12)]"
    >
      <div className="absolute top-0 right-0 -z-10 h-[200px] w-[200px] rounded-full bg-gradient-to-br from-indigo-500/5 to-violet-500/0 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -z-10 h-[200px] w-[200px] rounded-full bg-gradient-to-tr from-fuchsia-500/5 to-indigo-500/0 blur-3xl pointer-events-none" />

      <div className="relative pb-2">
        <h3 className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
          Nueva Feria
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-medium">
          Completa los datos para crear una nueva feria
        </p>
      </div>

      {serverError && (
        <div className="rounded-2xl bg-rose-550/10 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <svg className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm text-rose-700 dark:text-rose-350 font-medium">{serverError}</p>
        </div>
      )}

      <FairFormFields 
        register={register} 
        errors={errors} 
        isSubmitting={isSubmitting} 
        isEditing={false}
        onImageSelect={setSelectedImage}
      />

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
          className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 px-6 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(99,102,241,0.15)] hover:shadow-[0_4px_25px_rgba(99,102,241,0.3)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all duration-300 group"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creando...
              </>
            ) : "Crear Feria"}
          </span>
          <span className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"></span>
        </button>
      </div>
    </form>
  );
}

// ─── FORMULARIO EDICIÓN ────────────────────────────────────

function EditFairFormContent({
  fair,
  onSubmit,
  onCancel,
  isSubmitting = false,
  serverError,
}: FairFormProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateFairInput>({
    resolver: zodResolver(updateFairSchema),
    defaultValues: {
      name: "",
      description: "",
      location: "",
      province: "",
      start_date: "",
      end_date: "",
      max_orders: null,
      status: undefined,
      is_active: undefined,
    },
  });

  useEffect(() => {
    if (fair) {
      reset({
        name: fair.name,
        description: fair.description,
        location: fair.location,
        province: fair.province,
        start_date: fair.start_date ? new Date(fair.start_date).toISOString().split("T")[0] : "",
        end_date: fair.end_date ? new Date(fair.end_date).toISOString().split("T")[0] : "",
        max_orders: fair.max_orders,
        status: fair.status,
        is_active: fair.is_active,
      });
    }
  }, [fair, reset]);

  const onFormSubmit = (data: UpdateFairInput) => {
    const cleanedData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== "" && value !== undefined && value !== null)
    );
    onSubmit({ ...cleanedData, image: selectedImage } as UpdateFairInput);
  };

  return (
    <form 
      onSubmit={handleSubmit(onFormSubmit)} 
      className="space-y-6 bg-white/80 dark:bg-slate-950/70 p-6 md:p-8 rounded-3xl border border-slate-100 dark:border-slate-900/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl relative overflow-hidden transition-all duration-300 hover:shadow-[0_20px_60px_rgba(79,70,229,0.06)] dark:hover:shadow-[0_20px_60px_rgba(79,70,229,0.12)]"
    >
      <div className="absolute top-0 right-0 -z-10 h-[200px] w-[200px] rounded-full bg-gradient-to-br from-indigo-500/5 to-violet-500/0 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -z-10 h-[200px] w-[200px] rounded-full bg-gradient-to-tr from-fuchsia-500/5 to-indigo-500/0 blur-3xl pointer-events-none" />

      <div className="relative pb-2">
        <h3 className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
          Editar Feria
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-medium">
          Modifica los campos que deseas actualizar
        </p>
      </div>

      {serverError && (
        <div className="rounded-2xl bg-rose-550/10 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <svg className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm text-rose-700 dark:text-rose-355 font-medium">{serverError}</p>
        </div>
      )}

      <FairFormFields 
        register={register} 
        errors={errors} 
        isSubmitting={isSubmitting} 
        isEditing={true}
        fair={fair}
        onImageSelect={setSelectedImage}
      />

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
          className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 px-6 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(99,102,241,0.15)] hover:shadow-[0_4px_25px_rgba(99,102,241,0.3)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all duration-300 group"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </>
            ) : "Guardar Cambios"}
          </span>
          <span className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"></span>
        </button>
      </div>
    </form>
  );
}

// ─── COMPONENTE PRINCIPAL ──────────────────────────────────

export function FairForm(props: FairFormProps) {
  if (props.fair) {
    return <EditFairFormContent {...props} fair={props.fair} />;
  }

  return <CreateFairFormContent {...props} />;
}

export default FairForm;