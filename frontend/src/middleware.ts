// src/middleware.ts

import { NextResponse, type NextRequest } from "next/server";

// ─── RUTAS ─────────────────────────────────────────────────

/** Rutas públicas que no requieren autenticación */
const PUBLIC_ROUTES = ["/login", "/register"];

/** Prefijos de rutas públicas (tienda, ferias públicas) */
const PUBLIC_PREFIXES = ["/shop", "/public-fairs"];

/** Rutas protegidas (dashboard y todas sus subrutas) */
const PROTECTED_PREFIX = "/dashboard";

/** Ruta a la que redirigir si no está autenticado */
const LOGIN_ROUTE = "/login";

/** Ruta por defecto para usuarios autenticados (clientes) */
const DEFAULT_ROUTE = "/shop";

/** Ruta para administradores (se define en el frontend según rol) */
const DASHBOARD_ROUTE = "/dashboard";

// ─── MIDDLEWARE ────────────────────────────────────────────

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Verificar cookie ligera de sesión
  const hasSession = request.cookies.get("has_session")?.value === "true";

  // Verificar si es ruta pública por prefijo
  const isPublicPrefix = PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );

  // ─── USUARIO NO AUTENTICADO ────────────────────────
  if (!hasSession) {
    // Ruta pública (shop, public-fairs, login, register) → permitir
    if (isPublicPrefix || PUBLIC_ROUTES.includes(pathname)) {
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
  if (hasSession) {
    // Intentando acceder a login o register → redirigir a tienda
    if (PUBLIC_ROUTES.includes(pathname)) {
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

  return NextResponse.next();
}

// ─── CONFIGURACIÓN ─────────────────────────────────────────

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};