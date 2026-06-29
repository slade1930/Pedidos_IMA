// ─── COMPONENTE ────────────────────────────────────────────

export function ShopFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#F9FAF9] border-t-2 border-[#3A5F26]/12 mt-auto py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Grid de contenido */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* Columna 1: Información Institucional */}
          <div className="space-y-4">
            <div className="flex items-center gap-1.5">
              <span className="h-7 w-7 rounded-lg bg-[#1E3A1E] flex items-center justify-center text-white text-xs font-black border border-[#FBBF24] shadow-sm">
                I
              </span>
              <span className="text-sm font-black text-[#1E3A1E] uppercase tracking-wider">
                IMA <span className="text-[#FBBF24]">System</span>
              </span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed font-semibold">
              Portal oficial del Instituto de Mercadeo Agropecuario (IMA) de Panamá. Facilitando el acceso a productos agrícolas frescos a precios justos de manera rápida y sin intermediarios.
            </p>
          </div>

          {/* Columna 2: Enlaces Rápidos */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-[#1E3A1E] uppercase tracking-widest">Navegación</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="/products" 
                  className="text-xs font-bold text-gray-500 hover:text-[#1E3A1E] hover:underline decoration-[#FBBF24] decoration-2 underline-offset-4 transition-all"
                >
                  Productos Habilitados
                </a>
              </li>
              <li>
                <a 
                  href="/login" 
                  className="text-xs font-bold text-gray-500 hover:text-[#1E3A1E] hover:underline decoration-[#FBBF24] decoration-2 underline-offset-4 transition-all"
                >
                  Iniciar Sesión
                </a>
              </li>
              <li>
                <a 
                  href="/register" 
                  className="text-xs font-bold text-gray-500 hover:text-[#1E3A1E] hover:underline decoration-[#FBBF24] decoration-2 underline-offset-4 transition-all"
                >
                  Registrarse
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 3: Información de Soporte */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-[#1E3A1E] uppercase tracking-widest">Contacto y Soporte</h4>
            <p className="text-xs text-gray-500 leading-relaxed font-semibold">
              ¿Tienes consultas sobre tu código de retiro o los stands de entrega? Contacta al equipo de atención ciudadana de las ferias del IMA.
            </p>
            <div className="pt-2">
              <span className="inline-flex rounded-lg bg-[#3A5F26]/10 border border-[#3A5F26]/20 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#1E3A1E]">
                Panamá, Rep. de Panamá
              </span>
            </div>
          </div>

        </div>

        {/* Separación y Derechos Reservados */}
        <div className="mt-10 pt-8 border-t border-[#3A5F26]/10 text-center">
          <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">
            &copy; {currentYear} IMA System. Apoyando al productor nacional. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default ShopFooter;