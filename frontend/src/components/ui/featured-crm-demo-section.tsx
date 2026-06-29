"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { PlayCircle } from "lucide-react";

export default function FeaturedCrmDemoSection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const crmFeatures = [
    {
      title: "Control de Inventario en Tiempo Real",
      subtitle:
        "Monitorea el stock de productos agrícolas disponibles en cada feria libre directamente desde el panel administrativo de forma instantánea."
    },
    {
      title: "Confirmaciones Automatizadas",
      subtitle:
        "Los usuarios reciben su código de retiro de forma segura y automática tras completarse el pago digital vía Yappy o Tarjeta."
    },
    {
      title: "Reportes Agropecuarios Claros",
      subtitle:
        "Genera estadísticas de ventas, demanda de productos y afluencia por feria para guiar las políticas de subsidios y precios."
    },
    {
      title: "Colaboración con Productores",
      subtitle:
        "Sincroniza el catálogo de productos con las cosechas reales de los agricultores panameños para evitar desperdicios de alimentos."
    }
  ];

  return (
    <div className="max-w-7xl mx-auto bg-transparent text-black dark:text-white">
      {/* Header */}
      <header className="text-left py-6">
        <span className="inline-block rounded-full border border-[#3D5A1E]/15 bg-[#3D5A1E]/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#3D5A1E] leading-none mb-3">
          Integración IMA
        </span>
        <h2 className="text-4xl font-black tracking-tight text-[#4A3728]">
          Potenciando el Agro Panameño <br />con Soluciones Tecnológicas.
        </h2>
      </header>

      {/* Templates Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full items-stretch">
        {/* Main video/image card */}
        <Card className="lg:col-span-2 bg-[#E8DDD0]/20 dark:bg-zinc-800 p-2 overflow-hidden relative mb-4 lg:mb-0 flex flex-col min-h-[350px] rounded-3xl border border-gray-150">
          <CardContent className="p-0 relative flex-grow group rounded-2xl overflow-hidden h-full">
            {isPlaying ? (
              <video
                src="https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev/crm(1)(1)(1).mp4"
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover rounded-2xl min-h-[330px]"
              />
            ) : (
              <div className="relative w-full h-full min-h-[330px]">
                <img
                  src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?q=80&w=1200&auto=format&fit=crop"
                  alt="IMA Agro Technology Video Thumbnail"
                  className="object-cover rounded-2xl transition-transform duration-700 group-hover:scale-105 w-full h-full absolute inset-0"
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                {/* Info Text */}
                <div className="absolute bottom-6 left-6 right-6 text-white z-10">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#FBBF24]">Video de Operaciones</span>
                  <h3 className="text-xl font-extrabold tracking-tight mt-1">Cómo Funciona la Logística de Ferias Libres</h3>
                </div>

                {/* Play button overlay */}
                <button
                  onClick={() => setIsPlaying(true)}
                  className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-all"
                >
                  <PlayCircle className="w-16 h-16 text-white/95 drop-shadow-xl hover:scale-110 transition-transform" strokeWidth={1.5} />
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
          {crmFeatures.map((feature, i) => (
            <div
              key={i}
              className="flex flex-col border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-3xl p-5 hover:shadow-lg hover:border-[#3D5A1E]/20 cursor-pointer transition-all duration-300 group shadow-sm justify-between"
            >
              <div className="h-9 w-9 rounded-xl bg-[#3D5A1E]/8 flex items-center justify-center text-[#3D5A1E] font-black text-xs">
                {`0${i + 1}`}
              </div>

              <div className="mt-4 space-y-1">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-zinc-100 group-hover:text-[#3D5A1E] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-[11px] text-gray-400 font-semibold leading-relaxed">
                  {feature.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Aliados */}
      <div className="mt-10">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">
          Aliados y Métodos de Integración
        </h4>
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {[
            { name: "Yappy", subtitle: "Pago móvil Banco General", domain: "bancogeneral.com" },
            { name: "Visa", subtitle: "Pasarela de tarjetas de crédito", domain: "visa.com" },
            { name: "Mastercard", subtitle: "Pagos globales y débito", domain: "mastercard.com" },
            { name: "Stripe", subtitle: "Procesador de pagos digital", domain: "stripe.com" },
            { name: "MIDA Panamá", subtitle: "Ministerio de Desarrollo Agropecuario", domain: "mida.gob.pa" },
            { name: "IMA Panamá", subtitle: "Instituto de Mercadeo Agropecuario", domain: "ima.gob.pa" },
            { name: "Panamá Digital", subtitle: "Autoridad de Innovación AIG", domain: "aig.gob.pa" },
            { name: "Banco Nacional", subtitle: "Soporte financiero estatal", domain: "banconal.com.pa" },
          ].map((integration) => (
            <div
              key={integration.name}
              className="p-3.5 flex items-center gap-3 bg-white hover:bg-gray-50 border border-gray-100 rounded-3xl transition-all shadow-sm group hover:border-[#3D5A1E]/10"
            >
              <div className="w-10 h-10 object-contain rounded-xl bg-white border border-gray-100 p-1 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
                <img
                  src={`https://logo.clearbit.com/${integration.domain}`}
                  alt={integration.name}
                  className="object-contain w-8 h-8 rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(integration.name)}&background=3D5A1E&color=fff&size=128&bold=true`;
                  }}
                />
              </div>
              <div className="min-w-0">
                <div className="font-extrabold text-gray-900 truncate">{integration.name}</div>
                <div className="text-[10px] text-gray-400 font-bold truncate">{integration.subtitle}</div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}