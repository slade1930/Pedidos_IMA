"use client";

import Link from "next/link";
import { motion, useInView, Variants } from "framer-motion";
import { useRef } from "react";
import ScrollMorphHero from "@/components/ui/scroll-morph-hero";
import DisplayCards from "@/components/ui/display-cards";
import {
  Sparkles,
  ShoppingBag,
  Landmark,
  Clock,
  BadgeCheck,
  ShieldCheck,
  HeartHandshake,
  MapPin,
  ArrowRight,
  Wheat,
} from "lucide-react";

// ─── NOTICIAS ──────────────────────────────────────────────────────────────

const NEWS_CARDS = [
  {
    icon: <ShoppingBag className="size-4 text-[#FBBF24]" />,
    title: "Nuevos Productos",
    description: "Arroz de primera y legumbres de tierras altas ya en catálogo",
    date: "Hoy",
    iconClassName: "text-[#FBBF24]",
    titleClassName: "text-white",
    className:
      "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-[#132613]/60 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
  },
  {
    icon: <Landmark className="size-4 text-[#FBBF24]" />,
    title: "Nueva Feria Habilitada",
    description: "Habilita tus pedidos para David y Bugaba en Chiriquí",
    date: "Ayer",
    iconClassName: "text-[#FBBF24]",
    titleClassName: "text-white",
    className:
      "[grid-area:stack] translate-x-12 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-[#132613]/60 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
  },
  {
    icon: <Sparkles className="size-4 text-[#FBBF24]" />,
    title: "Entrega por Código",
    description: "Sistema optimizado de códigos de retiro en puestos de feria",
    date: "Hace 3 días",
    iconClassName: "text-[#FBBF24]",
    titleClassName: "text-white",
    className:
      "[grid-area:stack] translate-x-24 translate-y-20 hover:translate-y-10",
  },
];

// ─── STEPS ──────────────────────────────────────────────────────────────────

const STEPS = [
  {
    step: "01",
    title: "Selecciona tu feria",
    desc: "Elige la feria libre del IMA en la que planeas realizar tus compras en tu provincia.",
    color: "#FBBF24",
  },
  {
    step: "02",
    title: "Agrega productos",
    desc: "Revisa la canasta básica disponible y agrégala a tu orden de compra.",
    color: "#3A5F26",
  },
  {
    step: "03",
    title: "Genera tu pedido",
    desc: "Confirma tu orden y completa el pago de forma segura en la plataforma.",
    color: "#FBBF24",
  },
  {
    step: "04",
    title: "Retira con tu Código",
    desc: "Recibe un código numérico único y retira tu bolsa en el puesto seleccionado.",
    color: "#3A5F26",
  },
];

// ─── BENEFITS ────────────────────────────────────────────────────────────────

const BENEFITS = [
  {
    title: "Pedidos Rápidos",
    desc: "Elige lo que necesitas en segundos y evita las esperas tradicionales de las ferias.",
    icon: Clock,
    accent: "#FBBF24",
  },
  {
    title: "Múltiples Pagos",
    desc: "Realiza tu transacción cómodamente mediante Yappy, tarjeta de crédito o débito.",
    icon: ShieldCheck,
    accent: "#3A5F26",
  },
  {
    title: "Código Seguro",
    desc: "Retira tus bolsas mediante tu clave numérica única, garantizando la entrega correcta.",
    icon: BadgeCheck,
    accent: "#FBBF24",
  },
  {
    title: "Precios Solidarios",
    desc: "Comida de excelente calidad al precio regulado por el IMA, directo del campo.",
    icon: HeartHandshake,
    accent: "#3A5F26",
  },
  {
    title: "Apoyo al Agro",
    desc: "Tus compras benefician directamente a los agricultores nacionales del programa del IMA.",
    icon: Wheat,
    accent: "#FBBF24",
  },
  {
    title: "Fácil Localización",
    desc: "Halla los diferentes puntos de entrega y ferias libres activas en cada provincia.",
    icon: MapPin,
    accent: "#3A5F26",
  },
];

// ─── ANIMATION VARIANTS ─────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const, delay: i * 0.09 },
  }),
};

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};

// ─── SECTION WRAPPER ─────────────────────────────────────────────────────────

function FadeSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      variants={fadeIn}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function ShopLandingPage() {
  return (
    <div className="text-[#1E3A1E] bg-[#F4F6F3]">
      {/* ══ HERO CON SCROLL-MORPH-HERO INTEGRADO (100svh) ═══════════════════ */}
      <section className="relative w-full h-[100svh] min-h-[700px] overflow-hidden">
        <ScrollMorphHero />
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 z-10"
          style={{
            background: "linear-gradient(to bottom, transparent, #F4F6F3)",
          }}
        />
      </section>

      {/* ══ SOBRE EL IMA ══════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
        <FadeSection className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div className="space-y-7">
            <div>
              <span className="text-[10px] font-black tracking-[0.3em] uppercase text-[#3A5F26]">
                Sobre el IMA
              </span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-black text-[#1E3A1E] leading-tight">
                Instituto de<br />Mercadeo Agropecuario
              </h2>
            </div>

            <p className="text-[15px] text-gray-500 leading-relaxed">
              El <strong className="text-[#1E3A1E]">IMA</strong> es la entidad del Estado panameño encargada de ejecutar las políticas de mercadeo agropecuario del gobierno. Su propósito es apoyar a los pequeños y medianos productores locales, facilitando la venta de sus productos mientras provee alimentos de primera necesidad a precios justos para todas las familias panameñas.
            </p>

            <div className="space-y-5">
              {[
                {
                  icon: Wheat,
                  title: "Apoyo Directo al Agricultor",
                  desc: "Conectamos productores de Chiriquí, Herrera, Los Santos y Veraguas con los centros urbanos, eliminando intermediarios abusivos.",
                },
                {
                  icon: HeartHandshake,
                  title: "Solidaridad Alimentaria",
                  desc: "Aseguramos la distribución nacional de arroz de primera calidad, granos básicos, legumbres y cárnicos a precios regulados.",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex gap-4">
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: "rgba(58,95,38,0.1)", border: "1.5px solid rgba(58,95,38,0.2)" }}
                    >
                      <Icon className="w-4.5 h-4.5 text-[#3A5F26]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-[#1E3A1E]">{item.title}</h4>
                      <p className="text-[13px] text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Image collage */}
          <div className="relative h-[480px] lg:h-[520px]">
            {/* Main image */}
            <div
              className="absolute top-0 left-0 right-8 bottom-16 rounded-3xl overflow-hidden shadow-2xl"
              style={{ border: "3px solid rgba(58,95,38,0.18)" }}
            >
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"
                alt="Mercado agrícola panameño"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E3A1E]/70 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5">
                <p className="text-white text-sm font-bold leading-tight">
                  Llevando el campo a tu mesa de forma organizada y equitativa.
                </p>
              </div>
            </div>
            {/* Accent image */}
            <div
              className="absolute bottom-0 right-0 w-44 h-44 rounded-2xl overflow-hidden shadow-xl"
              style={{ border: "3px solid #FBBF24" }}
            >
              <img
                src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=400&q=80"
                alt="Productos frescos IMA"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating badge */}
            <div
              className="absolute top-6 right-6 rounded-2xl px-4 py-3 shadow-xl backdrop-blur-md"
              style={{
                background: "rgba(19,38,19,0.88)",
                border: "1px solid rgba(251,191,36,0.3)",
              }}
            >
              <p className="text-[9px] font-black uppercase tracking-widest text-[#FBBF24]">Certificado</p>
              <p className="text-white text-xs font-bold mt-0.5">Estado Panameño</p>
            </div>
          </div>
        </FadeSection>
      </section>

      {/* ══ CÓMO FUNCIONA ════════════════════════════════════════════════════ */}
      <section
        className="py-28 px-4"
        style={{
          background:
            "linear-gradient(to bottom, #F4F6F3, #EBF0E8)",
        }}
      >
        <div className="max-w-6xl mx-auto">
          <FadeSection className="text-center mb-20">
            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-[#3A5F26]">
              Proceso de compra
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black text-[#1E3A1E]">
              ¿Cómo funciona el sistema?
            </h2>
            <p className="mt-3 text-sm text-gray-500 font-medium max-w-lg mx-auto">
              Planifica tus compras desde casa en cuatro sencillos pasos.
            </p>
          </FadeSection>

          {/* Steps — horizontal timeline */}
          <div className="relative">
            {/* Connector line */}
            <div
              className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px"
              style={{
                background:
                  "linear-gradient(to right, transparent, #FBBF24 20%, #3A5F26 50%, #FBBF24 80%, transparent)",
              }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6">
              {STEPS.map((item, i) => (
                <motion.div
                  key={item.step}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-60px" }}
                  className="flex flex-col items-center text-center space-y-4 group"
                >
                  {/* Circle */}
                  <div
                    className="relative z-10 h-20 w-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white transition-transform duration-300 group-hover:-translate-y-2"
                    style={{
                      background: `linear-gradient(135deg, #1E3A1E 0%, #2d5720 100%)`,
                      border: `2.5px solid ${item.color}`,
                      boxShadow: `0 8px 24px rgba(30,58,30,0.18), 0 0 0 4px ${item.color}1a`,
                    }}
                  >
                    {item.step}
                  </div>
                  <h3 className="text-base font-black text-[#1E3A1E]">{item.title}</h3>
                  <p className="text-[13px] text-gray-500 leading-relaxed px-2">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ NOVEDADES ════════════════════════════════════════════════════════ */}
      <section
        className="py-28 px-4"
        style={{
          background: "linear-gradient(135deg, #0D1F0D 0%, #1A3018 50%, #132613 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-16">
          {/* Text */}
          <FadeSection className="space-y-7">
            <span
              className="inline-flex items-center gap-2 rounded-full border border-[#FBBF24]/25 bg-[#3A5F26]/30 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-[#FBBF24]"
            >
              <Sparkles className="w-3 h-3" />
              Novedades del IMA
            </span>

            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
              Noticias y<br />Cambios Recientes
            </h2>

            <p className="text-[15px] text-white/55 leading-relaxed">
              Nos mantenemos innovando. Recientemente habilitamos un sistema optimizado de códigos de retiro que permite una entrega limpia: no necesitas imprimir códigos de barra ni mostrar pantallas complejas. Solo dicta tu código numérico único y nuestro equipo te entregará tus productos inmediatamente.
            </p>

            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FBBF24]" />
                <span className="text-xs font-bold text-[#FBBF24]">Actualizado hoy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#86efac]" />
                <span className="text-xs font-bold text-[#86efac]">Verificado por IMA</span>
              </div>
            </div>
          </FadeSection>

          {/* Stacked cards */}
          <FadeSection className="relative flex items-center justify-center min-h-[280px]">
            <DisplayCards cards={NEWS_CARDS} />
          </FadeSection>
        </div>
      </section>

      {/* ══ BENEFICIOS ══════════════════════════════════════════════════════ */}
      <section className="py-28 px-4 bg-[#F4F6F3]">
        <div className="max-w-6xl mx-auto">
          <FadeSection className="text-center mb-20">
            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-[#3A5F26]">
              Ventajas
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black text-[#1E3A1E]">
              ¿Por qué usar IMA System?
            </h2>
            <p className="mt-3 text-sm text-gray-500 font-medium max-w-md mx-auto">
              Una manera moderna, ordenada y solidaria de abastecer tu hogar.
            </p>
          </FadeSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {BENEFITS.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-50px" }}
                  whileHover={{ y: -4, transition: { duration: 0.25 } }}
                  className="group relative rounded-2xl p-6 bg-white overflow-hidden cursor-default"
                  style={{
                    border: "1.5px solid rgba(58,95,38,0.10)",
                    boxShadow: "0 2px 12px rgba(30,58,30,0.04)",
                  }}
                >
                  {/* Accent corner */}
                  <div
                    className="absolute top-0 right-0 w-24 h-24 rounded-bl-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `${item.accent}09` }}
                  />

                  <div
                    className="h-11 w-11 rounded-xl flex items-center justify-center mb-5 transition-colors duration-300"
                    style={{
                      background: `${item.accent}18`,
                      border: `1.5px solid ${item.accent}30`,
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: item.accent === "#FBBF24" ? "#B45309" : "#3A5F26" }} />
                  </div>

                  <h3 className="text-[15px] font-black text-[#1E3A1E] mb-2">{item.title}</h3>
                  <p className="text-[13px] text-gray-500 leading-relaxed">{item.desc}</p>

                  {/* Bottom accent line */}
                  <div
                    className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 rounded-full"
                    style={{ background: item.accent }}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ CTA ══════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-4 bg-[#EBF0E8]">
        <FadeSection className="max-w-5xl mx-auto">
          <div
            className="relative overflow-hidden rounded-3xl p-12 md:p-16 text-center"
            style={{
              background: "linear-gradient(135deg, #132613 0%, #1E3A1E 50%, #2d5720 100%)",
              boxShadow: "0 24px 80px rgba(19,38,19,0.25)",
            }}
          >
            {/* Decorative blobs */}
            <div
              className="pointer-events-none absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-20"
              style={{ background: "radial-gradient(circle, #FBBF24, transparent)" }}
            />
            <div
              className="pointer-events-none absolute -bottom-20 -right-20 w-80 h-80 rounded-full opacity-10"
              style={{ background: "radial-gradient(circle, #3A5F26, transparent)" }}
            />
            {/* Bottom border accent */}
            <div
              className="absolute bottom-0 left-0 right-0 h-1 rounded-b-3xl"
              style={{ background: "linear-gradient(to right, transparent, #FBBF24, transparent)" }}
            />

            <div className="relative z-10 space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#FBBF24]/30 bg-[#FBBF24]/10 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-[#FBBF24]">
                <Sparkles className="w-3 h-3" />
                Empieza ahora
              </span>

              <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                ¿Listo para abastecerte del<br className="hidden sm:block" />
                mejor producto nacional?
              </h2>

              <p className="max-w-xl mx-auto text-[15px] text-white/50 leading-relaxed">
                Regístrate hoy, obtén tu código de retiro y recoge tus alimentos favoritos sin perder tiempo en filas.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link
                  href="/dashboard"
                  className="group inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-bold text-[#1E3A1E] transition-all duration-200 active:scale-95"
                  style={{
                    background: "#FBBF24",
                    boxShadow: "0 4px 20px rgba(251,191,36,0.35)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 6px 30px rgba(251,191,36,0.55)";
                    (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 20px rgba(251,191,36,0.35)";
                    (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                  }}
                >
                  Crear Cuenta
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center rounded-xl border-2 border-white/20 px-8 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-all duration-200 hover:border-white/40 hover:bg-white/5 active:scale-95"
                >
                  Iniciar Sesión
                </Link>
              </div>
            </div>
          </div>
        </FadeSection>
      </section>
    </div>
  );
}