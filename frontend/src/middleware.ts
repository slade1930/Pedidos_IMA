// src/middleware.ts

import { NextResponse, type NextRequest } from "next/server";

// ─── RUTAS ─────────────────────────────────────────────────

/** Rutas de autenticación (requieren no tener sesión) */
const AUTH_ROUTES = ["/login", "/register"];

/** Rutas legales públicas para todos (autenticado o no) */
const LEGAL_ROUTES = ["/privacy", "/terms"];

/** Prefijos de rutas públicas (tienda, ferias públicas) */
const PUBLIC_PREFIXES = ["/shop", "/public-fairs"];

/** Rutas protegidas (dashboard y todas sus subrutas) */
const PROTECTED_PREFIX = "/dashboard";

/** Ruta a la que redirigir si no está autenticado */
const LOGIN_ROUTE = "/login";

/** Ruta por defecto para usuarios autenticados (clientes) */
const DEFAULT_ROUTE = "/shop";

// ─── MIDDLEWARE ────────────────────────────────────────────

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // ─── FORZAR HTTPS ─────────────────────────────────
  const proto = request.headers.get("x-forwarded-proto");
  const host = request.nextUrl.hostname;
  const isLocalHost = ["localhost", "127.0.0.1", "0.0.0.0"].includes(host);
  if (proto === "http" && !isLocalHost) {
    const httpsUrl = request.nextUrl.clone();
    httpsUrl.protocol = "https:";
    return NextResponse.redirect(httpsUrl);
  }

  // Verificar cookie ligera de sesión
  const hasSession = request.cookies.get("has_session")?.value === "true";

  // Verificar si es ruta pública por prefijo
  const isPublicPrefix = PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );

  // ─── RUTAS LEGALES: acceso libre para todos ─────────
  if (LEGAL_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // ─── USUARIO NO AUTENTICADO ────────────────────────
  if (!hasSession) {
    // Ruta pública (shop, public-fairs, login, register) → permitir
    if (isPublicPrefix || AUTH_ROUTES.includes(pathname)) {
      return NextResponse.next();
    }

    // Intentando acceder a ruta protegida → redirigir a login
    if (pathname.startsWith(PROTECTED_PREFIX)) {
      const redirectUrl = new URL(LOGIN_ROUTE, request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Cualquier otra ruta → permitir (incluye raíz /)
    return NextResponse.next();
  }

  // ─── USUARIO AUTENTICADO ───────────────────────────
  // Intentando acceder a login o register → redirigir a tienda
  if (AUTH_ROUTES.includes(pathname)) {
    const redirectTo = searchParams.get("redirect") || DEFAULT_ROUTE;
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  // Ruta raíz → redirigir a tienda
  if (pathname === "/") {
    return NextResponse.redirect(new URL(DEFAULT_ROUTE, request.url));
  }

  // Cualquier otra ruta → permitir
  return NextResponse.next();
}

// ─── CONFIGURACIÓN ─────────────────────────────────────────

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};