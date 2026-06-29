// src/features/shop/components/CheckoutForm.tsx

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { checkoutSchema, type CheckoutFormValues } from "@/features/shop/schemas/checkout.schema";
import { useCheckout } from "@/features/shop/hooks/useCheckout";
import { useCartStore } from "@/stores/cart.store";
import { PaymentMethodSelector } from "@/features/payments/components/PaymentMethodSelector";
import type { PaymentMethod } from "@/features/payments/types/payment.types";

// ─── UTILITARIOS ───────────────────────────────────────────

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-PA", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(price);
}

// ─── COMPONENTE ────────────────────────────────────────────

export function CheckoutForm() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.getSubtotal());
  const checkout = useCheckout();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      payment_method: "cash",
      notes: "",
    },
  });

  const selectedMethod = watch("payment_method");

  const onSubmit = (data: CheckoutFormValues) => {
    setServerError(null);

    checkout.mutate(data, {
      onSuccess: (order) => {
        router.push(`/shop/orders/${order.id}?new=true`);
      },
      onError: (error: { message: string }) => {
        setServerError(error.message || "Error al crear la orden");
      },
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Finalizar Pedido</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Formulario */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {serverError && (
              <div className="rounded-md bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-700">{serverError}</p>
              </div>
            )}

            {/* Método de pago */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Método de pago</h2>
              <PaymentMethodSelector
                value={selectedMethod}
                onChange={(method: PaymentMethod) => setValue("payment_method", method, { shouldValidate: true })}
                disabled={checkout.isPending}
                error={errors.payment_method?.message}
              />
            </div>

            {/* Notas */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Notas adicionales</h2>
              <textarea
                rows={3}
                disabled={checkout.isPending}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 resize-none"
                placeholder="Ej: Prefiero productos maduros..."
                {...register("notes")}
              />
            </div>

            <button
              type="submit"
              disabled={checkout.isPending}
              className="w-full rounded-md bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 transition-colors"
            >
              {checkout.isPending ? "Procesando..." : "Confirmar Pedido"}
            </button>
          </form>
        </div>

        {/* Resumen */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Resumen del Pedido</h2>

            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.cartItemId} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 truncate flex-1 mr-2">
                    {item.product_name} × {item.quantity}
                  </span>
                  <span className="text-gray-900">{formatPrice(item.unit_price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200">
              <span className="text-base font-semibold text-gray-900">Total</span>
              <span className="text-xl font-bold text-gray-900">{formatPrice(subtotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutForm;