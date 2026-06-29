"use client";

import { motion, type Variants } from "framer-motion";
import { useDashboardStats } from "@/features/dashboard/hooks/useDashboardStats";
import { StatsCard } from "@/features/dashboard/components/StatsCard";
import { RecentOrders } from "@/features/dashboard/components/RecentOrders";
import {
  AnimatedCard,
  CardBody,
  CardDescription,
  CardTitle,
  CardVisual,
  Visual3
} from "@/components/ui/animated-card-chart";
import FeaturedCrmDemoSection from "@/components/ui/featured-crm-demo-section";

// ─── ANIMACIÓN ─────────────────────────────────────────────

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

// ─── MOTIVO DECORATIVO — espiga de trigo ───────────────────

function WheatMotif({ className }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 200 220"
      className={className}
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      animate={{ 
        rotate: [0, 2, 0],
        y: [0, -4, 0]
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <path d="M100 12 L100 208" strokeWidth="1.5" strokeLinecap="round" />
      {Array.from({ length: 10 }).map((_, i) => {
        const y = 28 + i * 18;
        return (
          <g key={i} strokeWidth="1.3" strokeLinecap="round">
            <path d={`M100 ${y} q16 -8 24 -20`} />
            <path d={`M100 ${y + 9} q-16 -8 -24 -20`} />
          </g>
        );
      })}
    </motion.svg>
  );
}

// ─── LÍNEA "HARVEST" ───────────────────────────────────────

function HarvestDivider() {
  return (
    <svg
      viewBox="0 0 800 20"
      preserveAspectRatio="none"
      className="mt-6 h-5 w-full"
      aria-hidden="true"
    >
      <path d="M0 10 H800" stroke="#E8DDD0" strokeWidth="1" fill="none" />
      <motion.path
        d="M0 10 H800"
        stroke="#F2A900"
        strokeWidth="1.5"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] as const, delay: 0.2 }}
      />
      {Array.from({ length: 17 }).map((_, i) => (
        <motion.line
          key={i}
          x1={i * 50 + 10}
          y1="10"
          x2={i * 50 + 4}
          y2="2"
          stroke="#3D5A1E"
          strokeWidth="1.2"
          strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.35 }}
          transition={{ duration: 0.3, delay: 0.3 + i * 0.02 }}
        />
      ))}
    </svg>
  );
}

// ─── BANNER DE STOCK BAJO ───────────────────────────────────

function StockAlertBanner({
  value,
  isLoading,
}: {
  value: number;
  isLoading: boolean;
}) {
  if (isLoading) {
    return <div className="h-[76px] animate-pulse rounded-2xl bg-[#E8DDD0]/50" />;
  }

  return (
    <motion.div 
      whileHover={{ y: -1 }}
      className="flex flex-col gap-4 rounded-2xl border border-[#C94B32]/15 bg-gradient-to-r from-[#C94B32]/[0.04] via-[#C94B32]/[0.01] to-transparent px-5 py-4 sm:flex-row sm:items-center sm:gap-5 shadow-sm"
      style={{ boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.4)" }}
    >
      <div className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#C94B32]/10 text-[#C94B32] border border-[#C94B32]/15 overflow-hidden">
        <span className="absolute inset-0 bg-[#C94B32]/5 animate-pulse" />
        <svg className="h-5 w-5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      </div>
      <div>
        <p className="text-sm font-bold text-[#4A3728]">
          <span className="text-[#C94B32] font-black">{value}</span>{" "}
          {value === 1 ? "producto" : "productos"} con stock crítico
        </p>
        <p className="mt-0.5 text-xs text-[#4A3728]/60 font-medium">
          Revisa el inventario antes de que se agoten en feria.
        </p>
      </div>
    </motion.div>
  );
}

// ─── ESTADO DE ERROR ─────────────────────────────────────────

function DashboardErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-[#E8DDD0] bg-[#FDF8F0] px-6 py-20 text-center shadow-sm">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#C94B32]/10 text-[#C94B32] border border-[#C94B32]/15">
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      </div>
      <h2 className="mt-5 text-lg font-bold text-[#4A3728] tracking-tight">
        No se pudo cargar el dashboard
      </h2>
      <p className="mt-2 max-w-sm text-sm font-medium text-[#4A3728]/60">{message}</p>
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={onRetry}
        className="mt-6 rounded-full bg-[#3D5A1E] px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#2f4717] shadow-sm hover:shadow-md hover:shadow-[#3D5A1E]/10"
      >
        Reintentar
      </motion.button>
    </div>
  );
}

// ─── PÁGINA ──────────────────────────────────────────────────

export default function DashboardPage() {
  const {
    stats,
    recentOrders,
    isLoading,
    isError,
    errors,
    refetch,
  } = useDashboardStats();

  if (isError && !stats) {
    return (
      <DashboardErrorState
        message={errors.length > 0 ? errors[0] : "Ocurrió un error inesperado"}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Hero */}
      <div
        className="relative overflow-hidden rounded-3xl border border-[#E8DDD0]/80 bg-gradient-to-br from-white via-[#FDFBF7] to-[#F2A900]/[0.04] px-7 py-9 sm:px-10 shadow-sm"
        style={{ boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.6)" }}
      >
        <WheatMotif className="pointer-events-none absolute -right-6 -top-10 h-48 w-48 text-[#3D5A1E] opacity-[0.08]" />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] as const }}
          className="relative"
        >
          <span className="inline-block rounded-full border border-[#3D5A1E]/15 bg-[#3D5A1E]/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#3D5A1E] leading-none">
            Panel principal
          </span>
          <h1 className="mt-4 text-3.5xl font-black tracking-tight text-[#4A3728] leading-none sm:text-4xl">
            {getGreeting()}
          </h1>
          <p className="mt-3 max-w-lg text-sm font-medium text-[#4A3728]/60 leading-relaxed">
            Resumen general del sistema: usuarios, ferias, inventario y pedidos en un solo vistazo.
          </p>
        </motion.div>

        <HarvestDivider />
      </div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={itemVariants}>
          <StatsCard
            title="Total Usuarios"
            value={stats?.total_users ?? 0}
            icon="users"
            color="olive"
            isLoading={isLoading}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatsCard
            title="Total Ferias"
            value={stats?.total_fairs ?? 0}
            icon="store"
            color="gold"
            isLoading={isLoading}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatsCard
            title="Total Productos"
            value={stats?.total_products ?? 0}
            icon="package"
            color="green"
            isLoading={isLoading}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatsCard
            title="Total Órdenes"
            value={stats?.total_orders ?? 0}
            icon="shoppingCart"
            color="brown"
            isLoading={isLoading}
          />
        </motion.div>
      </motion.div>

      {/* Stock bajo */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        <StockAlertBanner value={stats?.low_stock_products ?? 0} isLoading={isLoading} />
      </motion.div>

      {/* Analytical Section using AnimatedCard & Visual3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex"
        >
          <AnimatedCard className="w-full flex flex-col justify-between border-gray-150 rounded-3xl premium-shadow bg-white hover:border-[#3D5A1E]/30 transition-all duration-300">
            <CardVisual className="bg-transparent rounded-t-3xl border-b border-gray-100 flex items-center justify-center">
              <Visual3 mainColor="#3A5F26" secondaryColor="#FBBF24" />
            </CardVisual>
            <CardBody className="p-6">
              <span className="text-[9px] font-black tracking-widest text-[#3A5F26] uppercase">Estadísticas Agro</span>
              <CardTitle className="mt-1 text-base text-gray-900 font-extrabold tracking-tight">Rendimiento de Ventas</CardTitle>
              <CardDescription className="mt-1">
                Visualización en tiempo real del crecimiento de ventas agrícolas y retiros en ferias libres del país.
              </CardDescription>
            </CardBody>
          </AnimatedCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="flex"
        >
          <AnimatedCard className="w-full flex flex-col justify-between border-gray-150 rounded-3xl premium-shadow bg-white hover:border-blue-300 transition-all duration-300">
            <CardVisual className="bg-transparent rounded-t-3xl border-b border-gray-100 flex items-center justify-center">
              <Visual3 mainColor="#3b82f6" secondaryColor="#8b5cf6" />
            </CardVisual>
            <CardBody className="p-6">
              <span className="text-[9px] font-black tracking-widest text-blue-600 uppercase">Actividad Digital</span>
              <CardTitle className="mt-1 text-base text-gray-900 font-extrabold tracking-tight">Tráfico de Productores</CardTitle>
              <CardDescription className="mt-1">
                Análisis de registro e incorporación de nuevos agricultores nacionales en nuestra plataforma.
              </CardDescription>
            </CardBody>
          </AnimatedCard>
        </motion.div>
      </div>

      {/* Featured CRM Demo Section */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="pt-4"
      >
        <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-gray-150 p-6 md:p-8 premium-shadow">
          <FeaturedCrmDemoSection />
        </div>
      </motion.div>

      {/* Pedidos recientes */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.45 }}
      >
        <RecentOrders data={{ orders: recentOrders }} isLoading={isLoading} />
      </motion.div>
    </div>
  );
}