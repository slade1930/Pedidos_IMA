"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const COOKIE_CONSENT_KEY = "itas_cookie_consent";

type ConsentType = "accepted" | "rejected" | null;

export function CookieConsent() {
  const [consent, setConsent] = useState<ConsentType>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY) as ConsentType;
    if (!stored) {
      setVisible(true);
    }
    setConsent(stored);
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setConsent("accepted");
    setVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "rejected");
    setConsent("rejected");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6"
        >
          <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-2xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#1b4f72" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  Aviso de Cookies
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Utilizamos cookies esenciales para el funcionamiento de la plataforma (autenticación, sesión) 
                  y cookies de preferencias para recordar tu configuración. 
                  No utilizamos cookies de rastreo ni publicitarias. 
                  Consulta nuestra{" "}
                  <a href="/privacy" className="text-green-700 hover:underline font-medium">
                    Política de Privacidad
                  </a>{" "}
                  para más información.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={handleReject}
                  className="px-4 py-2 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Rechazar
                </button>
                <button
                  onClick={handleAccept}
                  className="px-4 py-2 text-xs font-medium text-white bg-green-700 hover:bg-green-800 rounded-lg transition-colors shadow-sm"
                >
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default CookieConsent;
