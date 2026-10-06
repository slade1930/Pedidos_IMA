"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useDashboardStats } from "@/features/dashboard/hooks/useDashboardStats";
import { RevenueMetricCard } from "@/features/dashboard/components/RevenueMetricCard";
import {
  RevenueChart,
  OrdersDistributionChart,
  formatMoney,
} from "@/features/dashboard/components/RevenueChart";
import { RecentOrders } from "@/features/dashboard/components/RecentOrders";
import type { RevenuePeriod } from "@/features/dashboard/types/dashboard.types";

// ─── UTILIDADES DE FECHA ───────────────────────────────────

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

function currentMonthLabel() {
  return new Date().toLocaleDateString("es-PA", { month: "long", year: "numeric" });
}

// ─── SKELETON ──────────────────────────────────────────────

function HeroSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#e4f0ed]/80 bg-white p-7 sm:p-9 shadow-sm">
      <div className="h-5 w-32 bg-[#e4f0ed]/40 rounded-full animate-pulse" />
      <div className="mt-4 h-9 w-64 bg-[#e4f0ed]/40 rounded-lg animate-pulse" />
      <div className="mt-8 flex items-baseline gap-2">
        <div className="h-12 w-48 bg-[#1b4f72]/15 rounded-lg animate-pulse" />
        <div className="h-5 w-40 bg-[#e4f0ed]/30 rounded animate-pulse" />
      </div>
      <div className="mt-4 h-4 w-96 max-w-full bg-[#e4f0ed]/30 rounded animate-pulse" />
    </div>
  );
}

// ─── ESTADO DE ERROR ───────────────────────────────────────

function DashboardErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-[#e4f0ed] bg-[#eef6f4] px-6 py-20 text-center shadow-sm">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#C94B32]/10 text-[#C94B32] border border-[#C94B32]/15">
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      </div>
      <h2 className="mt-5 text-lg font-bold text-[#142b45] tracking-tight">No se pudo cargar el dashboard</h2>
      <p className="mt-2 max-w-sm text-sm font-medium text-[#142b45]/60">{message}</p>
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={onRetry}
        className="mt-6 rounded-full bg-[#1b4f72] px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#2f4717] shadow-sm"
      >
        Reintentar
      </motion.button>
    </div>
  );
}

// ─── TARJETA SECUNDARIA (conteo) ───────────────────────────

function CountCard({
  label,
  value,
  sublabel,
  icon,
}: {
  label: string;
  value: number;
  sublabel: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e4f0ed]/70 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-neutral-400">
        <span className="text-[#1b4f72]">
          {icon === "orders" && (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
          )}
          {icon === "fairs" && (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
            </svg>
          )}
          {icon === "delivered" && (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          )}
          {icon === "lowstock" && (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          )}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest leading-none">{label}</span>
      </div>
      <p className="mt-2.5 text-2xl font-black tracking-tight text-[#142b45] font-mono tabular-nums">
        {value}
      </p>
      <p className="mt-0.5 text-[11px] font-medium text-neutral-400">{sublabel}</p>
    </div>
  );
}

// ─── PÁGINA ──────────────────────────────────────────────────

export default function DashboardPage() {
  const [period, setPeriod] = useState<RevenuePeriod>("12m");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const { stats, revenueSeries, ordersByStatus, recentOrders, isLoading, isError, error, refetch } =
    useDashboardStats(period);

  // Serie adaptada según el período seleccionado y mes específico
  const displaySeries = useMemo(() => {
    if (!revenueSeries.length) return [];

    // Si hay un mes específico seleccionado, filtrar solo ese mes
    if (selectedMonth) {
      return revenueSeries.filter((s) => s.period === selectedMonth);
    }

    switch (period) {
      case "month":
        return revenueSeries.slice(-3); // últimos 3 meses (contexto del actual)
      case "6m":
        return revenueSeries.slice(-6);
      case "year": {
        // Año calendario completo (Ene-Dic del año actual)
        const currentYear = new Date().getFullYear();
        return revenueSeries.filter((s) => s.period.startsWith(String(currentYear)));
      }
      default:
        return revenueSeries.slice(-12);
    }
  }, [revenueSeries, period, selectedMonth]);

  if (isError && !stats) {
    return (
      <DashboardErrorState
        message={(error as { message?: string })?.message || "Ocurrió un error inesperado"}
        onRetry={() => refetch()}
      />
    );
  }

  const today = new Date();

  // Métricas del mes seleccionado (si hay uno), sino usa el mes actual del backend
  const selectedMonthData = selectedMonth
    ? revenueSeries.find((s) => s.period === selectedMonth)
    : undefined;
  const displayMonthRevenue =
    selectedMonthData?.amount ?? stats?.month_revenue ?? 0;
  const displayMonthCompare =
    selectedMonthData?.orders_count ?? stats?.total_payments ?? 0;
  const monthSubtitle = selectedMonth
    ? selectedMonthData
      ? `${selectedMonthData.label} ${selectedMonth.slice(0, 4)}`
      : selectedMonth
    : currentMonthLabel();

  return (
    <div className="space-y-6 pb-10">
      {/* ─── HERO / RESUMEN EJECUTIVO ─────────────────────── */}
      {isLoading ? (
        <HeroSkeleton />
      ) : (
        <div
          className="relative overflow-hidden rounded-3xl border border-[#e4f0ed]/80 bg-white p-7 sm:p-9 shadow-sm"
          style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)" }}
        >
          {/* Motivo decorativo de fondo */}
          <div
            className="pointer-events-none absolute -right-8 -top-16 h-56 w-56 rounded-full opacity-[0.05]"
            style={{
              background:
                "radial-gradient(circle, #1b4f72 0%, transparent 70%)",
            }}
          />
          <span className="inline-block rounded-full border border-[#1b4f72]/15 bg-[#1b4f72]/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#1b4f72] leading-none">
            Panel administrativo
          </span>
          <h1 className="mt-4 text-3.5xl font-black tracking-tight text-[#142b45] sm:text-4xl">
            {getGreeting()}
          </h1>
          <p className="mt-2 max-w-xl text-sm font-medium text-[#142b45]/60">
            Bienvenido al resumen financiero y operativo del sistema. Estos son los datos reales de
            tu operación.
          </p>

          {/* Total generado */}
          <div className="mt-8 flex flex-wrap items-end gap-x-8 gap-y-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#142b45]/50">
                Dinero total generado
              </p>
              <p className="mt-1.5 text-4xl font-black tracking-tight text-[#1b4f72] font-mono tabular-nums sm:text-5xl">
                {formatMoney(stats?.total_revenue ?? 0)}
              </p>
            </div>
            <div className="flex items-center gap-6 border-l border-[#e4f0ed] pl-8 text-sm">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  Este mes
                </p>
                <p className="mt-1 font-black text-[#142b45] font-mono">
                  {formatMoney(stats?.month_revenue ?? 0)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                  Hoy
                </p>
                <p className="mt-1 font-black text-[#142b45] font-mono">
                  {formatMoney(stats?.day_revenue ?? 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TARJETAS DE MÉTRICAS PRINCIPALES ─────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <RevenueMetricCard
          title="Ingresos totales"
          value={stats?.total_revenue ?? 0}
          icon="dollarChart"
          accent="olive"
          subtitle="acumulado"
        />
        <RevenueMetricCard
          title="Ingresos del mes"
          value={displayMonthRevenue}
          icon="calendar"
          accent="gold"
          subtitle={monthSubtitle}
        />
        <RevenueMetricCard
          title="Ingresos de hoy"
          value={stats?.day_revenue ?? 0}
          comparison={stats?.prev_day_revenue}
          icon="sun"
          accent="brown"
          subtitle={today.toLocaleDateString("es-PA", { day: "numeric", month: "short" })}
        />
        <RevenueMetricCard
          title="Clientes registrados"
          value={stats?.total_clients ?? 0}
          icon="users"
          accent="green"
          subtitle="usuarios"
          currency={false}
        />
      </div>

      {/* ─── GRÁFICA + DISTRIBUCIÓN ───────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart
            series={displaySeries}
            period={period}
            onPeriodChange={setPeriod}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            loading={isLoading}
          />
        </div>
        <div className="rounded-3xl border border-[#e4f0ed] bg-white p-6 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#1b4f72]">
            Estado de pedidos
          </span>
          <h2 className="mt-1 text-lg font-extrabold tracking-tight text-[#142b45]">
            Órdenes por estado
          </h2>
          {isLoading ? (
            <div className="mt-4 h-64 rounded-2xl bg-[#e4f0ed]/20 animate-pulse" />
          ) : (
            <OrdersDistributionChart data={ordersByStatus} />
          )}
        </div>
      </div>

      {/* ─── MÉTRICAS SECUNDARIAS + ALERTA ────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CountCard
          label="Órdenes totales"
          value={stats?.total_orders ?? 0}
          sublabel={`${stats?.total_payments ?? 0} pagos procesados`}
          icon="orders"
        />
        <CountCard
          label="Ferias activas"
          value={stats?.active_fairs ?? 0}
          sublabel={`${stats?.total_fairs ?? 0} ferias en total`}
          icon="fairs"
        />
        <CountCard
          label="Órdenes entregadas"
          value={stats?.completed_orders ?? 0}
          sublabel={`${stats?.pending_orders ?? 0} pendientes/confirmadas`}
          icon="delivered"
        />
        <CountCard
          label="Productos con stock bajo"
          value={stats?.low_stock_products ?? 0}
          sublabel="revisar inventario"
          icon="lowstock"
        />
      </div>

      {/* ─── ÓRDENES RECIENTES ────────────────────────────── */}
      <RecentOrders data={recentOrders} isLoading={isLoading} />
    </div>
  );
}
