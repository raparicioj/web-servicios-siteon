import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Layers,
  MessageSquare,
  Sparkles,
  Target,
} from 'lucide-react';
import {
  getPlatformSettings,
  getServiceBySlug,
  listServices,
} from '@/lib/supabase/crm-store';
import { ServiceIcon } from '@/components/services/ServiceIcon';
import { SmartLeadForm } from '@/components/forms/SmartLeadForm';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) {
    return { title: 'Servicio no encontrado' };
  }

  return {
    title: service.seo_title || service.title,
    description: service.seo_description || service.summary,
    alternates: {
      canonical: `https://www.siteon.cl/servicios/${service.slug}`,
    },
    openGraph: {
      title: service.seo_title || service.title,
      description: service.seo_description || service.summary,
      url: `https://www.siteon.cl/servicios/${service.slug}`,
      type: 'article',
    },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [service, allServices, settings] = await Promise.all([
    getServiceBySlug(slug),
    listServices(false),
    getPlatformSettings(),
  ]);

  if (!service) {
    notFound();
  }

  const cleanPhone = settings.whatsapp_number.replace(/\D/g, '') || '56958324650';
  const waHref = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    service.whatsapp_prompt
  )}`;

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.summary,
    provider: {
      '@type': 'ProfessionalService',
      name: 'Site On Tecnología',
      url: 'https://www.siteon.cl',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Viña del Mar',
        addressRegion: 'Región de Valparaíso',
        addressCountry: 'CL',
      },
    },
    areaServed: 'Chile',
  };

  return (
    <div className="pt-32 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/servicios"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Volver al catálogo de servicios
        </Link>

        {/* Hero del Servicio */}
        <div className="rounded-3xl border border-teal-300/30 bg-[#123249]/90 backdrop-blur-md p-8 sm:p-12 mb-14 shadow-2xl">
          <div className="max-w-4xl space-y-5">
            <div className="inline-flex items-center gap-2.5 rounded-full bg-[#2dd4bf]/20 border border-[#5eead4]/40 px-3.5 py-1.5 text-xs font-extrabold text-[#99f6e4]">
              <ServiceIcon name={service.icon_name} className="h-4 w-4" />
              <span>{service.category}</span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-white leading-tight">
              {service.title}
            </h1>

            <p className="text-lg text-teal-50/90 leading-relaxed">{service.tagline}</p>

            <div className="flex flex-wrap gap-2 pt-2">
              {service.technologies.map((tech) => (
                <span
                  key={tech}
                  className="rounded-lg border border-teal-300/25 bg-[#0d2638] px-3 py-1 text-xs font-medium text-teal-50"
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <a
                href="#cotizar"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#5eead4] hover:bg-[#99f6e4] px-6 py-3.5 text-sm font-extrabold text-slate-950 shadow-lg shadow-teal-400/25 transition-all"
              >
                <Sparkles className="h-4 w-4" />
                Solicitar cotización de este servicio
              </a>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-400/45 bg-emerald-500/15 hover:bg-emerald-500/25 px-6 py-3.5 text-sm font-bold text-emerald-200 transition-all"
              >
                <MessageSquare className="h-4 w-4 text-emerald-300" />
                Consultar directo por WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Problema que resuelve & Solución ofrecida */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="rounded-2xl border border-teal-300/25 bg-[#123249]/85 backdrop-blur-md p-7">
            <div className="flex items-center gap-2.5 text-[#67e8f9] font-extrabold text-xs uppercase tracking-wider mb-3">
              <AlertTriangle className="h-4 w-4" /> El problema que resuelve en tu empresa
            </div>
            <h2 className="text-xl font-bold text-white mb-3">
              ¿Por qué las empresas pierden tiempo y dinero en esta área?
            </h2>
            <p className="text-sm text-teal-50/90 leading-relaxed">
              {service.problem_statement}
            </p>
          </div>

          <div className="rounded-2xl border border-[#5eead4]/40 bg-[#153a54]/90 backdrop-blur-md p-7">
            <div className="flex items-center gap-2.5 text-[#5eead4] font-extrabold text-xs uppercase tracking-wider mb-3">
              <Target className="h-4 w-4" /> Nuestra Solución en Site On Tecnología
            </div>
            <h2 className="text-xl font-bold text-white mb-3">
              Ingeniería aplicada y resultados medibles
            </h2>
            <p className="text-sm text-teal-50/90 leading-relaxed">
              {service.solution_description}
            </p>
          </div>
        </div>

        {/* Beneficios para el cliente */}
        <div className="mb-16">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-8">
            Beneficios concretos para tu operación
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {service.benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-2xl border border-teal-300/25 bg-[#123249]/85 backdrop-blur-md p-6 flex flex-col justify-between"
              >
                <div>
                  {benefit.metric && (
                    <div className="inline-block rounded-lg bg-[#2dd4bf]/20 border border-[#5eead4]/40 px-3 py-1 text-xs font-extrabold text-[#99f6e4] mb-4">
                      {benefit.metric}
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                  <p className="text-xs sm:text-sm text-teal-100/80 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Casos de uso y Entregables */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
          <div className="lg:col-span-7 space-y-6">
            <h2 className="font-display text-2xl font-bold text-white">
              Casos de uso reales en empresas
            </h2>
            <div className="space-y-4">
              {service.use_cases.map((uc) => (
                <div
                  key={uc.title}
                  className="rounded-2xl border border-teal-300/25 bg-[#123249]/85 backdrop-blur-md p-6 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#5eead4] uppercase tracking-wider">
                      {uc.industry}
                    </span>
                    <span className="rounded-full bg-[#2dd4bf]/20 px-3 py-0.5 text-xs font-bold text-[#99f6e4]">
                      {uc.metric}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">{uc.title}</h3>
                  <p className="text-xs text-teal-100/80">
                    <strong className="text-white">Desafío:</strong> {uc.challenge}
                  </p>
                  <p className="text-xs text-teal-50">
                    <strong className="text-[#5eead4]">Resultado:</strong> {uc.outcome}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-teal-300/25 bg-[#123249]/90 backdrop-blur-md p-6 sm:p-7">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#5eead4] mb-3">
                <Layers className="h-4 w-4" /> Qué incluye el servicio
              </div>
              <h3 className="text-xl font-bold text-white mb-5">
                Entregables técnicos y comerciales
              </h3>
              <ul className="space-y-3.5">
                {service.deliverables.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-xs sm:text-sm text-teal-50">
                    <CheckCircle2 className="h-4 w-4 text-[#5eead4] shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Formulario de cotización preseleccionado para este servicio */}
        <div id="cotizar" className="scroll-mt-28 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-400">
              Cotización Personalizada
            </span>
            <h2 className="font-display text-3xl font-bold text-white">
              Solicita una propuesta para {service.short_title}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Este formulario está conectado directamente con nuestro CRM comercial. Tu solicitud
              quedará clasificada bajo <strong className="text-white">{service.title}</strong> para
              atención inmediata.
            </p>

            <div className="pt-4 border-t border-slate-800">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Otros servicios relacionados
              </h4>
              <div className="flex flex-wrap gap-2">
                {allServices
                  .filter((s) => s.slug !== service.slug)
                  .slice(0, 5)
                  .map((s) => (
                    <Link
                      key={s.slug}
                      href={`/servicios/${s.slug}`}
                      className="rounded-xl border border-slate-800 bg-slate-900/70 hover:border-brand-500/40 px-3 py-1.5 text-xs text-slate-300 hover:text-white transition-colors"
                    >
                      {s.short_title}
                    </Link>
                  ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <SmartLeadForm
              defaultServiceSlug={service.slug}
              whatsappNumber={settings.whatsapp_number}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

