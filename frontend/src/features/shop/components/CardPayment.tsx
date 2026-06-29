// src/features/shop/components/CardPayment.tsx

"use client";

import { useState } from "react";

// ─── PROPS ─────────────────────────────────────────────────

interface CardPaymentProps {
  amount: number;
  onSuccess: () => void;
  onBack: () => void;
}

// ─── TIPOS ─────────────────────────────────────────────────

type CardType = "visa" | "mastercard" | "";

// ─── UTILITARIOS ───────────────────────────────────────────

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-PA", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(price);
}

function formatCardNumber(value: string): string {
  const cleaned = value.replace(/\D/g, "").slice(0, 16);
  return cleaned.replace(/(\d{4})(?=\d)/g, "$1 ");
}

function detectCardType(number: string): CardType {
  const cleaned = number.replace(/\D/g, "");
  if (cleaned.startsWith("4")) return "visa";
  if (cleaned.startsWith("5")) return "mastercard";
  return "";
}

// ─── COMPONENTE ────────────────────────────────────────────

export function CardPayment({ amount, onSuccess, onBack }: CardPaymentProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const cardType = detectCardType(cardNumber);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (cardNumber.replace(/\D/g, "").length < 13) {
      newErrors.cardNumber = "Número de tarjeta inválido";
    }
    if (!cardName.trim()) {
      newErrors.cardName = "Nombre requerido";
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      newErrors.expiry = "Formato MM/AA requerido";
    }
    if (cvv.length < 3) {
      newErrors.cvv = "CVV inválido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsProcessing(true);

    // Simular procesamiento
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);

      setTimeout(() => {
        onSuccess();
      }, 2000);
    }, 2000);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (value.length >= 2) {
      value = value.slice(0, 2) + "/" + value.slice(2);
    }
    setExpiry(value);
  };

  // ─── PANTALLA DE ÉXITO ──────────────────────────────
  if (isSuccess) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div className="mx-auto h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-4 animate-bounce">
          <svg
            className="h-10 w-10 text-green-600 animate-pulse"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900">¡Pago Aprobado!</h3>
        <p className="mt-2 text-sm text-gray-500">
          Tu pago de {formatPrice(amount)} ha sido procesado correctamente.
        </p>
        <p className="mt-1 text-xs text-gray-400">
          **** **** **** {cardNumber.replace(/\D/g, "").slice(-4)}
        </p>
      </div>
    );
  }

  // ─── PANTALLA DE PAGO ───────────────────────────────
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-lg">
          💳
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Tarjeta</h3>
          <p className="text-xs text-gray-500">Débito o crédito</p>
        </div>
        <button
          onClick={onBack}
          disabled={isProcessing}
          className="ml-auto text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
        >
          ← Volver
        </button>
      </div>

      {/* Monto */}
      <div className="bg-blue-50 rounded-lg p-4 text-center">
        <p className="text-xs text-gray-500 mb-1">Total a pagar</p>
        <p className="text-2xl font-bold text-blue-700">{formatPrice(amount)}</p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tipo de tarjeta */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setCardNumber("4" + cardNumber.replace(/\D/g, "").slice(1))}
            className={`flex-1 rounded-lg border-2 p-3 text-center transition-all ${
              cardType === "visa"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <span className="text-2xl">💳</span>
            <p className="text-xs font-medium mt-1">Visa</p>
          </button>
          <button
            type="button"
            onClick={() => setCardNumber("5" + cardNumber.replace(/\D/g, "").slice(1))}
            className={`flex-1 rounded-lg border-2 p-3 text-center transition-all ${
              cardType === "mastercard"
                ? "border-red-500 bg-red-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <span className="text-2xl">🟠</span>
            <p className="text-xs font-medium mt-1">MasterCard</p>
          </button>
        </div>

        {/* Número de tarjeta */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Número de tarjeta</label>
          <div className="relative">
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="0000 0000 0000 0000"
              maxLength={19}
              disabled={isProcessing}
              className={`block w-full rounded-md border px-3 py-2.5 text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 ${
                errors.cardNumber ? "border-red-500" : "border-gray-300"
              }`}
            />
            {cardType && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-lg">
                {cardType === "visa" ? "💳" : "🟠"}
              </span>
            )}
          </div>
          {errors.cardNumber && <p className="text-xs text-red-600 mt-1">{errors.cardNumber}</p>}
        </div>

        {/* Nombre */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Nombre del titular</label>
          <input
            type="text"
            value={cardName}
            onChange={(e) => setCardName(e.target.value.toUpperCase())}
            placeholder="NOMBRE APELLIDO"
            maxLength={30}
            disabled={isProcessing}
            className={`block w-full rounded-md border px-3 py-2.5 text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 uppercase ${
              errors.cardName ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.cardName && <p className="text-xs text-red-600 mt-1">{errors.cardName}</p>}
        </div>

        {/* Expiración y CVV */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Vencimiento</label>
            <input
              type="text"
              value={expiry}
              onChange={handleExpiryChange}
              placeholder="MM/AA"
              maxLength={5}
              disabled={isProcessing}
              className={`block w-full rounded-md border px-3 py-2.5 text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 ${
                errors.expiry ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.expiry && <p className="text-xs text-red-600 mt-1">{errors.expiry}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">CVV</label>
            <input
              type="text"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="123"
              maxLength={4}
              disabled={isProcessing}
              className={`block w-full rounded-md border px-3 py-2.5 text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 ${
                errors.cvv ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.cvv && <p className="text-xs text-red-600 mt-1">{errors.cvv}</p>}
          </div>
        </div>

        {/* Botón pagar */}
        <button
          type="submit"
          disabled={isProcessing}
          className="w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Procesando pago...
            </>
          ) : (
            <>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              Pagar {formatPrice(amount)}
            </>
          )}
        </button>
      </form>

      <p className="text-center text-xs text-gray-400">
        Pago simulado. No se realizará ningún cargo real.
      </p>
    </div>
  );
}

export default CardPayment;