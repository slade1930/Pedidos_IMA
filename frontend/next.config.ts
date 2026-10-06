import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output standalone para Docker
  output: "standalone",

  // Seguridad: Headers HTTP
  async headers() {
    // upgrade-insecure-requests SOLO en producción: en local (http://localhost)
    // fuerza el upgrade de http -> https y rompe los redirects del dev server.
    const isProd = process.env.NODE_ENV === "production";

    const cspDirectives = [
      "default-src 'self'",
      // scripts: solo self + inline (necesario para el App Router de Next).
      // No se permiten CDNs externos de terceros (exfiltración por XSS).
      "script-src 'self' 'unsafe-inline'",
      // estilos: Tailwind + atributos style inline
      "style-src 'self' 'unsafe-inline'",
      // imágenes: self, backend (API), data: (QR y SVG inline), blob: (facturas)
      "img-src 'self' data: blob: http: https:",
      // fuentes: self + data:
      "font-src 'self' data:",
      // conexiones: self + API backend local (dev) y https (producción)
      `connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"} https:`,
      // nested content / objetos embebidos
      "object-src 'none'",
      "child-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      ...(isProd ? ["upgrade-insecure-requests"] : []),
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspDirectives,
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "same-origin",
          },
        ],
      },
    ];
  },

  // Seguridad: Forzar HTTPS en producción
  async redirects() {
    return [];
  },
};

export default nextConfig;
