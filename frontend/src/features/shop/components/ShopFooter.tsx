// ─── COMPONENTE ────────────────────────────────────────────

export function ShopFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#eef6f4] border-t-2 border-[#1b4f72]/12 mt-auto py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Grid de contenido */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* Columna 1: Información Institucional */}
          <div className="space-y-4">
            <div className="flex items-center gap-1.5">
              <span className="h-7 w-7 rounded-lg bg-[#142b45] flex items-center justify-center text-white text-[11px] font-black border border-[#2fd4a7] shadow-sm">
                IT
              </span>
              <span className="text-sm font-black text-[#142b45] uppercase tracking-wider">
                ITAS
              </span>
            </div>
            <p className="text-[11px] text-[#1b4f72] font-black italic leading-relaxed">
              "Tu pedido a un clic, tu retiro en minutos."
            </p>
            <p className="text-xs text-gray-500 leading-relaxed font-semibold">
              ITAS nace para modernizar el acceso a la canasta básica familiar. Mediante nuestra plataforma digital, los ciudadanos pueden navegar las ferias activas, seleccionar sus productos e insumos de primera necesidad.
            </p>
          </div>

          {/* Columna 2: Enlaces Rápidos */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-[#142b45] uppercase tracking-widest">Navegación</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="/products" 
                  className="text-xs font-bold text-gray-500 hover:text-[#142b45] hover:underline decoration-[#2fd4a7] decoration-2 underline-offset-4 transition-all"
                >
                  Productos Habilitados
                </a>
              </li>
              <li>
                <a 
                  href="/login" 
                  className="text-xs font-bold text-gray-500 hover:text-[#142b45] hover:underline decoration-[#2fd4a7] decoration-2 underline-offset-4 transition-all"
                >
                  Iniciar Sesión
                </a>
              </li>
              <li>
                <a 
                  href="/register" 
                  className="text-xs font-bold text-gray-500 hover:text-[#142b45] hover:underline decoration-[#2fd4a7] decoration-2 underline-offset-4 transition-all"
                >
                  Registrarse
                </a>
              </li>
              <li>
                <a 
                  href="/privacy" 
                  className="text-xs font-bold text-gray-500 hover:text-[#142b45] hover:underline decoration-[#2fd4a7] decoration-2 underline-offset-4 transition-all"
                >
                  Política de Privacidad
                </a>
              </li>
              <li>
                <a 
                  href="/terms" 
                  className="text-xs font-bold text-gray-500 hover:text-[#142b45] hover:underline decoration-[#2fd4a7] decoration-2 underline-offset-4 transition-all"
                >
                  Términos y Condiciones
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 3: Información de Soporte */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-[#142b45] uppercase tracking-widest">Contacto y Soporte</h4>
            <p className="text-xs text-gray-500 leading-relaxed font-semibold">
              ¿Tienes consultas sobre tu código de retiro o los stands de entrega? Contacta al equipo de atención ciudadana de las ferias del ITAS.
            </p>
            <div className="pt-2">
              <span className="inline-flex rounded-lg bg-[#1b4f72]/10 border border-[#1b4f72]/20 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-[#142b45]">
                Panamá, Rep. de Panamá
              </span>
            </div>
          </div>

        </div>

        {/* Separación y Derechos Reservados */}
        <div className="mt-10 pt-8 border-t border-[#1b4f72]/10 text-center">
          <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">
            &copy; {currentYear} ITAS. Apoyando al productor nacional. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default ShopFooter;