"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TERMS_KEY = "itas_terms_accepted";

interface TermsModalProps {
  onAccept: () => void;
  onReject: () => void;
}

export function TermsAcceptanceModal({ onAccept, onReject }: TermsModalProps) {
  const [scrolled, setScrolled] = useState(false);
  const [checked, setChecked] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 30;
    if (atBottom && !scrolled) setScrolled(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        style={{ maxHeight: "85vh" }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#1b4f72" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Términos y Condiciones</h2>
              <p className="text-xs text-gray-500">Debes leer y aceptar para continuar</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div
          className="px-6 py-4 overflow-y-auto text-sm text-gray-600 leading-relaxed space-y-4"
          style={{ maxHeight: "45vh" }}
          onScroll={handleScroll}
        >
          <p>
            Bienvenido a <strong>Pedidos ITAS</strong>. Al crear una cuenta, aceptas los siguientes términos y condiciones:
          </p>

          <div>
            <h3 className="font-semibold text-gray-800 mb-1">1. Uso de la Plataforma</h3>
            <p>
              Esta plataforma permite gestionar pedidos en ferias agrícolas de la Iniciativa Tecnológica de Abasto Social (ITAS) de Panamá. 
              Es un proyecto de <strong>investigación académica</strong> y puede contener funcionalidades experimentales.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-1">2. Datos que Recopilamos</h3>
            <p>
              Recopilamos: nombre completo, cédula de identidad, correo electrónico, teléfono (opcional), 
              dirección (opcional) y historial de pedidos. Estos datos se usan exclusivamente para gestionar tu cuenta y pedidos.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-1">3. Finalidad Académica</h3>
            <p>
              Los datos agregados y anonimizados pueden utilizarse con fines exclusivamente <strong>académicos e investigativos</strong>. 
              No se comparte información personal identificable con terceros.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-1">4. Seguridad de tus Datos</h3>
            <p>
              Tus contraseñas se cifran de forma irreversible. Las conexiones están protegidas con SSL/TLS. 
              Implementamos autenticación JWT, rate limiting y control de acceso por roles.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-1">5. Cookies</h3>
            <p>
              Utilizamos cookies esenciales para autenticación y sesión, y cookies de preferencias para recordar tu configuración. 
              No utilizamos cookies de rastreo ni publicitarias.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-1">6. Tus Derechos</h3>
            <p>
              Puedes acceder, rectificar o solicitar la eliminación de tus datos en cualquier momento. 
              Consulta nuestra{" "}
              <a href="/privacy" target="_blank" className="text-green-700 underline font-medium">
                Política de Privacidad
              </a>{" "}
              para más detalles.
            </p>
          </div>

          <div className="pt-2 pb-1">
            <p className="text-xs text-gray-400 italic">
              Al continuar, confirmas que has leído y aceptas estos términos y la política de privacidad.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          {/* Checkbox */}
          <label className="flex items-start gap-3 mb-4 cursor-pointer group">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                disabled={!scrolled}
                className="sr-only peer"
              />
              <div className="w-5 h-5 border-2 border-gray-300 rounded-md peer-checked:border-green-600 peer-checked:bg-green-600 transition-colors flex items-center justify-center">
                {checked && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-sm text-gray-600 leading-snug">
              He leído y acepto los{" "}
              <a href="/terms" target="_blank" className="text-green-700 underline font-medium">
                Términos y Condiciones
              </a>{" "}
              y la{" "}
              <a href="/privacy" target="_blank" className="text-green-700 underline font-medium">
                Política de Privacidad
              </a>.
            </span>
          </label>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onReject}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Rechazar
            </button>
            <button
              onClick={onAccept}
              disabled={!checked}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: checked
                  ? "linear-gradient(135deg, #1b4f72 0%, #2e7d9e 100%)"
                  : "#9CA3AF",
                boxShadow: checked ? "0 2px 8px rgba(61,90,30,0.3)" : "none",
              }}
            >
              Aceptar y Continuar
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function useTermsAcceptance() {
  const [accepted, setAccepted] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(TERMS_KEY) === "true";
  });
  const [showModal, setShowModal] = useState(!accepted);

  const accept = () => {
    localStorage.setItem(TERMS_KEY, "true");
    setAccepted(true);
    setShowModal(false);
  };

  const reject = () => {
    setShowModal(false);
    window.location.href = "/";
  };

  const reset = () => {
    localStorage.removeItem(TERMS_KEY);
    setAccepted(false);
    setShowModal(true);
  };

  return { accepted, showModal, accept, reject, reset };
}
