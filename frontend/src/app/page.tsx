// src/app/page.tsx

import { redirect } from "next/navigation";

// ─── COMPONENTE ────────────────────────────────────────────

/**
 * Página Raíz
 * 
 * Ruta: /
 * 
 * Redirige automáticamente al dashboard.
 * Si el usuario no está autenticado, el middleware
 * lo redirigirá a /login antes de llegar aquí.
 * 
 * Esta página actúa como fallback: si por alguna razón
 * el middleware no redirige, este componente fuerza
 * la redirección al dashboard.
 */
export default function HomePage() {
  redirect("/shop");
}