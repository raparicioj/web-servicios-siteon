import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Cpu } from 'lucide-react';
import { getPlatformSettings, listServices } from '@/lib/supabase/crm-store';
import { ServiceIcon } from '@/components/services/ServiceIcon';
import { SmartLeadForm } from '@/components/forms/SmartLeadForm';

export const metadata: Metadata = {
  title: 'Servicios TI, Soporte Informático, Redes, Servidores, Cloud y Web en Chile',
  description:
    'Catálogo completo de servicios de Site On Tecnología: Soporte TI para empresas, Infraestructura y Redes, Servidores Windows/Linux, Outsourcing TI, Cloud, Desarrollo Web y Automatización.',
  alternates: {
    canonical: 'https://www.siteon.cl/servicios',
  },
};

export const dynamic = 'force-dynamic';

export default async function ServicesIndexPage() {
  const [services, settings] = await Promise.all([
    listServices(false),
    getPlatformSettings(),
  ]);

  return (
    <div className="pt-32 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2dd4bf]/15 border border-[#5eead4]/40 px-3.5 py-1 text-xs font-extrabold text-[#99f6e4]">
            <Cpu className="h-3.5 w-3.5" /> Portafolio de Soluciones Empresariales
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white mt-4 leading-tight">
            Soluciones tecnológicas diseñadas para hacer crecer tu empresa
          </h1>
          <p className="text-base text-teal-50/90 mt-4 leading-relaxed">
            Desde Viña del Mar hacia todo Chile, acompañamos a empresas, pymes y profesionales en
            cada necesidad tecnológica: desde soporte TI rápido e infraestructura de redes hasta
            servidores, páginas web comerciales y automatización.
          </p>
        </div>

        <div className="space-y-8 mb-24">
          {services.map((srv, idx) => (
            <div
              key={srv.slug}
              className="rounded-3xl border border-teal-300/25 bg-[#123249]/85 backdrop-blur-md hover:border-[#5eead4]/60 p-6 sm:p-8 lg:p-10 transition-all shadow-xl"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2dd4bf]/20 text-[#5eead4] border border-[#5eead4]/40">
                      <ServiceIcon name={srv.icon_name} className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-[#5eead4] uppercase tracking-wider">
                        0{idx + 1} • {srv.category}
                      </span>
                      <h2 className="text-2xl font-extrabold text-white">{srv.title}</h2>
                    </div>
                  </div>

                  <p className="text-sm sm:text-base text-teal-50/90 leading-relaxed">
                    {srv.solution_description}
                  </p>

                  <div className="rounded-2xl border border-teal-300/20 bg-[#0d2638]/90 p-4">
                    <div className="text-xs font-bold text-[#67e8f9] uppercase tracking-wider mb-1">
                      Problema que resolvemos:
                    </div>
                    <p className="text-xs sm:text-sm text-teal-50/85">{srv.problem_statement}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {srv.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-lg bg-[#0d2638] border border-teal-300/25 px-2.5 py-1 text-xs text-teal-100"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-5 rounded-2xl border border-teal-300/25 bg-[#0d2638]/90 p-6 space-y-5">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#5eead4]">
                    Beneficios y Entregables Clave
                  </h3>
                  <ul className="space-y-3">
                    {srv.benefits.map((b) => (
                      <li key={b.title} className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-[#5eead4] shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold text-white">
                            {b.title}{' '}
                            {b.metric && (
                              <span className="ml-1 rounded bg-[#2dd4bf]/20 px-1.5 py-0.5 text-[10px] font-bold text-[#99f6e4]">
                                {b.metric}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-teal-100/75">{b.description}</div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-3 flex flex-col sm:flex-row gap-2.5">
                    <Link
                      href={`/servicios/${srv.slug}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#5eead4] hover:bg-[#99f6e4] px-4 py-3 text-xs font-extrabold text-slate-950 transition-colors"
                    >
                      <span>Ver detalle y casos de uso</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/servicios/${srv.slug}#cotizar`}
                      className="inline-flex items-center justify-center rounded-full border border-teal-300/35 bg-[#153a54] hover:bg-[#1c4b6b] px-4 py-3 text-xs font-bold text-white transition-colors"
                    >
                      Cotizar
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto">
          <SmartLeadForm whatsappNumber={settings.whatsapp_number} />
        </div>
      </div>
    </div>
  );
}
