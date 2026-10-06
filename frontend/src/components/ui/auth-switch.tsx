"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

// ─── TIPOS ─────────────────────────────────────────────────────────────────────

type AuthSwitchMode = "sign-in" | "sign-up";

interface AuthSwitchProps {
  initialMode?: AuthSwitchMode;
  termsAccepted?: boolean;
  onRequireTerms?: () => void;
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

/**
 * AuthSwitch — Panel animado de autenticación (diseño sliding)
 *
 * Un solo contenedor con las vistas de Iniciar sesión / Crear cuenta que se
 * intercambian con una transición deslizante (selector .sign-up-mode).
 *
 * Reutiliza LoginForm y RegisterForm existentes para preservar toda la lógica
 * (validación zod, react-hook-form, store de auth, redirects).
 */
export default function AuthSwitch({
  initialMode = "sign-in",
  termsAccepted = true,
  onRequireTerms,
}: AuthSwitchProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSignUp, setIsSignUp] = useState(initialMode === "sign-up");

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.classList.toggle("sign-up-mode", isSignUp);
  }, [isSignUp]);

  return (
    <div className="itas-as">
      <style>{`
        .itas-as {
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #1b4f72 0%, #1b4f72 55%, #142b45 100%);
          padding: 20px;
        }

        .itas-as .container {
          position: relative;
          width: 100%;
          max-width: 900px;
          height: 620px;
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
          overflow: hidden;
        }

        .itas-as .forms-container {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }

        .itas-as .signin-signup {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          left: 75%;
          width: 50%;
          transition: 1s 0.7s ease-in-out;
          display: grid;
          grid-template-columns: 1fr;
          z-index: 5;
        }

        .itas-as .sign-in-form,
        .itas-as .sign-up-form {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0 3rem;
          transition: all 0.2s 0.7s;
          overflow-y: auto;
          grid-column: 1 / 2;
          grid-row: 1 / 2;
        }

        .itas-as .sign-in-form {
          justify-content: center;
          z-index: 2;
          visibility: visible;
        }

        .itas-as .sign-up-form {
          justify-content: flex-start;
          padding-top: 2rem;
          padding-bottom: 2rem;
          opacity: 0;
          z-index: 1;
          visibility: hidden;
        }

        .itas-as .sign-up-form::-webkit-scrollbar { width: 6px; }
        .itas-as .sign-up-form::-webkit-scrollbar-thumb {
          background: rgba(20,43,69, 0.3);
          border-radius: 9999px;
        }

        .itas-as .sign-in-form form,
        .itas-as .sign-up-form form {
          width: 100%;
          max-width: 400px;
        }

        .itas-as .title {
          font-size: 2rem;
          color: #142b45;
          margin-bottom: 14px;
          font-weight: 700;
          text-align: center;
          letter-spacing: -0.02em;
        }

        .itas-as .terms-gate {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 18px;
          text-align: center;
          padding: 1rem 0;
        }
        .itas-as .terms-gate p {
          color: #666;
          font-size: 0.95rem;
          line-height: 1.6;
          max-width: 300px;
          margin: 0;
        }

        .itas-as .btn {
          width: 150px;
          background: linear-gradient(135deg, #1b4f72 0%, #2e7d9e 100%);
          border: none;
          outline: none;
          height: 49px;
          border-radius: 49px;
          color: #fff;
          text-transform: uppercase;
          font-weight: 600;
          margin: 10px 0;
          cursor: pointer;
          transition: background 0.3s, transform 0.3s, box-shadow 0.3s;
          font-size: 0.9rem;
        }
        .itas-as .btn:hover {
          background: linear-gradient(135deg, #142b45 0%, #1b4f72 100%);
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(20,43,69, 0.4);
        }

        .itas-as .panels-container {
          position: absolute;
          height: 100%;
          width: 100%;
          top: 0;
          left: 0;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
        }

        .itas-as .panel {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          justify-content: space-around;
          text-align: center;
          z-index: 6;
        }

        .itas-as .left-panel {
          pointer-events: all;
          padding: 3rem 17% 2rem 12%;
        }

        .itas-as .right-panel {
          pointer-events: none;
          padding: 3rem 12% 2rem 17%;
        }

        .itas-as .panel .content {
          color: #fff;
          transition: transform 0.9s ease-in-out;
          transition-delay: 0.6s;
        }

        .itas-as .panel h3 {
          font-weight: 600;
          line-height: 1.15;
          font-size: 1.5rem;
          margin-bottom: 10px;
        }

        .itas-as .panel p {
          font-size: 0.95rem;
          padding: 0.7rem 0;
          line-height: 1.5;
        }

        .itas-as .btn.transparent {
          margin: 0;
          background: none;
          border: 2px solid #fff;
          width: 130px;
          height: 41px;
          font-weight: 600;
          font-size: 0.8rem;
        }
        .itas-as .btn.transparent:hover {
          background: rgba(255, 255, 255, 0.12);
          transform: translateY(-2px);
          box-shadow: none;
        }

        .itas-as .right-panel .content {
          transform: translateX(800px);
        }

        .itas-as .container:before {
          content: "";
          position: absolute;
          height: 2000px;
          width: 2000px;
          top: -10%;
          right: 48%;
          transform: translateY(-50%);
          background: linear-gradient(-45deg, #1b4f72 0%, #1b4f72 45%, #142b45 100%);
          transition: 1.8s ease-in-out;
          border-radius: 50%;
          z-index: 6;
        }

        /* Modo registro */
        .itas-as .container.sign-up-mode:before {
          transform: translate(100%, -50%);
          right: 52%;
        }
        .itas-as .container.sign-up-mode .left-panel .content {
          transform: translateX(-800px);
        }
        .itas-as .container.sign-up-mode .signin-signup {
          left: 25%;
        }
        .itas-as .container.sign-up-mode .sign-up-form {
          opacity: 1;
          z-index: 2;
          visibility: visible;
        }
        .itas-as .container.sign-up-mode .sign-in-form {
          opacity: 0;
          z-index: 1;
          visibility: hidden;
        }
        .itas-as .container.sign-up-mode .right-panel .content {
          transform: translateX(0%);
        }
        .itas-as .container.sign-up-mode .left-panel {
          pointer-events: none;
        }
        .itas-as .container.sign-up-mode .right-panel {
          pointer-events: all;
        }

        @media (max-width: 870px) {
          .itas-as .container {
            min-height: 800px;
            height: 100vh;
          }
          .itas-as .signin-signup {
            width: 100%;
            top: 95%;
            transform: translate(-50%, -100%);
            transition: 1s 0.8s ease-in-out;
          }
          .itas-as .signin-signup,
          .itas-as .container.sign-up-mode .signin-signup {
            left: 50%;
          }
          .itas-as .panels-container {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr 2fr 1fr;
          }
          .itas-as .panel {
            flex-direction: row;
            justify-content: space-around;
            align-items: center;
            padding: 2.5rem 8%;
            grid-column: 1 / 2;
          }
          .itas-as .right-panel { grid-row: 3 / 4; }
          .itas-as .left-panel { grid-row: 1 / 2; }
          .itas-as .panel .content {
            padding-right: 15%;
            transition: transform 0.9s ease-in-out;
            transition-delay: 0.8s;
          }
          .itas-as .panel h3 { font-size: 1.2rem; }
          .itas-as .panel p { font-size: 0.7rem; padding: 0.5rem 0; }
          .itas-as .btn.transparent { width: 110px; height: 35px; font-size: 0.7rem; }
          .itas-as .container:before {
            width: 1500px;
            height: 1500px;
            transform: translateX(-50%);
            left: 30%;
            bottom: 68%;
            right: initial;
            top: initial;
            transition: 2s ease-in-out;
          }
          .itas-as .container.sign-up-mode:before {
            transform: translate(-50%, 100%);
            bottom: 32%;
            right: initial;
          }
          .itas-as .container.sign-up-mode .left-panel .content {
            transform: translateY(-300px);
          }
          .itas-as .container.sign-up-mode .right-panel .content {
            transform: translateY(0px);
          }
          .itas-as .right-panel .content { transform: translateY(300px); }
          .itas-as .container.sign-up-mode .signin-signup {
            top: 5%;
            transform: translate(-50%, 0);
          }
          .itas-as .sign-in-form,
          .itas-as .sign-up-form { padding: 0 1.5rem; }
          .itas-as .sign-up-form { padding-top: 1.5rem; padding-bottom: 1.5rem; }
        }

        @media (max-width: 570px) {
          .itas-as .panel .content { padding: 0.5rem 1rem; }
          .itas-as .panel p { display: none; }
        }

        /* ── MÓVIL: mismo diseño y animación, formulario en flujo ─────────
           El círculo y los paneles siguen animando, pero el formulario se
           coloca EN FLUJO entre los paneles (z10, encima del círculo z6 y
           debajo de los botones de panel z11): nunca queda tapado y la
           página crece/desplaza si el registro es alto.                   */
        @media (max-width: 870px) {
          /* El contenedor crece con el contenido: nada se recorta */
          .itas-as .container {
            height: auto;
            min-height: 100dvh;
          }

          /* Paneles con altura fija (no proporcional al alto total) y por
             encima del formulario para conservar sus botones activos */
          .itas-as .panels-container {
            grid-template-rows: 170px minmax(0, 1fr) 170px;
            z-index: 11;
          }

          /* Formulario en flujo, centrado entre los paneles */
          .itas-as .forms-container {
            position: static;
            height: auto;
          }

          .itas-as .signin-signup,
          .itas-as .container.sign-up-mode .signin-signup {
            position: relative;
            top: auto;
            left: auto;
            transform: none;
            width: 100%;
            height: auto;
            z-index: 10;
            margin-top: 170px;
            margin-bottom: 170px;
          }

          .itas-as .sign-in-form,
          .itas-as .sign-up-form {
            height: auto;
            overflow: visible;
            padding: 0.4rem 1.5rem 0.4rem;
          }

          /* Vistas alternadas en flujo con fade suave */
          .itas-as .signin-signup { display: block; }
          .itas-as .sign-in-form {
            display: flex;
            animation: itas-form-in 0.35s ease both;
          }
          .itas-as .sign-up-form { display: none; }
          .itas-as .container.sign-up-mode .sign-up-form {
            display: flex;
            animation: itas-form-in 0.35s ease both;
          }
          .itas-as .container.sign-up-mode .sign-in-form { display: none; }
        }

        @keyframes itas-form-in {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="container" ref={containerRef}>
        <div className="forms-container">
          <div className="signin-signup">
            {/* Vista: Iniciar sesión */}
            <div className="sign-in-form">
              <Image
                src="/images/ITAS_logo.png"
                alt="ITAS"
                width={1254}
                height={1254}
                className="w-auto h-16 sm:h-20 mb-2 object-contain drop-shadow-[0_6px_18px_rgba(27,79,114,0.35)]"
                priority
              />
              <h2 className="title">Iniciar sesión</h2>
              <LoginForm />
            </div>

            {/* Vista: Crear cuenta */}
            <div className="sign-up-form">
              <h2 className="title">Crear cuenta</h2>
              {termsAccepted ? (
                <RegisterForm />
              ) : (
                <div className="terms-gate">
                  <p>
                    Para crear tu cuenta en las ferias del ITAS primero debes
                    aceptar los Términos y Condiciones.
                  </p>
                  <button type="button" className="btn" onClick={onRequireTerms}>
                    Aceptar términos
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="panels-container">
          <div className="panel left-panel">
            <div className="content">
              <h3>¿Nuevo aquí?</h3>
              <p>
                Únete hoy y descubre un mundo de posibilidades. Crea tu cuenta
                en segundos.
              </p>
              <button
                type="button"
                className="btn transparent"
                onClick={() => setIsSignUp(true)}
              >
                Registrarse
              </button>
            </div>
          </div>

          <div className="panel right-panel">
            <div className="content">
              <h3>¿Ya eres usuario?</h3>
              <p>¡Bienvenido de vuelta! Inicia sesión para continuar.</p>
              <button
                type="button"
                className="btn transparent"
                onClick={() => setIsSignUp(false)}
              >
                Iniciar sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export type { AuthSwitchMode };