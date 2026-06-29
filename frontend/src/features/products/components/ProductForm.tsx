// src/features/products/components/ProductForm.tsx

"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import {
  createProductSchema,
  updateProductSchema,
} from "@/features/products/schemas/product.schema";
import type { Product, CreateProductPayload, UpdateProductPayload } from "@/features/products/types/product.types";
import { useFairs } from "@/features/fairs/hooks/useFairs";

// ─── TIPOS DEL FORMULARIO ──────────────────────────────────

type CreateProductInput = {
  name: string;
  sku: string;
  description?: string;
  price: number;
  unit: "pound" | "kilogram" | "unit" | "dozen" | "bag";
  category: "vegetables" | "fruits" | "grains" | "meats" | "dairy" | "other";
  fair_id: string;
  max_per_user?: number;
};

type UpdateProductInput = {
  name?: string;
  sku?: string;
  description?: string;
  price?: number | null;
  unit?: "pound" | "kilogram" | "unit" | "dozen" | "bag";
  category?: "vegetables" | "fruits" | "grains" | "meats" | "dairy" | "other";
  max_per_user?: number | null;
  is_active?: boolean;
};

// ─── PROPS ─────────────────────────────────────────────────

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (data: CreateProductPayload | UpdateProductPayload) => void;
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
        Imagen del producto
      </label>

      {preview ? (
        <div className="relative group/preview rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/50">
          <div className="relative w-full h-48">
            <Image
              src={preview}
              alt="Vista previa del producto"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
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
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
            isDragging
              ? "border-[#5C8A3C] bg-[#5C8A3C]/5 scale-[1.02]"
              : "border-slate-300 dark:border-slate-700 hover:border-[#5C8A3C]/60 dark:hover:border-[#5C8A3C] hover:bg-slate-50 dark:hover:bg-slate-900/30"
          }`}
        >
          <div className="flex flex-col items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
              isDragging
                ? "bg-[#5C8A3C]/10 text-[#5C8A3C] scale-110"
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

// ─── SELECTOR DE FERIAS ────────────────────────────────────

function FairSelector({ register, errors, isSubmitting }: any) {
  const { data } = useFairs({ limit: 100 });
  const fairs = Array.isArray(data) ? data : data?.data ?? [];

  return (
    <div className="space-y-1.5 relative group">
      <label htmlFor="fair_id" className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550 group-focus-within:text-[#3D5A1E] transition-colors">
        Feria
      </label>
      <div className="relative">
        <select 
          id="fair_id" 
          disabled={isSubmitting}
          className={`block w-full rounded-xl border bg-slate-50/50 dark:bg-slate-900/30 px-4 py-3 pr-10 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-[#3D5A1E]/10 focus:bg-white dark:focus:bg-slate-950 focus:scale-[1.005] disabled:opacity-50 appearance-none text-slate-700 dark:text-slate-350 ${
            errors.fair_id 
              ? "border-rose-350 dark:border-rose-900/50 focus:border-rose-500 focus:ring-rose-500/10" 
              : "border-slate-200 dark:border-slate-800 focus:border-[#3D5A1E]"
          }`}
          {...register("fair_id")}
        >
          <option value="">Selecciona una feria</option>
          {fairs.map((fair: { id: string; name: string; province: string }) => (
            <option key={fair.id} value={fair.id}>
              {fair.name} ({fair.province})
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 dark:text-slate-650">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
          </svg>
        </div>
      </div>
      {errors.fair_id && (
        <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1.5 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          {errors.fair_id.message}
        </p>
      )}
    </div>
  );
}

// ─── CAMPOS COMPARTIDOS ────────────────────────────────────

function ProductFormFields({ 
  register, 
  errors, 
  isSubmitting, 
  showFairId, 
  showActive,
  product,
  onImageSelect,
}: {
  register: any;
  errors: any;
  isSubmitting: boolean;
  showFairId: boolean;
  showActive: boolean;
  product?: Product | null;
  onImageSelect?: (file: File | null) => void;
}) {
  return (
    <>
      {/* 👈 NUEVO: Campo de imagen */}
      <ImageUploadField
        currentImageUrl={product?.image_url || null}
        onImageSelect={onImageSelect || (() => {})}
        isSubmitting={isSubmitting}
      />

      <div className="grid grid-cols-2 gap-4">
        {/* Nombre de Producto */}
        <div className="space-y-1.5 relative group">
          <label htmlFor="name" className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550 group-focus-within:text-[#3D5A1E] transition-colors">
            Nombre del producto
          </label>
          <input 
            id="name" 
            type="text" 
            disabled={isSubmitting}
            className={`block w-full rounded-xl border bg-slate-50/50 dark:bg-slate-900/30 px-4 py-3 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300 ease-out placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-4 focus:ring-[#3D5A1E]/10 focus:bg-white dark:focus:bg-slate-950 focus:scale-[1.005] disabled:opacity-50 ${
              errors.name 
                ? "border-rose-350 dark:border-rose-900/50 focus:border-rose-500 focus:ring-rose-500/10" 
                : "border-slate-200 dark:border-slate-800 focus:border-[#3D5A1E]"
            }`}
            placeholder='Ej: Tomate'
            {...register("name")} 
          />
          {errors.name && (
            <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              {errors.name.message}
            </p>
          )}
        </div>

        {/* SKU */}
        <div className="space-y-1.5 relative group">
          <label htmlFor="sku" className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550 group-focus-within:text-[#3D5A1E] transition-colors">
            SKU
          </label>
          <input 
            id="sku" 
            type="text" 
            disabled={isSubmitting}
            className={`block w-full rounded-xl border bg-slate-50/50 dark:bg-slate-900/30 px-4 py-3 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300 ease-out placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-4 focus:ring-[#3D5A1E]/10 focus:bg-white dark:focus:bg-slate-950 focus:scale-[1.005] disabled:opacity-50 ${
              errors.sku 
                ? "border-rose-350 dark:border-rose-900/50 focus:border-rose-500 focus:ring-rose-500/10" 
                : "border-slate-200 dark:border-slate-800 focus:border-[#3D5A1E]"
            }`}
            placeholder="Ej: TOM-001"
            {...register("sku")} 
          />
          {errors.sku && (
            <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              {errors.sku.message}
            </p>
          )}
        </div>
      </div>

      {/* Descripción */}
      <div className="space-y-1.5 relative group">
        <label htmlFor="description" className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550 group-focus-within:text-[#3D5A1E] transition-colors">
          Descripción <span className="text-slate-400 font-normal lowercase italic">(opcional)</span>
        </label>
        <textarea 
          id="description" 
          rows={3} 
          disabled={isSubmitting}
          className={`block w-full rounded-xl border bg-slate-50/50 dark:bg-slate-900/30 px-4 py-3 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300 ease-out placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-4 focus:ring-[#3D5A1E]/10 focus:bg-white dark:focus:bg-slate-950 focus:scale-[1.005] disabled:opacity-50 resize-none ${
            errors.description 
              ? "border-rose-350 dark:border-rose-900/50 focus:border-rose-500 focus:ring-rose-500/10" 
              : "border-slate-200 dark:border-slate-800 focus:border-[#3D5A1E]"
          }`}
          placeholder="Descripción del producto..."
          {...register("description")} 
        />
        {errors.description && (
          <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1.5 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Precio & Max. por usuario */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5 relative group">
          <label htmlFor="price" className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550 group-focus-within:text-[#3D5A1E] transition-colors">
            Precio
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#4A3728] dark:text-slate-350 font-bold">$</span>
            <input 
              id="price" 
              type="number" 
              step="0.01" 
              min="0.01" 
              disabled={isSubmitting}
              className={`block w-full rounded-xl border pl-8 pr-4 py-3 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300 ease-out placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#3D5A1E]/10 focus:bg-white dark:focus:bg-slate-950 focus:scale-[1.005] disabled:opacity-50 ${
                errors.price 
                  ? "border-rose-350 dark:border-rose-900/50 focus:border-rose-500 focus:ring-rose-500/10" 
                  : "border-slate-200 dark:border-slate-800 focus:border-[#3D5A1E]"
              }`}
              placeholder="5.99"
              {...register("price", { valueAsNumber: true })} 
            />
          </div>
          {errors.price && (
            <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              {errors.price.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5 relative group">
          <label htmlFor="max_per_user" className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550 group-focus-within:text-[#3D5A1E] transition-colors">
            Máx. por usuario
          </label>
          <input 
            id="max_per_user" 
            type="number" 
            min="1" 
            disabled={isSubmitting}
            className={`block w-full rounded-xl border bg-slate-50/50 dark:bg-slate-900/30 px-4 py-3 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300 ease-out placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-4 focus:ring-[#3D5A1E]/10 focus:bg-white dark:focus:bg-slate-950 focus:scale-[1.005] disabled:opacity-50 ${
              errors.max_per_user 
                ? "border-rose-350 dark:border-rose-900/50 focus:border-rose-500 focus:ring-rose-500/10" 
                : "border-slate-200 dark:border-slate-800 focus:border-[#3D5A1E]"
            }`}
            placeholder="1"
            {...register("max_per_user", { valueAsNumber: true })} 
          />
          {errors.max_per_user && (
            <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              {errors.max_per_user.message}
            </p>
          )}
        </div>
      </div>

      {/* Unidad & Categoría */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5 relative group">
          <label htmlFor="unit" className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550 group-focus-within:text-[#3D5A1E] transition-colors">
            Unidad
          </label>
          <div className="relative">
            <select 
              id="unit" 
              disabled={isSubmitting}
              className={`block w-full rounded-xl border bg-slate-50/50 dark:bg-slate-900/30 px-4 py-3 pr-10 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-[#3D5A1E]/10 focus:bg-white dark:focus:bg-slate-950 focus:scale-[1.005] disabled:opacity-50 appearance-none text-slate-700 dark:text-slate-350 ${
                errors.unit 
                  ? "border-rose-350 dark:border-rose-900/50 focus:border-rose-500 focus:ring-rose-500/10" 
                  : "border-slate-200 dark:border-slate-800 focus:border-[#3D5A1E]"
              }`}
              {...register("unit")}
            >
              <option value="unit">Unidad</option>
              <option value="pound">Libra</option>
              <option value="kilogram">Kilogramo</option>
              <option value="dozen">Docena</option>
              <option value="bag">Bolsa</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 dark:text-slate-650">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
          {errors.unit && (
            <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              {errors.unit.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5 relative group">
          <label htmlFor="category" className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-550 group-focus-within:text-[#3D5A1E] transition-colors">
            Categoría
          </label>
          <div className="relative">
            <select 
              id="category" 
              disabled={isSubmitting}
              className={`block w-full rounded-xl border bg-slate-50/50 dark:bg-slate-900/30 px-4 py-3 pr-10 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-[#3D5A1E]/10 focus:bg-white dark:focus:bg-slate-950 focus:scale-[1.005] disabled:opacity-50 appearance-none text-slate-700 dark:text-slate-350 ${
                errors.category 
                  ? "border-rose-350 dark:border-rose-900/50 focus:border-rose-500 focus:ring-rose-500/10" 
                  : "border-slate-200 dark:border-slate-800 focus:border-[#3D5A1E]"
              }`}
              {...register("category")}
            >
              <option value="vegetables">Vegetales</option>
              <option value="fruits">Frutas</option>
              <option value="grains">Granos</option>
              <option value="meats">Carnes</option>
              <option value="dairy">Lácteos</option>
              <option value="other">Otro</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 dark:text-slate-650">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
          {errors.category && (
            <p className="text-xs text-rose-500 mt-1.5 font-medium flex items-center gap-1.5 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              {errors.category.message}
            </p>
          )}
        </div>
      </div>

      {showFairId && <FairSelector register={register} errors={errors} isSubmitting={isSubmitting} />}

      {/* Activo / Inactivo */}
      {showActive && (
        <div className="flex items-center gap-3 group/cb cursor-pointer pt-1">
          <div className="relative flex items-center">
            <input 
              id="is_active" 
              type="checkbox" 
              disabled={isSubmitting}
              className="peer sr-only"
              {...register("is_active")} 
            />
            <div className="h-5 w-5 rounded-lg border border-slate-350 dark:border-slate-700 bg-white dark:bg-slate-950 peer-checked:bg-[#3D5A1E] dark:peer-checked:bg-[#5C8A3C] peer-checked:border-[#3D5A1E] dark:peer-checked:border-[#5C8A3C] transition-all duration-300 flex items-center justify-center shadow-sm peer-focus-visible:ring-4 peer-focus-visible:ring-[#3D5A1E]/10">
              <svg className="w-3.5 h-3.5 text-white scale-0 peer-checked:scale-100 transition-transform duration-300 ease-out" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <label htmlFor="is_active" className="text-sm font-semibold text-slate-700 dark:text-slate-350 group-hover/cb:text-[#3D5A1E] dark:group-hover/cb:text-[#5C8A3C] cursor-pointer transition-colors selection:bg-transparent">
            Producto activo
          </label>
        </div>
      )}
    </>
  );
}

// ─── FORMULARIO CREACIÓN ───────────────────────────────────

function CreateProductFormContent({
  onSubmit,
  onCancel,
  isSubmitting = false,
  serverError,
}: Omit<ProductFormProps, "product">) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: "",
      sku: "",
      description: "",
      price: 0,
      unit: "unit",
      category: "other",
      fair_id: "",
      max_per_user: 1,
    },
  });

  const onFormSubmit = (data: CreateProductInput) => {
    onSubmit({ ...data, image: selectedImage } as CreateProductPayload);
  };

  return (
    <form 
      onSubmit={handleSubmit(onFormSubmit)} 
      className="space-y-6 bg-white/80 dark:bg-slate-950/70 p-6 md:p-8 rounded-3xl border border-slate-100 dark:border-slate-900/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl relative overflow-hidden transition-all duration-300 hover:shadow-[0_20px_60px_rgba(92,138,60,0.06)] dark:hover:shadow-[0_20px_60px_rgba(92,138,60,0.12)]"
    >
      <div className="absolute top-0 right-0 -z-10 h-[200px] w-[200px] rounded-full bg-gradient-to-br from-[#5C8A3C]/5 to-violet-500/0 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -z-10 h-[200px] w-[200px] rounded-full bg-gradient-to-tr from-[#E8DDD0]/20 to-indigo-500/0 blur-3xl pointer-events-none" />

      <div className="relative pb-2">
        <h3 className="text-xl font-bold tracking-tight bg-gradient-to-r from-[#4A3728] via-slate-800 to-indigo-900 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
          Nuevo Producto
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-medium">
          Completa los datos para crear un nuevo producto
        </p>
      </div>

      {serverError && (
        <div className="rounded-2xl bg-rose-550/10 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <svg className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm text-rose-700 dark:text-rose-350 font-medium">{serverError}</p>
        </div>
      )}

      <ProductFormFields 
        register={register} 
        errors={errors} 
        isSubmitting={isSubmitting} 
        showFairId 
        showActive={false}
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
          className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#3D5A1E] to-[#5C8A3C] px-6 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(92,138,60,0.15)] hover:shadow-[0_4px_25px_rgba(92,138,60,0.3)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all duration-300 group"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4}></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creando...
              </>
            ) : "Crear Producto"}
          </span>
          <span className="absolute inset-0 bg-gradient-to-r from-[#5C8A3C] to-[#3D5A1E] opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"></span>
        </button>
      </div>
    </form>
  );
}

// ─── FORMULARIO EDICIÓN ────────────────────────────────────

function EditProductFormContent({
  product,
  onSubmit,
  onCancel,
  isSubmitting = false,
  serverError,
}: ProductFormProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateProductInput>({
    resolver: zodResolver(updateProductSchema),
    defaultValues: {
      name: "",
      sku: "",
      description: "",
      price: null,
      unit: undefined,
      category: undefined,
      max_per_user: null,
      is_active: undefined,
    },
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        sku: product.sku,
        description: product.description ?? "",
        price: product.price,
        unit: product.unit,
        category: product.category,
        max_per_user: product.max_per_user,
        is_active: product.is_active,
      });
    }
  }, [product, reset]);

  const onFormSubmit = (data: UpdateProductInput) => {
    const cleanedData = Object.fromEntries(
      Object.entries(data).filter(
        ([, value]) => value !== "" && value !== undefined && value !== null
      )
    );
    onSubmit({ ...cleanedData, image: selectedImage } as UpdateProductPayload);
  };

  return (
    <form 
      onSubmit={handleSubmit(onFormSubmit)} 
      className="space-y-6 bg-white/80 dark:bg-slate-950/70 p-6 md:p-8 rounded-3xl border border-slate-100 dark:border-slate-900/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl relative overflow-hidden transition-all duration-300 hover:shadow-[0_20px_60px_rgba(92,138,60,0.06)] dark:hover:shadow-[0_20px_60px_rgba(92,138,60,0.12)]"
    >
      <div className="absolute top-0 right-0 -z-10 h-[200px] w-[200px] rounded-full bg-gradient-to-br from-[#5C8A3C]/5 to-violet-500/0 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -z-10 h-[200px] w-[200px] rounded-full bg-gradient-to-tr from-[#E8DDD0]/20 to-indigo-500/0 blur-3xl pointer-events-none" />

      <div className="relative pb-2">
        <h3 className="text-xl font-bold tracking-tight bg-gradient-to-r from-[#4A3728] via-slate-800 to-indigo-900 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
          Editar Producto
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-medium">
          Modifica los campos que deseas actualizar
        </p>
      </div>

      {serverError && (
        <div className="rounded-2xl bg-rose-550/10 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <svg className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm text-rose-700 dark:text-rose-350 font-medium">{serverError}</p>
        </div>
      )}

      <ProductFormFields 
        register={register} 
        errors={errors} 
        isSubmitting={isSubmitting} 
        showFairId={false} 
        showActive
        product={product}
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
          className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#3D5A1E] to-[#5C8A3C] px-6 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(92,138,60,0.15)] hover:shadow-[0_4px_25px_rgba(92,138,60,0.3)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all duration-300 group"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4}></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </>
            ) : "Guardar Cambios"}
          </span>
          <span className="absolute inset-0 bg-gradient-to-r from-[#5C8A3C] to-[#3D5A1E] opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"></span>
        </button>
      </div>
    </form>
  );
}

// ─── COMPONENTE PRINCIPAL ──────────────────────────────────

export function ProductForm(props: ProductFormProps) {
  if (props.product) {
    return <EditProductFormContent {...props} product={props.product} />;
  }

  return <CreateProductFormContent {...props} />;
}

export default ProductForm;