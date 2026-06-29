// src/features/auth/components/RegisterForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/features/auth/schemas/auth.schema";
import { useRegister } from "@/features/auth/hooks/useRegister";

// ─── VARIANTES ────────────────────────────────────────────────────────────────

const fieldVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.06,
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

const errorVariants: Variants = {
  hidden:  { opacity: 0, y: -6, scale: 0.98 },
  visible: { opacity: 1, y: 0,  scale: 1,    transition: { duration: 0.2 } },
  exit:    { opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.15 } },
};

// ─── ÍCONOS ───────────────────────────────────────────────────────────────────

function IconUser() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function IconId() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}

function IconEyeOpen() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function IconEyeClosed() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );
}

function IconAlert() {
  return (
    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  );
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getInputStyle(hasError: boolean, isFocused: boolean): React.CSSProperties {
  return {
    width: "100%",
    height: "44px",
    paddingLeft: "42px",
    paddingRight: "16px",
    fontSize: "14px",
    color: "#4A3728",
    background: "#FFFFFF",
    border: `1.5px solid ${hasError ? "#C94B32" : isFocused ? "#3D5A1E" : "#E8DDD0"}`,
    borderRadius: "10px",
    outline: "none",
    boxShadow: isFocused
      ? hasError
        ? "0 0 0 3px rgba(201,75,50,0.1)"
        : "0 0 0 3px rgba(61,90,30,0.08)"
      : "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box",
  };
}

// ─── SUB-COMPONENTES ──────────────────────────────────────────────────────────

function FieldError({ message }: { message: string }) {
  return (
    <motion.p
      variants={errorVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{
        fontSize: "11px",
        color: "#C94B32",
        fontWeight: 500,
        marginTop: "5px",
        marginBottom: 0,
        display: "flex",
        alignItems: "center",
        gap: "4px",
      }}
      role="alert"
    >
      <IconAlert />
      {message}
    </motion.p>
  );
}

function ServerErrorBanner({ message }: { message: string }) {
  return (
    <motion.div
      variants={errorVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      role="alert"
      style={{
        background: "rgba(201,75,50,0.06)",
        border: "0.5px solid rgba(201,75,50,0.25)",
        borderRadius: "10px",
        padding: "12px 14px",
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
      }}
    >
      <div
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          background: "rgba(201,75,50,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: "#C94B32",
        }}
      >
        <IconAlert />
      </div>
      <p style={{ fontSize: "13px", color: "#C94B32", lineHeight: 1.5, margin: 0 }}>
        {message}
      </p>
    </motion.div>
  );
}

function LoginLink() {
  return (
    <>
      <style>{`
        .ima-login-link {
          color: #3D5A1E;
          font-weight: 600;
          text-decoration: none;
          border-bottom: 1.5px solid #F2A900;
          padding-bottom: 1px;
          transition: color 0.2s;
        }
        .ima-login-link:hover { color: #2D4A0E; }
      `}</style>
      <a href="/login" className="ima-login-link">
        Inicia sesión
      </a>
    </>
  );
}

// ─── FIELD WRAPPER ────────────────────────────────────────────────────────────

interface FieldProps {
  id: string;
  label: string;
  optional?: boolean;
  icon: React.ReactNode;
  error?: string;
  isFocused: boolean;
  children: React.ReactNode;
  index: number;
}

function Field({ id, label, optional, icon, error, isFocused, children, index }: FieldProps) {
  return (
    <motion.div
      custom={index}
      variants={fieldVariants}
      initial="hidden"
      animate="visible"
      style={{ marginBottom: "14px" }}
    >
      <label
        htmlFor={id}
        style={{
          display: "block",
          fontSize: "11px",
          fontWeight: 600,
          color: "#4A3728",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          marginBottom: "6px",
        }}
      >
        {label}
        {optional && (
          <span style={{ color: "#B8A99A", fontWeight: 400, marginLeft: "4px", textTransform: "none", letterSpacing: 0 }}>
            (opcional)
          </span>
        )}
      </label>
      <div style={{ position: "relative" }}>
        <span
          style={{
            position: "absolute",
            left: "13px",
            top: "50%",
            transform: "translateY(-50%)",
            color: isFocused ? "#3D5A1E" : "#B8A99A",
            transition: "color 0.2s",
            pointerEvents: "none",
            display: "flex",
          }}
        >
          {icon}
        </span>
        {children}
      </div>
      <AnimatePresence mode="wait">
        {error && <FieldError key={`${id}-err`} message={error} />}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

export function RegisterForm() {
  const router = useRouter();

  // ── LÓGICA ORIGINAL (sin modificar) ──────────────────────────────────────
  const { mutate: register, isPending, error } = useRegister();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name:        "",
      cedula:           "",
      email:            "",
      phone:            "",
      password:         "",
      confirm_password: "",
    },
  });

  const onSubmit = (data: RegisterFormValues) => {
    setServerError(null);
    register(data, {
      onSuccess: () => { router.push("/shop"); },
      onError: (err: { message: string }) => {
        setServerError(err.message || "Error al crear la cuenta");
      },
    });
  };
  // ─────────────────────────────────────────────────────────────────────────

  // Estado visual local (solo UI)
  const [showPassword, setShowPassword]         = useState(false);
  const [showConfirmPassword, setShowConfirm]   = useState(false);
  const [focusedField, setFocusedField]         = useState<string | null>(null);

  // Extraer register objects para fusionar onBlur sin duplicar
  const fullNameReg  = registerField("full_name");
  const cedulaReg    = registerField("cedula");
  const emailReg     = registerField("email");
  const phoneReg     = registerField("phone");
  const passwordReg  = registerField("password");
  const confirmReg   = registerField("confirm_password");

  const handleFocus = (name: string) => () => setFocusedField(name);
  const handleBlur  = (reg: { onBlur: (e: React.FocusEvent<HTMLInputElement>) => void }) =>
    (e: React.FocusEvent<HTMLInputElement>) => {
      setFocusedField(null);
      reg.onBlur(e);
    };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>

      {/* ── Errores servidor / red ────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {(serverError || (error && !serverError)) && (
          <div key="server-error" style={{ marginBottom: "16px" }}>
            <ServerErrorBanner
              message={
                serverError
                  ? serverError
                  : "Error de conexión. Verifica que el servidor esté disponible."
              }
            />
          </div>
        )}
      </AnimatePresence>

      {/* ── Nombre completo ───────────────────────────────────────────── */}
      <Field
        id="full_name"
        label="Nombre completo"
        icon={<IconUser />}
        error={errors.full_name?.message}
        isFocused={focusedField === "full_name"}
        index={0}
      >
        <input
          id="full_name"
          type="text"
          autoComplete="name"
          disabled={isPending}
          placeholder="Tu nombre completo"
          style={getInputStyle(!!errors.full_name, focusedField === "full_name")}
          {...fullNameReg}
          onFocus={handleFocus("full_name")}
          onBlur={handleBlur(fullNameReg)}
        />
      </Field>

      {/* ── Cédula ───────────────────────────────────────────────────── */}
      <Field
        id="cedula"
        label="Cédula"
        icon={<IconId />}
        error={errors.cedula?.message}
        isFocused={focusedField === "cedula"}
        index={1}
      >
        <input
          id="cedula"
          type="text"
          autoComplete="off"
          disabled={isPending}
          placeholder="Ej: 8-888-888"
          style={getInputStyle(!!errors.cedula, focusedField === "cedula")}
          {...cedulaReg}
          onFocus={handleFocus("cedula")}
          onBlur={handleBlur(cedulaReg)}
        />
      </Field>

      {/* ── Email ────────────────────────────────────────────────────── */}
      <Field
        id="email"
        label="Correo electrónico"
        icon={<IconMail />}
        error={errors.email?.message}
        isFocused={focusedField === "email"}
        index={2}
      >
        <input
          id="email"
          type="email"
          autoComplete="email"
          disabled={isPending}
          placeholder="correo@ima.gob.pa"
          style={getInputStyle(!!errors.email, focusedField === "email")}
          {...emailReg}
          onFocus={handleFocus("email")}
          onBlur={handleBlur(emailReg)}
        />
      </Field>

      {/* ── Teléfono ─────────────────────────────────────────────────── */}
      <Field
        id="phone"
        label="Teléfono"
        optional
        icon={<IconPhone />}
        error={errors.phone?.message}
        isFocused={focusedField === "phone"}
        index={3}
      >
        <input
          id="phone"
          type="tel"
          autoComplete="tel"
          disabled={isPending}
          placeholder="6666-6666"
          style={getInputStyle(!!errors.phone, focusedField === "phone")}
          {...phoneReg}
          onFocus={handleFocus("phone")}
          onBlur={handleBlur(phoneReg)}
        />
      </Field>

      {/* ── Contraseña ───────────────────────────────────────────────── */}
      <Field
        id="password"
        label="Contraseña"
        icon={<IconLock />}
        error={errors.password?.message}
        isFocused={focusedField === "password"}
        index={4}
      >
        <input
          id="password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          disabled={isPending}
          placeholder="Mínimo 8 caracteres"
          style={{
            ...getInputStyle(!!errors.password, focusedField === "password"),
            paddingRight: "44px",
          }}
          {...passwordReg}
          onFocus={handleFocus("password")}
          onBlur={handleBlur(passwordReg)}
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          style={{
            position: "absolute",
            right: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "2px",
            color: "#B8A99A",
            display: "flex",
            alignItems: "center",
          }}
        >
          {showPassword ? <IconEyeOpen /> : <IconEyeClosed />}
        </button>
      </Field>

      {/* ── Confirmar contraseña ─────────────────────────────────────── */}
      <Field
        id="confirm_password"
        label="Confirmar contraseña"
        icon={<IconLock />}
        error={errors.confirm_password?.message}
        isFocused={focusedField === "confirm_password"}
        index={5}
      >
        <input
          id="confirm_password"
          type={showConfirmPassword ? "text" : "password"}
          autoComplete="new-password"
          disabled={isPending}
          placeholder="Repite la contraseña"
          style={{
            ...getInputStyle(!!errors.confirm_password, focusedField === "confirm_password"),
            paddingRight: "44px",
          }}
          {...confirmReg}
          onFocus={handleFocus("confirm_password")}
          onBlur={handleBlur(confirmReg)}
        />
        <button
          type="button"
          onClick={() => setShowConfirm((v) => !v)}
          aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          style={{
            position: "absolute",
            right: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "2px",
            color: "#B8A99A",
            display: "flex",
            alignItems: "center",
          }}
        >
          {showConfirmPassword ? <IconEyeOpen /> : <IconEyeClosed />}
        </button>
      </Field>

      {/* ── Botón Submit ──────────────────────────────────────────────── */}
      <motion.div
        custom={6}
        variants={fieldVariants}
        initial="hidden"
        animate="visible"
        style={{ marginBottom: "16px", marginTop: "8px" }}
      >
        <motion.button
          type="submit"
          disabled={isPending}
          whileHover={!isPending ? { scale: 1.015 } : undefined}
          whileTap={!isPending ? { scale: 0.985 } : undefined}
          style={{
            width: "100%",
            height: "46px",
            background: isPending
              ? "rgba(61,90,30,0.6)"
              : "linear-gradient(135deg, #3D5A1E 0%, #4A6B2C 100%)",
            color: "#FDF8F0",
            border: "none",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: isPending ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            position: "relative",
            overflow: "hidden",
            boxShadow: isPending
              ? "none"
              : "0 2px 8px rgba(61,90,30,0.3), 0 1px 2px rgba(61,90,30,0.2)",
            transition: "background 0.2s, box-shadow 0.2s",
          }}
        >
          {/* Shimmer Golden Corn */}
          {!isPending && (
            <motion.span
              aria-hidden="true"
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                repeatDelay: 1.5,
                ease: "easeInOut",
              }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  "linear-gradient(90deg, transparent, rgba(242,169,0,0.18), transparent)",
                pointerEvents: "none",
              }}
            />
          )}

          {isPending ? (
            <>
              <motion.svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </motion.svg>
              <span>Creando cuenta…</span>
            </>
          ) : (
            <span style={{ position: "relative" }}>Crear cuenta →</span>
          )}
        </motion.button>
      </motion.div>

      {/* ── Link a login ──────────────────────────────────────────────── */}
      <motion.div
        custom={7}
        variants={fieldVariants}
        initial="hidden"
        animate="visible"
        style={{
          textAlign: "center",
          fontSize: "13px",
          color: "rgba(74,55,40,0.5)",
        }}
      >
        <span>¿Ya tienes cuenta? </span>
        <LoginLink />
      </motion.div>

    </form>
  );
}

export default RegisterForm;