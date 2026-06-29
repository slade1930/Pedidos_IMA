// src/features/orders/components/QRDisplay.tsx

"use client";

import { useState } from "react";

// ─── PROPS ─────────────────────────────────────────────────

interface QRDisplayProps {
  /** URL o base64 del código QR */
  qrCode: string | null;
  /** Número de orden para el alt text */
  orderNumber: string;
  /** Tamaño del QR */
  size?: "sm" | "md" | "lg";
  /** Mostrar botón de descarga */
  downloadable?: boolean;
}

// ─── TAMAÑOS ───────────────────────────────────────────────

const SIZE_STYLES = {
  sm: "h-24 w-24",
  md: "h-40 w-40",
  lg: "h-56 w-56",
} as const;

// ─── COMPONENTE ────────────────────────────────────────────

/**
 * QRDisplay
 * 
 * Componente para mostrar el código QR de una orden.
 * 
 * Estados:
 * - Sin QR: mensaje informativo
 * - Con QR: imagen centrada
 * - Error de carga: mensaje de error
 * 
 * Funcionalidades:
 * - Descarga del QR como imagen (opcional)
 * - Tres tamaños: sm, md, lg
 * 
 * Uso:
 * ```tsx
 * <QRDisplay qrCode={order.qr_code} orderNumber={order.order_number} />
 * <QRDisplay qrCode={order.qr_code} orderNumber={order.order_number} size="lg" downloadable />
 * ```
 */
export function QRDisplay({
  qrCode,
  orderNumber,
  size = "md",
  downloadable = false,
}: QRDisplayProps) {
  const [loadError, setLoadError] = useState(false);

  // ─── SIN QR ─────────────────────────────────────────
  if (!qrCode) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200">
        <svg
          className="h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z"
          />
        </svg>
        <p className="mt-3 text-sm text-gray-500">Código QR no disponible</p>
        <p className="text-xs text-gray-400 mt-1">
          La orden debe ser creada para generar el QR
        </p>
      </div>
    );
  }

  // ─── ERROR DE CARGA ─────────────────────────────────
  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-red-50 rounded-lg border border-red-200">
        <svg
          className="h-10 w-10 text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
        <p className="mt-3 text-sm text-red-600">Error al cargar el QR</p>
      </div>
    );
  }

  // ─── QR ─────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`${SIZE_STYLES[size]} bg-white p-2 rounded-lg border border-gray-200`}>
        <img
          src={qrCode}
          alt={`Código QR - ${orderNumber}`}
          className="h-full w-full object-contain"
          onError={() => setLoadError(true)}
        />
      </div>

      {downloadable && (
        <a
          href={qrCode}
          download={`QR-${orderNumber}.png`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
            />
          </svg>
          Descargar QR
        </a>
      )}
    </div>
  );
}

export default QRDisplay;