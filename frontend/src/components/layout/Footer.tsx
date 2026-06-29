import { APP } from "@/constants/app.constants";

// ─── PROPS ─────────────────────────────────────────────────

interface FooterProps {
  /** Variante del footer */
  variant?: "dashboard" | "public";
}

// ─── COMPONENTE ────────────────────────────────────────────

/**
 * Footer
 * 
 * Componente de pie de página reutilizable.
 */
export function Footer({ variant = "dashboard" }: FooterProps) {
  const currentYear = new Date().getFullYear();

  // ─── DASHBOARD ──────────────────────────────────────
  if (variant === "dashboard") {
    return (
      <footer className="border-t border-neutral-200/50 bg-white/60 backdrop-blur-md px-6 py-4">
        <div className="flex items-center justify-between text-[11px] font-medium text-[#4A3728]/50 tracking-wide">
          <p>
            &copy; {currentYear} <span className="font-bold text-[#4A3728]/70">{APP.NAME}</span>. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#5C8A3C]/40 animate-pulse" />
            <span className="font-mono bg-neutral-100/80 border border-neutral-200/40 px-1.5 py-0.5 rounded text-[10px] font-bold">
              v{APP.VERSION}
            </span>
          </div>
        </div>
      </footer>
    );
  }

  // ─── PÚBLICO ────────────────────────────────────────
  return (
    <footer className="border-t border-neutral-200/60 bg-gradient-to-b from-white to-[#FDF8F0]/30 relative overflow-hidden">
      {/* Decorative organic background line */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#3D5A1E]/10 to-transparent opacity-50"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Marca */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#4A3728] uppercase tracking-widest leading-none">
              {APP.NAME}
            </h3>
            <p className="text-xs text-[#4A3728]/60 leading-relaxed max-w-xs font-medium">
              {APP.DESCRIPTION}
            </p>
          </div>

          {/* Enlaces */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#4A3728]/70 uppercase tracking-widest leading-none">
              Enlaces
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/login"
                  className="text-xs font-semibold text-[#4A3728]/60 hover:text-[#3D5A1E] hover:underline underline-offset-4 transition-colors flex items-center gap-1"
                >
                  Iniciar Sesión
                </a>
              </li>
              <li>
                <a
                  href="/register"
                  className="text-xs font-semibold text-[#4A3728]/60 hover:text-[#3D5A1E] hover:underline underline-offset-4 transition-colors flex items-center gap-1"
                >
                  Registrarse
                </a>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#4A3728]/70 uppercase tracking-widest leading-none">
              Soporte
            </h4>
            <p className="text-xs text-[#4A3728]/60 leading-relaxed font-medium max-w-xs">
              ¿Necesitas ayuda? Contacta al equipo de soporte para resolver dudas del sistema o reportar problemas.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-[11px] font-medium text-[#4A3728]/50 tracking-wide">
            &copy; {currentYear} <span className="font-bold text-[#4A3728]/65">{APP.NAME}</span>. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#4A3728]/50">
            <span className="h-1.5 w-1.5 rounded-full bg-[#5C8A3C]/40 animate-pulse" />
            <span className="font-mono bg-neutral-50 border border-neutral-200/50 px-1.5 py-0.5 rounded text-[10px] font-bold">
              v{APP.VERSION}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;