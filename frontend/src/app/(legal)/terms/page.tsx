"use client";

import { motion } from "framer-motion";

export default function TermsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Términos y Condiciones</h1>
        <p className="text-sm text-gray-500 mb-8">Última actualización: 26 de agosto de 2026</p>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Aceptación de los Términos</h2>
            <p className="text-gray-600 leading-relaxed">
              Al acceder y utilizar la plataforma <strong>Pedidos ITAS</strong>, aceptas estos términos y condiciones en su totalidad. 
              Si no estás de acuerdo con alguno de estos términos, no utilices la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Descripción del Servicio</h2>
            <p className="text-gray-600 leading-relaxed">
              Pedidos ITAS es una plataforma web diseñada para la gestión de pedidos en ferias organizadas por el 
              Iniciativa Tecnológica de Abasto Social (ITAS) de Panamá. Permite a los usuarios:
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
              <li>Explorar productos disponibles en ferias agrícolas.</li>
              <li>Realizar pedidos de productos de manera digital.</li>
              <li>Gestionar el seguimiento de sus pedidos.</li>
              <li>Descargar facturas de compra.</li>
            </ul>
            <p className="text-gray-600 mt-2">
              <strong>Nota:</strong> Esta plataforma es parte de un proyecto de investigación académica y puede contener funcionalidades experimentales.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">3. Cuenta de Usuario</h2>
            <p className="text-gray-600 leading-relaxed">
              Para utilizar la plataforma, debes crear una cuenta proporcionando información veraz y actualizada. 
              Eres responsable de:
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
              <li>Mantener la confidencialidad de tus credenciales de acceso.</li>
              <li>Todas las actividades que ocurran bajo tu cuenta.</li>
              <li>Notificar inmediatamente cualquier uso no autorizado de tu cuenta.</li>
            </ul>
            <p className="text-gray-600 mt-2">
              Nos reservamos el derecho de suspender o eliminar cuentas que violen estos términos o que sean detectadas como fraudulentas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Pedidos y Pagos</h2>
            <p className="text-gray-600 leading-relaxed">
              Al realizar un pedido a través de la plataforma:
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
              <li>Confirmas que la información proporcionada es correcta.</li>
              <li>El pedido está sujeto a disponibilidad de productos.</li>
              <li>Los precios mostrados incluyen los impuestos aplicables.</li>
              <li>El método de pago será el disponible en el punto de venta presencial.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Propiedad Intelectual</h2>
            <p className="text-gray-600 leading-relaxed">
              Todo el contenido de la plataforma, incluyendo pero no limitado a textos, gráficos, logotipos, 
              iconos, imágenes, software y código fuente, es propiedad del ITAS o de sus proveedores y está 
              protegido por las leyes de propiedad intelectual de Panamá.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">6. Uso Aceptable</h2>
            <p className="text-gray-600 leading-relaxed">
              Al utilizar la plataforma, te comprometes a:
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
              <li>No intentar acceder a cuentas de otros usuarios.</li>
              <li>No utilizar la plataforma para fines ilegales o no autorizados.</li>
              <li>No enviar contenido ofensivo, difamatorio o inapropiado.</li>
              <li>No intentar sobrecargar o dañar la infraestructura de la plataforma.</li>
              <li>No realizar pedidos falsos o fraudulentos.</li>
              <li>No intentar explotar vulnerabilidades de seguridad.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">7. Limitación de Responsabilidad</h2>
            <p className="text-gray-600 leading-relaxed">
              La plataforma se proporcion&quot;tal cual&quot; y &quot;según disponibilidad&quot;. No garantizamos que:
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
              <li>El servicio estará disponible de forma ininterrumpida.</li>
              <li>Los productos estarán disponibles en todo momento.</li>
              <li>Los tiempos de entrega serán exactos.</li>
            </ul>
            <p className="text-gray-600 mt-2">
              El ITAS no será responsable por daños indirectos, incidentales o consecuentes derivados del uso de la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">8. Protección de Datos</h2>
            <p className="text-gray-600 leading-relaxed">
              El tratamiento de tus datos personales se rige por nuestra{" "}
              <a href="/privacy" className="text-green-700 hover:text-green-800 underline">
                Política de Privacidad
              </a>
              , que forma parte integral de estos términos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">9. Cookies</h2>
            <p className="text-gray-600 leading-relaxed">
              Utilizamos cookies para mejorar tu experiencia en la plataforma. Al continuar navegando, 
              aceptas el uso de cookies según se describe en nuestra Política de Privacidad. Puedes gestionar 
              tus preferencias de cookies en cualquier momento.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">10. Modificaciones</h2>
            <p className="text-gray-600 leading-relaxed">
              Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones 
              entrarán en vigor inmediatamente después de su publicación en la plataforma. El uso continuado 
              de la plataforma después de los cambios constituye la aceptación de los nuevos términos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">11. Ley Aplicable y Jurisdicción</h2>
            <p className="text-gray-600 leading-relaxed">
              Estos términos se rigen por las leyes de la República de Panamá. Cualquier disputa derivada del 
              uso de la plataforma será sometida a la jurisdicción de los tribunales competentes de la Ciudad de Panamá.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">12. Contacto</h2>
            <p className="text-gray-600 leading-relaxed">
              Si tienes preguntas sobre estos términos y condiciones, puedes contactarnos a través de la 
              sección de contacto de la plataforma.
            </p>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
