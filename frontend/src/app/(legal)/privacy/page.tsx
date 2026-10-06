"use client";

import { motion } from "framer-motion";

export default function PrivacyPolicyPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Política de Privacidad</h1>
        <p className="text-sm text-gray-500 mb-8">Última actualización: 26 de agosto de 2026</p>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Información que Recopilamos</h2>
            <p className="text-gray-600 leading-relaxed">
              Recopilamos la siguiente información cuando te registras y utilizas nuestra plataforma:
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
              <li><strong>Nombre completo</strong> — para identificarte en el sistema.</li>
              <li><strong>Cédula de identidad</strong> — para verificación de identidad según normativa panameña.</li>
              <li><strong>Correo electrónico</strong> — para autenticación y comunicaciones relacionadas con tu cuenta.</li>
              <li><strong>Número de teléfono</strong> — (opcional) para notificaciones de pedidos.</li>
              <li><strong>Dirección</strong> — (opcional) para entrega de productos.</li>
              <li><strong>Datos de pedidos</strong> — historial de compras, productos seleccionados y estado de pedidos.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Uso de los Datos</h2>
            <p className="text-gray-600 leading-relaxed">
              Utilizamos tu información exclusivamente para los siguientes fines:
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
              <li>Gestionar tu cuenta y autenticación en la plataforma.</li>
              <li>Procesar y gestionar tus pedidos de productos.</li>
              <li>Enviar notificaciones sobre el estado de tus pedidos.</li>
              <li>Generar facturas y reportes de compra.</li>
              <li>Mejorar la experiencia de usuario en la plataforma.</li>
              <li><strong>Fines académicos de investigación</strong> — Esta plataforma forma parte de un proyecto de investigación académica. Los datos agregados y anonimizados pueden utilizarse con fines exclusivamente académicos e investigativos.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">3. Base Legal del Tratamiento</h2>
            <p className="text-gray-600 leading-relaxed">
              El tratamiento de tus datos se basa en:
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
              <li>Tu <strong>consentimiento explícito</strong> al registrarte y aceptar esta política.</li>
              <li>La <strong>ejecución de un contrato</strong> — el procesamiento de tu pedido.</li>
              <li>Nuestro <strong>interés legítimo</strong> en mejorar la plataforma y prevenir fraudes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Almacenamiento y Seguridad</h2>
            <p className="text-gray-600 leading-relaxed">
              Tus datos se almacenan en servidores seguros (Neon PostgreSQL) con cifrado en tránsito (SSL/TLS). 
              Implementamos las siguientes medidas de seguridad:
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
              <li>Contraseñas cifradas con bcrypt (irreversibles).</li>
              <li>Conexiones cifradas a la base de datos.</li>
              <li>Control de acceso por roles y autenticación JWT.</li>
              <li>Rate limiting para prevenir abusos.</li>
              <li>Headers de seguridad en todas las respuestas.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Compartir Datos con Terceros</h2>
            <p className="text-gray-600 leading-relaxed">
              No vendemos ni compartimos tu información personal con terceros, excepto:
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
              <li><strong>Cloudinary</strong> — para almacenamiento de imágenes de productos (no se comparte información personal).</li>
              <li>Cuando lo requiera la <strong>ley o una orden judicial</strong>.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">6. Tus Derechos</h2>
            <p className="text-gray-600 leading-relaxed">
              Conforme a la legislación panameña de protección de datos, tienes derecho a:
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
              <li><strong>Acceder</strong> a tus datos personales.</li>
              <li><strong>Rectificar</strong> datos inexactos.</li>
              <li><strong>Solicitar la eliminación</strong> de tu cuenta y datos.</li>
              <li><strong>Oponerte</strong> al tratamiento de tus datos.</li>
              <li><strong>Portabilidad</strong> de tus datos en formato estructurado.</li>
            </ul>
            <p className="text-gray-600 mt-2">
              Para ejercer estos derechos, contáctanos a través de la plataforma o al correo electrónico de soporte.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">7. Cookies</h2>
            <p className="text-gray-600 leading-relaxed">
              Utilizamos cookies y tecnologías similares para:
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
              <li><strong>Cookies esenciales</strong> — necesarias para el funcionamiento de la plataforma (autenticación, sesión).</li>
              <li><strong>Cookies de preferencias</strong> — para recordar tu configuración (tema oscuro/claro).</li>
            </ul>
            <p className="text-gray-600 mt-2">
              Puedes gestionar tus preferencias de cookies a través del banner que se muestra al acceder por primera vez a la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">8. Retención de Datos</h2>
            <p className="text-gray-600 leading-relaxed">
              Conservamos tu información personal mientras tu cuenta esté activa. Si solicitas la eliminación de tu cuenta, 
              eliminaremos tus datos personales en un plazo máximo de 30 días, excepto cuando exista una obligación legal de conservarlos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">9. Cambios en esta Política</h2>
            <p className="text-gray-600 leading-relaxed">
              Nos reservamos el derecho de actualizar esta política de privacidad. Los cambios significativos serán 
              notificados a través de la plataforma o por correo electrónico.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">10. Contacto</h2>
            <p className="text-gray-600 leading-relaxed">
              Si tienes preguntas sobre esta política de privacidad o sobre el tratamiento de tus datos, 
              puedes contactarnos a través de la sección de contacto de la plataforma.
            </p>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
