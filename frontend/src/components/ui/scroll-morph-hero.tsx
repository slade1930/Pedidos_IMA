"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, useTransform, useSpring, useMotionValue } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Leaf } from "lucide-react";
import { AnimatedText } from "@/components/ui/animated-shiny-text";

// ─── TYPES ──────────────────────────────────────────────────────────────────

export type AnimationPhase = "scatter" | "line" | "circle" | "bottom-strip";

interface FlipCardProps {
  src: string;
  index: number;
  total: number;
  phase: AnimationPhase;
  target: { x: number; y: number; rotation: number; scale: number; opacity: number };
}

// ─── CONSTANTS ──────────────────────────────────────────────────────────────

const IMG_WIDTH = 62;
const IMG_HEIGHT = 88;
const TOTAL_IMAGES = 18;
const MAX_SCROLL = 3000;

// Imágenes agrícolas panameñas (URLs confiables de Unsplash)
const IMAGES = [
  "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300&q=80", // tomates
  "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&q=80", // ensalada
  "https://images.unsplash.com/photo-1606787364406-a3cdf06c6d0c?w=300&q=80", // mercado
  "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=300&q=80", // sandía
  "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=300&q=80", // manzanas
  "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=300&q=80", // piña
  "https://images.unsplash.com/photo-1518843025211-9558372624c7?w=300&q=80", // zanahorias
  "https://images.unsplash.com/photo-1628532831941-4c94fa94fb44?w=300&q=80", // vegetales
  "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300&q=80", // frutas mix
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&q=80", // cocinando
  "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=300&q=80", // platanos
  "https://images.unsplash.com/photo-1557800636-894a64c1696f?w=300&q=80", // limones
  "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&q=80", // berenjena
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&q=80", // bowl saludable
  "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=300&q=80", // pepinos
  "https://images.unsplash.com/photo-1573167507387-6b4b98cb7c13?w=300&q=80", // papas
  "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300&q=80", // lechugas
  "https://images.unsplash.com/photo-1506459225024-1428097a7e18?w=300&q=80", // cebolla
];

const lerp = (start: number, end: number, t: number) =>
  start * (1 - t) + end * t;

// ─── FLIP CARD ───────────────────────────────────────────────────────────────

function FlipCard({ src, index, target }: FlipCardProps) {
  return (
    <motion.div
      animate={{
        x: target.x,
        y: target.y,
        rotate: target.rotation,
        scale: target.scale,
        opacity: target.opacity,
      }}
      transition={{ type: "spring", stiffness: 38, damping: 14 }}
      style={{
        position: "absolute",
        width: IMG_WIDTH,
        height: IMG_HEIGHT,
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
      className="cursor-pointer group"
    >
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
        transition={{ duration: 0.55, type: "spring", stiffness: 260, damping: 22 }}
        whileHover={{ rotateY: 180 }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 h-full w-full overflow-hidden rounded-xl shadow-xl"
          style={{ backfaceVisibility: "hidden" }}
        >
          <img
            src={src}
            alt={`producto-${index}`}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&q=80";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1E3A1E]/40 to-transparent opacity-60 transition-opacity group-hover:opacity-20" />
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 h-full w-full overflow-hidden rounded-xl shadow-xl flex flex-col items-center justify-center p-3"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: "linear-gradient(135deg, #1E3A1E 0%, #3A5F26 100%)",
            border: "1.5px solid rgba(251,191,36,0.4)",
          }}
        >
          <div className="w-6 h-6 rounded-full bg-[#FBBF24]/20 flex items-center justify-center mb-1">
            <span className="text-[#FBBF24] text-[10px]">✦</span>
          </div>
          <p className="text-[7px] font-black text-[#FBBF24] uppercase tracking-widest">IMA</p>
          <p className="text-[8px] font-medium text-white/80 mt-0.5">Panamá</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── STAT PILL ───────────────────────────────────────────────────────────────

function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center px-4 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
      <span className="text-lg font-black text-[#FBBF24] tabular-nums leading-none">{value}</span>
      <span className="text-[8px] text-white/50 font-bold uppercase tracking-widest mt-1">{label}</span>
    </div>
  );
}

// ─── MAIN HERO ───────────────────────────────────────────────────────────────

export default function ScrollMorphHero() {
  const [introPhase, setIntroPhase] = useState<AnimationPhase>("scatter");
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Container size tracking
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    setContainerSize({
      width: containerRef.current.offsetWidth,
      height: containerRef.current.offsetHeight,
    });
    return () => observer.disconnect();
  }, []);

  // Virtual scroll
  const virtualScroll = useMotionValue(0);
  const scrollRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const next = Math.min(Math.max(scrollRef.current + e.deltaY, 0), MAX_SCROLL);
      scrollRef.current = next;
      virtualScroll.set(next);
    };

    let touchY = 0;
    const handleTouchStart = (e: TouchEvent) => { touchY = e.touches[0].clientY; };
    const handleTouchMove = (e: TouchEvent) => {
      const delta = touchY - e.touches[0].clientY;
      touchY = e.touches[0].clientY;
      const next = Math.min(Math.max(scrollRef.current + delta, 0), MAX_SCROLL);
      scrollRef.current = next;
      virtualScroll.set(next);
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart, { passive: false });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
    };
  }, [virtualScroll]);

  // Motion transforms
  const morphProgress = useTransform(virtualScroll, [0, 700], [0, 1]);
  const smoothMorph = useSpring(morphProgress, { stiffness: 38, damping: 20 });
  const scrollRotate = useTransform(virtualScroll, [700, 3000], [0, 360]);
  const smoothScrollRotate = useSpring(scrollRotate, { stiffness: 38, damping: 20 });

  // Mouse parallax
  const mouseX = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 28, damping: 18 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handle = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const normalized = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseX.set(normalized * 80);
    };
    container.addEventListener("mousemove", handle);
    return () => container.removeEventListener("mousemove", handle);
  }, [mouseX]);

  // Intro sequence
  useEffect(() => {
    const t1 = setTimeout(() => setIntroPhase("line"), 400);
    const t2 = setTimeout(() => setIntroPhase("circle"), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Scatter positions (stable)
  const scatterPositions = useMemo(
    () =>
      IMAGES.slice(0, TOTAL_IMAGES).map(() => ({
        x: (Math.random() - 0.5) * 1600,
        y: (Math.random() - 0.5) * 1000,
        rotation: (Math.random() - 0.5) * 200,
        scale: 0.5,
        opacity: 0,
      })),
    []
  );

  // Reactive values for render loop
  const [morphValue, setMorphValue] = useState(0);
  const [rotateValue, setRotateValue] = useState(0);
  const [parallaxValue, setParallaxValue] = useState(0);

  useEffect(() => {
    const u1 = smoothMorph.on("change", setMorphValue);
    const u2 = smoothScrollRotate.on("change", setRotateValue);
    const u3 = smoothMouseX.on("change", setParallaxValue);
    return () => { u1(); u2(); u3(); };
  }, [smoothMorph, smoothScrollRotate, smoothMouseX]);

  const contentOpacity = useTransform(smoothMorph, [0.75, 1], [0, 1]);
  const contentY = useTransform(smoothMorph, [0.75, 1], [30, 0]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden flex flex-col items-center justify-center"
      style={{
        background:
          "radial-gradient(ellipse 80% 70% at 50% 110%, rgba(58,95,38,0.22) 0%, transparent 70%), linear-gradient(to bottom, #0D1F0D 0%, #132613 100%)",
      }}
    >
      {/* Subtle grain overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* ── PHASE 1: WELCOME INTRO (Fades out on scroll) ─────────────────── */}
      <motion.div
        className="absolute z-30 pointer-events-auto text-center px-4 max-w-4xl flex flex-col items-center"
        animate={
          introPhase === "circle" && morphValue < 0.5
            ? { opacity: 1 - morphValue * 2.2, y: -morphValue * 60, filter: "blur(0px)" }
            : { opacity: 0, y: -80, filter: "blur(8px)", pointerEvents: "none" }
        }
        initial={{ opacity: 0, filter: "blur(12px)" }}
        transition={{ duration: 0.9 }}
      >
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#FBBF24]/30 bg-[#3A5F26]/30 px-4 py-1.5 mb-6 backdrop-blur-sm">
          <Leaf className="w-3.5 h-3.5 text-[#FBBF24]" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FBBF24]">
            Instituto de Mercadeo Agropecuario · Panamá
          </span>
        </div>

        {/* Main title */}
        <AnimatedText
          text="BIENVENIDO AL IMA"
          textClassName="text-[2.2rem] sm:text-[3.5rem] md:text-[4.5rem] lg:text-[5.5rem] font-black tracking-tight leading-none"
          gradientColors="linear-gradient(90deg, #FFFFFF 0%, #FBBF24 35%, #86efac 60%, #FBBF24 80%, #FFFFFF 100%)"
          gradientAnimationDuration={4.5}
        />

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto mt-6 text-sm sm:text-base text-white/70 font-medium leading-relaxed">
          Encuentra alimentos de primera necesidad directo del productor nacional. 
          Abastecemos arroz de primera, legumbres frescas de tierras altas, vegetales 
          y productos de la canasta básica a precios regulados y accesibles para tu hogar.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <Link
            href="/shop/products"
            className="group inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-bold text-[#1E3A1E] transition-all duration-200 active:scale-95"
            style={{
              background: "#FBBF24",
              boxShadow: "0 4px 20px rgba(251,191,36,0.40)",
            }}
          >
            Ver Productos
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border-2 border-white/20 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-all duration-200 hover:border-white/40 hover:bg-white/5 active:scale-95"
          >
            Iniciar Sesión
          </Link>
        </div>

        {/* Hint text */}
        <p className="text-[10px] font-black tracking-[0.25em] text-[#FBBF24]/60 uppercase mt-12 animate-pulse">
          Desplaza la rueda del mouse para explorar
        </p>
      </motion.div>

      {/* ── PHASE 2: ARC ACTIVE CONTENT (Fades in on scroll) ─────────────── */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="absolute top-[8%] left-0 right-0 z-30 flex flex-col items-center text-center px-4 pointer-events-none"
      >
        <span className="inline-flex rounded-full border border-[#FBBF24]/30 bg-[#3A5F26]/40 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#FBBF24] mb-3">
          Cosechas de Nuestra Tierra
        </span>
        <h3 className="text-xl md:text-3xl font-black text-white tracking-tight">
          Productos Frescos del Campo Panameño
        </h3>
        <p className="text-xs text-white/50 mt-1 font-medium">
          Pasa el cursor sobre las tarjetas para ver detalles
        </p>

        {/* Quick access buttons under the arc */}
        <div className="flex items-center gap-3 mt-5 pointer-events-auto">
          <Link
            href="/shop/products"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#3A5F26] border border-[#FBBF24]/30 px-4 py-2 text-xs font-bold text-white hover:bg-[#2d5720] transition-colors"
          >
            Ver Productos
            <ArrowRight className="w-3 h-3" />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/10 transition-colors"
          >
            Iniciar Sesión
          </Link>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 mt-8">
          <StatPill value="9+" label="Provincias" />
          <StatPill value="50+" label="Ferias" />
          <StatPill value="200K+" label="Familias" />
        </div>
      </motion.div>

      {/* Cards canvas */}
      <div className="relative flex items-center justify-center w-full h-full">
        {IMAGES.slice(0, TOTAL_IMAGES).map((src, i) => {
          let target = { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 };

          if (introPhase === "scatter") {
            target = scatterPositions[i];
          } else if (introPhase === "line") {
            const spacing = 68;
            const totalW = TOTAL_IMAGES * spacing;
            target = {
              x: i * spacing - totalW / 2,
              y: 0,
              rotation: 0,
              scale: 0.95,
              opacity: 1,
            };
          } else {
            const isMobile = containerSize.width < 768;
            const minDim = Math.min(containerSize.width, containerSize.height);
            const circleRadius = Math.min(minDim * 0.33, 320);

            const circleAngle = (i / TOTAL_IMAGES) * 360;
            const circleRad = (circleAngle * Math.PI) / 180;
            const circlePos = {
              x: Math.cos(circleRad) * circleRadius,
              y: Math.sin(circleRad) * circleRadius,
              rotation: circleAngle + 90,
            };

            const baseRadius = Math.min(containerSize.width, containerSize.height * 1.5);
            const arcRadius = baseRadius * (isMobile ? 1.35 : 1.08);
            const arcApexY = containerSize.height * (isMobile ? 0.38 : 0.28);
            const arcCenterY = arcApexY + arcRadius;
            const spreadAngle = isMobile ? 95 : 125;
            const startAngle = -90 - spreadAngle / 2;
            const step = spreadAngle / (TOTAL_IMAGES - 1);

            const scrollProgress = Math.min(Math.max(rotateValue / 360, 0), 1);
            const boundedRotation = -scrollProgress * spreadAngle * 0.78;
            const currentArcAngle = startAngle + i * step + boundedRotation;
            const arcRad = (currentArcAngle * Math.PI) / 180;

            const arcPos = {
              x: Math.cos(arcRad) * arcRadius + parallaxValue * 0.6,
              y: Math.sin(arcRad) * arcRadius + arcCenterY,
              rotation: currentArcAngle + 90,
              scale: isMobile ? 1.35 : 1.75,
            };

            target = {
              x: lerp(circlePos.x, arcPos.x, morphValue),
              y: lerp(circlePos.y, arcPos.y, morphValue),
              rotation: lerp(circlePos.rotation, arcPos.rotation, morphValue),
              scale: lerp(1, arcPos.scale, morphValue),
              opacity: 1,
            };
          }

          return (
            <FlipCard
              key={i}
              src={src}
              index={i}
              total={TOTAL_IMAGES}
              phase={introPhase}
              target={target}
            />
          );
        })}
      </div>
    </div>
  );
}