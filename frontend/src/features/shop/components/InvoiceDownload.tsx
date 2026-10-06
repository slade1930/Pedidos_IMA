// src/features/shop/components/InvoiceDownload.tsx

"use client";

import { orderService } from "@/features/orders/services/order.service";

// ─── PROPS ─────────────────────────────────────────────────

interface InvoiceDownloadProps {
  orderId: string;
  orderNumber: string;
}

// ─── COMPONENTE ────────────────────────────────────────────

export function InvoiceDownload({ orderId, orderNumber }: InvoiceDownloadProps) {
  return (
    <button
      type="button"
      onClick={() =>
        orderService.downloadInvoice(orderId, `factura-${orderNumber}.pdf`)
      }
      className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
      Descargar Factura
    </button>
  );
}

export default InvoiceDownload;