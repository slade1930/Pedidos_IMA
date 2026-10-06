"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend,
} from "recharts";
import type { RevenuePeriod } from "@/features/dashboard/types/dashboard.types";

// ─── UTILITARIOS ───────────────────────────────────────────

export function formatMoney(n: number): string {
  return new Intl.NumberFormat("es-PA", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export function formatMoneyCompact(n: number): string {
  if (n >= 1000) {
    return `$${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return `$${n.toFixed(0)}`;
}

// ─── PERÍODOS DISPONIBLES ──────────────────────────────────

export const PERIODS: { value: RevenuePeriod; label: string }[] = [
  { value: "month", label: "Este mes" },
  { value: "6m", label: "6 meses" },
  { value: "12m", label: "12 meses" },
  { value: "year", label: "Año completo" },
];

// Genera lista de meses disponibles desde la serie
export function getAvailableMonths(series: { period: string; label: string; amount: number; orders_count: number }[]): { value: string; label: string }[] {
  return series
    .filter(s => s.amount > 0 || true)
    .map(s => ({ value: s.period, label: `${s.label} ${s.period.slice(0,4)}` }))
    .reverse();
}

// ─── PROPS ─────────────────────────────────────────────────

interface RevenueChartProps {
  series: { period: string; label: string; amount: number; orders_count: number }[];
  period: RevenuePeriod;
  onPeriodChange: (p: RevenuePeriod) => void;
  selectedMonth?: string;
  onMonthChange?: (month: string) => void;
  loading?: boolean;
}

// ─── SKELETON ──────────────────────────────────────────────

function ChartSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div className="h-4 w-40 bg-[#e4f0ed]/40 rounded animate-pulse" />
        <div className="h-8 w-56 bg-[#e4f0ed]/30 rounded-full animate-pulse" />
      </div>
      <div className="h-64 rounded-2xl bg-[#e4f0ed]/20 animate-pulse" />
    </div>
  );
}

// ─── TOOLTIP PERSONALIZADO ─────────────────────────────────

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload || payload.length === 0) return null;

  const point = payload[0]?.payload;
  return (
    <div className="rounded-xl border border-[#e4f0ed] bg-white/95 backdrop-blur px-3.5 py-2.5 shadow-lg shadow-[#142b45]/10">
      <p className="text-[10px] font-black uppercase tracking-widest text-[#142b45]/50">
        {point?.label} {point?.period?.slice(0, 4)}
      </p>
      <p className="mt-1 text-lg font-black text-[#1b4f72] font-mono tabular-nums">
        {formatMoney(point?.amount ?? 0)}
      </p>
      {point?.orders_count > 0 && (
        <p className="text-[11px] font-medium text-[#142b45]/50">
          {point.orders_count} {point.orders_count === 1 ? "transacción" : "transacciones"}
        </p>
      )}
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ──────────────────────────────────

export function RevenueChart({
  series,
  period,
  onPeriodChange,
  selectedMonth,
  onMonthChange,
  loading = false,
}: RevenueChartProps) {
  const data = useMemo(
    () => (period === "year" ? series.filter((s) => s.period.endsWith("1") || true) : series),
    [series, period]
  );

  if (loading) {
    return (
      <div className="rounded-3xl border border-[#e4f0ed] bg-white p-6 shadow-sm">
        <ChartSkeleton />
      </div>
    );
  }

  const hasData = data.some((d) => d.amount > 0);

  return (
    <div className="rounded-3xl border border-[#e4f0ed] bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#1b4f72]">
            Evolución de ingresos
          </span>
          <h2 className="mt-1 text-lg font-extrabold tracking-tight text-[#142b45]">
            Ingresos por período
          </h2>
        </div>

        {/* Filtros de período + selector de mes */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1 rounded-full border border-[#e4f0ed] bg-[#eef6f4] p-1">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => onPeriodChange(p.value)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  period === p.value
                    ? "bg-[#1b4f72] text-white shadow-sm"
                    : "text-[#142b45]/60 hover:text-[#142b45]"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          
          {/* Selector de mes específico */}
          {onMonthChange && (
            <div className="flex items-center gap-1.5 rounded-full border border-[#e4f0ed] bg-[#eef6f4] px-2 py-1">
              <span className="text-xs font-medium text-[#142b45]/70">Mes:</span>
              <select
                value={selectedMonth || ""}
                onChange={(e) => onMonthChange(e.target.value)}
                className="text-xs font-semibold text-[#142b45] bg-transparent border-none focus:outline-none rounded px-1 py-0.5 appearance-none cursor-pointer"
              >
                <option value="">Todos</option>
                {getAvailableMonths(series).map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Gráfica */}
      {hasData ? (
        <div className="mt-6 h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1b4f72" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#1b4f72" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4f0ed" strokeOpacity={0.6} vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "#8aa39a", fontSize: 11, fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tickFormatter={formatMoneyCompact}
                tick={{ fill: "#8aa39a", fontSize: 11, fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                width={52}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#2fbf9b", strokeWidth: 1.5, strokeDasharray: "4 4" }} />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#1b4f72"
                strokeWidth={2.5}
                fill="url(#revenueGrad)"
                dot={{ r: 3, fill: "#2fbf9b", stroke: "#1b4f72", strokeWidth: 1.5 }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#e4f0ed] bg-[#eef6f4] py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1b4f72]/10 text-[#1b4f72]">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
            </svg>
          </div>
          <p className="mt-4 text-sm font-bold text-[#142b45]">Sin ingresos en este período</p>
          <p className="mt-1 max-w-xs text-xs text-[#142b45]/50">
            Cuando se completen transacciones, verás aquí la evolución de los ingresos.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── GRÁFICA DE DISTRIBUCIÓN (ÓRDENES POR ESTADO) ──────────

const STATUS_COLORS: Record<string, string> = {
  pending: "#2fbf9b",
  confirmed: "#2e7d9e",
  ready: "#1b4f72",
  delivered: "#3B82F6",
  cancelled: "#C94B32",
  expired: "#9CA3AF",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  ready: "Lista",
  delivered: "Entregada",
  cancelled: "Cancelada",
  expired: "Expirada",
};

export function OrdersDistributionChart({ data }: { data: Record<string, number> }) {
  const rows = useMemo(
    () =>
      Object.entries(data)
        .map(([status, count]) => ({
          status,
          name: STATUS_LABELS[status] ?? status,
          count,
          color: STATUS_COLORS[status] ?? "#9CA3AF",
        }))
        .sort((a, b) => b.count - a.count),
    [data]
  );

  const total = rows.reduce((acc, r) => acc + r.count, 0);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1b4f72]/10 text-[#1b4f72]">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
          </svg>
        </div>
        <p className="mt-3 text-sm font-semibold text-[#142b45]/70">Sin órdenes</p>
      </div>
    );
  }

  return (
    <div className="flex h-64 flex-col gap-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: "#142b45", fontSize: 11, fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
            width={85}
          />
          <Tooltip
            cursor={{ fill: "rgba(232,221,208,0.3)" }}
            formatter={(value: any, name: any) => [`${value}`, "Órdenes"]}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #e4f0ed",
              fontSize: 12,
              fontWeight: 600,
            }}
          />
          <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={22}>
            {rows.map((r) => (
              <Cell key={r.status} fill={r.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="text-center text-xs font-bold text-[#142b45]/50">
        {total} {total === 1 ? "orden" : "órdenes"} en total
      </div>
    </div>
  );
}

export default RevenueChart;
