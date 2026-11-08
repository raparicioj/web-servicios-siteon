import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { SiteOnLogo } from '@/components/layout/SiteOnLogo';

export const metadata: Metadata = {
  title: 'Nosotros | Socio Tecnológico en Viña del Mar y Chile',
  description:
    'Conoce a Site On Tecnología: especialistas en Soporte TI empresarial, infraestructura, redes, servidores, Cloud y desarrollo web desde Viña del Mar hacia todo Chile.',
  alternates: {
    canonical: 'https://www.siteon.cl/nosotros',
  },
};

export default async function AboutPage() {
  return (
    <div className="pt-32 pb-24 bg-architect-grid">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24">
          <div className="lg:col-span-7 space-y-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2dd4bf]/15 border border-[#5eead4]/40 px-4 py-1 text-xs font-extrabold uppercase tracking-wider text-[#99f6e4]">
              <Sparkles className="h-3.5 w-3.5" /> Sobre Site On Tecnología
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white leading-tight">
              Tecnología que se entiende,{' '}
              <span className="text-[#5eead4]">
                soluciones que impulsan tu negocio.
              </span>
            </h1>
            <p className="text-base text-teal-50/90 leading-relaxed">
              En <strong className="text-white">Site On Tecnología</strong> nacimos en{' '}
              <strong className="text-white">Viña del Mar, Chile</strong>, con una misión clara:
              convertirnos en el socio tecnológico de confianza para pymes, empresas y
              profesionales que necesitan que su infraestructura informática funcione siempre al
              100%.
            </p>
            <p className="text-base text-teal-50/90 leading-relaxed">
              Nos especializamos en resolver los problemas reales del día a día empresarial: soporte
              técnico rápido (presencial y remoto), redes Wi-Fi estables, administración de
              servidores Windows y Linux, migración a la nube, páginas web comerciales y
              automatización de procesos.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/contacto"
                className="inline-flex items-center gap-2 rounded-full bg-[#5eead4] hover:bg-[#99f6e4] px-7 py-3.5 text-sm font-extrabold text-slate-950 shadow-lg transition-all"
              >
                <span>Agendar diagnóstico gratuito</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/servicios"
                className="inline-flex items-center gap-2 rounded-full border border-teal-300/35 bg-[#123249] hover:bg-[#18415e] px-7 py-3.5 text-sm font-bold text-white transition-all"
              >
                Explorar nuestros servicios
              </Link>
            </div>
          </div>

          {/* Panel Visual de Indicadores e Identidad (Sin fotos personales) */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-teal-300/30 bg-[#102d42]/90 backdrop-blur-md p-7 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-teal-300/20 pb-4">
                <SiteOnLogo
                  size="sm"
                  showSubtitle
                  subtitleText="Estándar de Continuidad Empresarial"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-[#153a54] border border-teal-300/25 p-4">
                  <div className="text-2xl font-display font-extrabold text-[#5eead4]">
                    99.9%
                  </div>
                  <div className="text-xs font-bold text-white mt-1">
                    Continuidad Operativa
                  </div>
                  <div className="text-[11px] text-teal-100/75">
                    En redes y servidores administrados
                  </div>
                </div>

                <div className="rounded-2xl bg-[#153a54] border border-teal-300/25 p-4">
                  <div className="text-2xl font-display font-extrabold text-emerald-300">
                    &lt; 45m
                  </div>
                  <div className="text-xs font-bold text-white mt-1">
                    Respuesta Rápida
                  </div>
                  <div className="text-[11px] text-teal-100/75">
                    Atención remota y en terreno
                  </div>
                </div>

                <div className="rounded-2xl bg-[#153a54] border border-teal-300/25 p-4">
                  <div className="text-2xl font-display font-extrabold text-white">
                    10+
                  </div>
                  <div className="text-xs font-bold text-white mt-1">
                    Especialidades TI
                  </div>
                  <div className="text-[11px] text-teal-100/75">
                    Soporte, Cloud, Web e IA
                  </div>
                </div>

                <div className="rounded-2xl bg-[#153a54] border border-teal-300/25 p-4">
                  <div className="text-2xl font-display font-extrabold text-[#5eead4]">
                    100%
                  </div>
                  <div className="text-xs font-bold text-white mt-1">
                    Transparencia
                  </div>
                  <div className="text-[11px] text-teal-100/75">
                    Costos predecibles en UF/CLP
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pilares Culturales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-3xl border border-teal-300/25 bg-[#123249] p-7">
            <div className="h-11 w-11 rounded-2xl bg-[#2dd4bf]/20 text-[#5eead4] flex items-center justify-center mb-4">
              <HeartHandshake className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Cercanía y Lenguaje Claro</h3>
            <p className="text-sm text-teal-50/85 leading-relaxed">
              Hablamos en el idioma de tu negocio, explicando cada solución de forma simple y con
              presupuestos claros desde el primer día.
            </p>
          </div>

          <div className="rounded-3xl border border-[#99f6e4]/60 bg-gradient-to-br from-[#2dd4bf] via-[#14b8a6] to-[#0891b2] p-7 text-slate-950 shadow-xl">
            <div className="h-11 w-11 rounded-2xl bg-white text-[#0d9488] flex items-center justify-center mb-4">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-950 mb-2">
              Resolución Ágil sin Burocracia
            </h3>
            <p className="text-sm text-slate-900 font-medium leading-relaxed">
              Sabemos que cuando falla un sistema cada minuto cuenta. Actuamos rápido tanto en
              línea como presencialmente en tu oficina.
            </p>
          </div>

          <div className="rounded-3xl border border-teal-300/25 bg-[#123249] p-7">
            <div className="h-11 w-11 rounded-2xl bg-[#2dd4bf]/20 text-[#5eead4] flex items-center justify-center mb-4">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Seguridad y Prevención</h3>
            <p className="text-sm text-teal-50/85 leading-relaxed">
              Protegemos la información crítica de tu empresa mediante respaldos verificados,
              administración de servidores y monitoreo continuo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
