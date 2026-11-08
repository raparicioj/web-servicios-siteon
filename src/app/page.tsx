import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Cloud,
  Code2,
  MapPin,
  MessageSquare,
  Server,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  getPlatformSettings,
  listBlogPosts,
  listServices,
} from '@/lib/supabase/crm-store';
import { ServiceIcon } from '@/components/services/ServiceIcon';
import { SmartLeadForm } from '@/components/forms/SmartLeadForm';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [services, posts, settings] = await Promise.all([
    listServices(false),
    listBlogPosts(false),
    getPlatformSettings(),
  ]);

  const cleanPhone = settings.whatsapp_number.replace(/\D/g, '') || '56958324650';
  const heroWhatsAppUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    settings.whatsapp_default_message
  )}`;

  return (
    <div className="relative overflow-hidden bg-architect-grid">
      {/* Iluminación Atmosférica Calipso Claro Superior (Estilo Hexacore / NPEC) */}
      <div
        className="pointer-events-none absolute -top-28 left-1/2 -translate-x-1/2 -z-10 h-[620px] w-[1150px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(94,234,212,0.32)_0%,rgba(34,211,238,0.20)_45%,transparent_75%)] blur-2xl"
        aria-hidden="true"
      />

      {/* ==================== 1. HERO PRINCIPAL (CALIPSO CLARO + DIAGRAMA ORBITAL NPEC) ==================== */}
      <section className="relative pt-32 pb-20 sm:pt-36 sm:pb-28 border-b border-teal-300/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Columna Izquierda: Tipografía NPEC de Alto Impacto con acento Calipso Claro */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#5eead4]/45 bg-[#2dd4bf]/15 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#99f6e4]">
                <span className="h-2 w-2 rounded-full bg-[#5eead4] animate-pulse" />
                <span>Socio Tecnológico de tu Empresa • Viña del Mar & Chile</span>
              </div>

              <h1 className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.05]">
                Soporte TI Sólido. <br />
                <span className="bg-gradient-to-r from-[#99f6e4] via-[#5eead4] to-[#67e8f9] bg-clip-text text-transparent">
                  Resultados Medibles.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-teal-50/90 leading-relaxed max-w-xl">
                Acompañamos a empresas y pymes en crecimiento a modernizar su operación,
                mantener sus computadores y redes sin caídas y construir infraestructura que rinde
                — desde <strong className="text-white">Soporte TI presencial y remoto</strong> hasta{' '}
                <strong className="text-white">Servidores, Cloud, Web y Automatización</strong>.
              </p>

              {/* Botones Píldora en Calipso Claro (#5eead4 / #67e8f9) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <Link
                  href="#solicitar-asesoria"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#5eead4] hover:bg-[#99f6e4] px-7 py-4 text-sm font-extrabold text-slate-950 shadow-[0_12px_32px_rgba(94,234,212,0.35)] transition-all hover:scale-[1.02]"
                >
                  <span>Agendar Diagnóstico Gratis</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/servicios"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-teal-300/35 bg-[#13354e]/90 hover:bg-[#1a4666] px-7 py-4 text-sm font-bold text-white transition-all"
                >
                  <span>Explorar Servicios</span>
                </Link>

                <a
                  href={heroWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-400/45 bg-emerald-500/15 hover:bg-emerald-500/25 px-6 py-4 text-sm font-bold text-emerald-200 transition-all"
                >
                  <MessageSquare className="h-4 w-4 text-emerald-300" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Columna Derecha: Diagrama Orbital Interactivo Estilo NPEC en Calipso Claro */}
            <div className="lg:col-span-6">
              <div className="relative mx-auto max-w-[520px] aspect-square flex items-center justify-center">
                {/* Resplandor central calipso claro */}
                <div className="absolute inset-8 rounded-full bg-gradient-to-tr from-[#2dd4bf]/30 via-[#67e8f9]/25 to-emerald-300/15 blur-3xl" />

                {/* Anillos orbitales y líneas de conexión SVG */}
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 500 500"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    cx="250"
                    cy="250"
                    r="165"
                    stroke="rgba(94, 234, 212, 0.3)"
                    strokeWidth="1.5"
                    strokeDasharray="6 6"
                  />
                  <circle
                    cx="250"
                    cy="250"
                    r="105"
                    stroke="rgba(103, 232, 249, 0.35)"
                    strokeWidth="1.2"
                  />
                  {/* Líneas radiales del núcleo a los nodos */}
                  <line x1="250" y1="250" x2="250" y2="85" stroke="rgba(94,234,212,0.45)" strokeDasharray="4 4" />
                  <line x1="250" y1="250" x2="395" y2="165" stroke="rgba(94,234,212,0.45)" strokeDasharray="4 4" />
                  <line x1="250" y1="250" x2="395" y2="335" stroke="rgba(94,234,212,0.45)" strokeDasharray="4 4" />
                  <line x1="250" y1="250" x2="105" y2="335" stroke="rgba(94,234,212,0.45)" strokeDasharray="4 4" />
                  <line x1="250" y1="250" x2="105" y2="165" stroke="rgba(94,234,212,0.45)" strokeDasharray="4 4" />
                </svg>

                {/* NODO CENTRAL: SITE ON CORE */}
                <div className="relative z-10 flex flex-col items-center justify-center w-36 h-36 rounded-full bg-[#0f2d42] border-2 border-[#5eead4] shadow-[0_0_55px_rgba(94,234,212,0.45)] text-center p-3">
                  <span className="text-sm font-extrabold tracking-wider text-white">
                    SITE ON
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#5eead4] mt-0.5">
                    Continuidad TI
                  </span>
                </div>

                {/* Nodo Superior: SOPORTE TI + Tarjeta 99.9% */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#133852] border-2 border-[#5eead4] text-[#5eead4] shadow-lg shadow-teal-400/30">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-50 mt-1.5">
                      SOPORTE TI
                    </span>
                  </div>
                  <div className="rounded-2xl border border-[#5eead4]/40 bg-[#102e44]/95 px-4 py-2.5 shadow-2xl">
                    <div className="text-xl font-display font-extrabold text-[#5eead4]">
                      99.9%+
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-teal-50">
                      • CONTINUIDAD OPERATIVA
                    </div>
                  </div>
                </div>

                {/* Nodo Derecha Superior: SERVIDORES & REDES */}
                <div className="absolute top-[24%] right-4 flex flex-col items-center">
                  <div className="flex h-13 w-13 p-3.5 items-center justify-center rounded-full bg-[#133852] border border-[#67e8f9]/60 text-[#67e8f9] shadow-lg">
                    <Server className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-50 mt-1.5">
                    SERVIDORES & REDES
                  </span>
                </div>

                {/* Nodo Derecha Inferior: CLOUD & M365 + Tarjeta Velocidad */}
                <div className="absolute bottom-[18%] right-2 flex flex-col items-end gap-2">
                  <div className="rounded-2xl border border-[#5eead4]/40 bg-[#102e44]/95 px-4 py-2.5 shadow-2xl">
                    <div className="text-lg font-display font-extrabold text-[#5eead4]">
                      &lt; 45 min
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-teal-50">
                      • RESPUESTA A URGENCIAS
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pr-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#133852] border border-[#67e8f9]/60 text-[#67e8f9]">
                      <Cloud className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-50">
                      CLOUD & M365
                    </span>
                  </div>
                </div>

                {/* Nodo Izquierda Inferior: AUTOMATIZACIÓN + Tarjeta Ahorro */}
                <div className="absolute bottom-[14%] left-2 flex flex-col items-start gap-2">
                  <div className="flex items-center gap-2 pl-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#133852] border border-[#5eead4] text-[#5eead4]">
                      <Zap className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-50">
                      AUTOMATIZACIÓN
                    </span>
                  </div>
                  <div className="rounded-2xl border border-[#5eead4]/40 bg-[#102e44]/95 px-4 py-2.5 shadow-2xl">
                    <div className="text-lg font-display font-extrabold text-[#5eead4]">
                      -45%
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-teal-50">
                      • REDUCCIÓN COSTOS TI
                    </div>
                  </div>
                </div>

                {/* Nodo Izquierda Superior: DESARROLLO WEB & SOFTWARE */}
                <div className="absolute top-[24%] left-4 flex flex-col items-center">
                  <div className="flex h-13 w-13 p-3.5 items-center justify-center rounded-full bg-[#133852] border border-[#67e8f9]/60 text-[#67e8f9] shadow-lg">
                    <Code2 className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-50 mt-1.5">
                    WEB & SOFTWARE
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 2. SERVICIOS PRINCIPALES (TARJETAS EN CALIPSO CLARO Y AZUL OCEÁNICO) ==================== */}
      <section id="servicios" className="py-24 border-b border-teal-300/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#5eead4]/40 bg-[#2dd4bf]/15 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-[#99f6e4]">
                Qué Hacemos por tu Empresa
              </span>
              <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white mt-3">
                Nuestros Servicios TI
              </h2>
              <p className="text-sm sm:text-base text-teal-50/85 mt-2 max-w-2xl">
                Nos enfocamos en lo que genera continuidad y retorno inmediato: soporte técnico
                rápido, redes empresariales, servidores seguros y plataformas web que venden.
              </p>
            </div>
            <Link
              href="/servicios"
              className="inline-flex items-center gap-2 rounded-full bg-[#99f6e4] hover:bg-white px-6 py-3 text-xs font-extrabold text-slate-950 transition-all self-start md:self-auto shadow-md"
            >
              <span>Ver los 10 servicios</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.slice(0, 6).map((srv, idx) => {
              const isHighlighted = idx === 0 || idx === 3;
              return (
                <Link
                  key={srv.slug}
                  href={`/servicios/${srv.slug}`}
                  className={`group relative flex flex-col justify-between rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1.5 ${
                    isHighlighted
                      ? 'bg-gradient-to-br from-[#2dd4bf] via-[#14b8a6] to-[#0891b2] text-slate-950 shadow-[0_20px_50px_rgba(45,212,191,0.35)] border border-[#99f6e4]/60'
                      : 'bg-[#123249]/90 hover:bg-[#173f5c] text-white border border-teal-300/25 hover:border-[#5eead4]/60 shadow-xl'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                          isHighlighted
                            ? 'bg-white text-[#0d9488] shadow-md'
                            : 'bg-[#1a4666] text-[#5eead4] border border-teal-300/30 group-hover:bg-[#5eead4] group-hover:text-slate-950'
                        }`}
                      >
                        <ServiceIcon name={srv.icon_name} className="h-5 w-5" />
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-extrabold ${
                          isHighlighted
                            ? 'bg-slate-950/15 text-slate-950'
                            : 'bg-[#0d2638] border border-teal-300/25 text-[#99f6e4]'
                        }`}
                      >
                        {srv.category}
                      </span>
                    </div>

                    <h3
                      className={`text-xl font-extrabold mb-3 leading-snug ${
                        isHighlighted ? 'text-slate-950' : 'text-white'
                      }`}
                    >
                      {srv.title}
                    </h3>

                    <p
                      className={`text-sm leading-relaxed mb-6 ${
                        isHighlighted ? 'text-slate-900 font-medium' : 'text-teal-50/85'
                      }`}
                    >
                      {srv.summary}
                    </p>
                  </div>

                  <div
                    className={`pt-4 border-t flex items-center justify-between text-xs font-extrabold ${
                      isHighlighted
                        ? 'border-slate-950/15 text-slate-950'
                        : 'border-teal-300/20 text-[#5eead4]'
                    }`}
                  >
                    <span>Ver detalles y solicitar cotización</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================== 3. SECCIÓN CLARA CON TARJETA CALIPSO DESTACADA ==================== */}
      <section id="planes-soporte" className="py-24 bg-[#f0fdfa] text-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block rounded-full bg-teal-100 border border-teal-300 px-4 py-1 text-xs font-extrabold uppercase tracking-wider text-teal-900">
              Continuidad Operativa Mensual
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-slate-950 mt-3">
              Planes de Soporte TI para Empresas
            </h2>
            <p className="text-base text-slate-600 mt-3">
              Explora nuestros planes mensuales diseñados para mantener tu oficina, computadores y
              servidores operando sin interrupciones, con diagnóstico inicial gratuito.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: 'Plan Profesional',
                uf: '1 UF / mes*',
                clp: '$39.934 CLP',
                desc: 'Ideal para profesionales independientes o trabajo remoto.',
                features: [
                  'Diagnóstico inicial gratis',
                  'Hasta 3 eventos mensuales',
                  'Asistencia remota rápida',
                  'Optimización y seguridad PC/Mac',
                ],
                featured: false,
              },
              {
                name: 'Plan Emprendedores',
                uf: '2 UF / mes*',
                clp: '$79.868 CLP',
                desc: 'Para oficinas y empresas que están comenzando a crecer.',
                features: [
                  'Diagnóstico inicial gratis',
                  'Soporte remoto y presencial',
                  'Mantención preventiva mensual',
                  'Configuración de correos y red',
                ],
                featured: false,
              },
              {
                name: 'Plan Negocios Pyme',
                uf: '3 UF / mes*',
                clp: '$119.802 CLP',
                desc: 'Cobertura completa para empresas que no pueden detener sus ventas.',
                features: [
                  'Diagnóstico de red y equipos gratis',
                  'Soporte prioritario On-Site y Remoto',
                  'Administración Wi-Fi y Microsoft 365',
                  'Monitoreo de respaldos y servidores',
                ],
                featured: true,
              },
              {
                name: 'Plan Corporativo Pro',
                uf: '4 UF / mes*',
                clp: '$159.736 CLP',
                desc: 'Para empresas con sucursales, servidores Windows/Linux o Cloud.',
                features: [
                  'SLA preferente ante urgencias',
                  'Administración de servidores y red',
                  'Seguridad avanzada y respaldos Cloud',
                  'Consultoría TI mensual para gerencia',
                ],
                featured: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-3xl p-7 flex flex-col justify-between transition-all ${
                  plan.featured
                    ? 'bg-gradient-to-b from-[#0f3852] to-[#0a2538] text-white shadow-[0_20px_50px_rgba(13,148,136,0.3)] scale-[1.02] border-2 border-[#5eead4]'
                    : 'bg-white border border-teal-200 text-slate-900 hover:border-[#2dd4bf] hover:shadow-xl'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span
                      className={`inline-block rounded-full px-3 py-0.5 text-[11px] font-bold ${
                        plan.featured
                          ? 'bg-[#5eead4]/20 text-[#99f6e4] border border-[#5eead4]/40'
                          : 'bg-teal-50 text-teal-800 border border-teal-200'
                      }`}
                    >
                      + Diagnóstico gratis
                    </span>
                    {plan.featured && (
                      <span className="inline-block rounded-full bg-[#5eead4] px-3 py-0.5 text-[11px] font-extrabold text-slate-950">
                        Más elegido
                      </span>
                    )}
                  </div>

                  <h3
                    className={`text-xl font-extrabold ${
                      plan.featured ? 'text-white' : 'text-slate-950'
                    }`}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className={`text-xs mt-1 mb-5 ${
                      plan.featured ? 'text-teal-100' : 'text-slate-600'
                    }`}
                  >
                    {plan.desc}
                  </p>

                  <div
                    className={`mb-5 pb-4 border-b ${
                      plan.featured ? 'border-white/15' : 'border-slate-200'
                    }`}
                  >
                    <div
                      className={`text-3xl font-display font-extrabold ${
                        plan.featured ? 'text-white' : 'text-slate-950'
                      }`}
                    >
                      {plan.clp}
                    </div>
                    <div
                      className={`text-xs font-bold mt-1 ${
                        plan.featured ? 'text-[#5eead4]' : 'text-[#0d9488]'
                      }`}
                    >
                      Equivalente a {plan.uf}
                    </div>
                  </div>

                  <ul className="space-y-2.5 text-xs mb-7">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <CheckCircle2
                          className={`h-4 w-4 shrink-0 mt-0.5 ${
                            plan.featured ? 'text-[#5eead4]' : 'text-[#0d9488]'
                          }`}
                        />
                        <span className={plan.featured ? 'text-slate-100' : 'text-slate-700'}>
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="#solicitar-asesoria"
                  className={`w-full rounded-full py-3.5 text-center text-xs font-extrabold transition-all ${
                    plan.featured
                      ? 'bg-[#5eead4] hover:bg-[#99f6e4] text-slate-950 shadow-lg'
                      : 'bg-[#0d9488] hover:bg-[#0f766e] text-white'
                  }`}
                >
                  Contratar este plan →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== 4. VENTAJAS COMPETITIVAS & VALORES ==================== */}
      <section className="py-24 bg-[#102d42]/80 backdrop-blur-sm border-b border-teal-300/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-5">
              <span className="inline-block rounded-full border border-[#5eead4]/40 bg-[#2dd4bf]/15 px-4 py-1 text-xs font-extrabold uppercase tracking-wider text-[#99f6e4]">
                Nuestros Pilares de Trabajo
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Construimos relaciones tecnológicas de largo plazo
              </h2>
              <p className="text-sm sm:text-base text-teal-50/90 leading-relaxed">
                En <strong className="text-white">Site On Tecnología</strong> nuestro compromiso es
                que tu infraestructura informática funcione con velocidad, seguridad y cero estrés
                para tu equipo humano.
              </p>
              <div className="pt-2">
                <Link
                  href="#solicitar-asesoria"
                  className="inline-flex items-center gap-2 rounded-full bg-[#5eead4] hover:bg-[#99f6e4] px-7 py-3.5 text-xs font-extrabold text-slate-950 transition-all shadow-lg"
                >
                  <span>Hablar con un especialista</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                {
                  title: 'Respuesta en Terreno y Remota',
                  desc: 'Asistencia inmediata en línea en todo Chile y visitas presenciales en Viña del Mar y V Región cuando el hardware o la red lo requieren.',
                },
                {
                  title: 'Calidad y Prevención',
                  desc: 'No solo apagamos incendios: auditamos y mantenemos tus equipos y servidores preventivamente para que no fallen en momentos clave.',
                },
                {
                  title: 'Claridad Comercial Total',
                  desc: 'Te explicamos cada diagnóstico sin jerga técnica innecesaria y con presupuestos 100% transparentes antes de intervenir.',
                },
                {
                  title: 'Soluciones Escalables',
                  desc: 'A medida que tu negocio crece, te apoyamos con servidores Cloud, desarrollo web comercial y automatización de procesos.',
                },
              ].map((val) => (
                <div
                  key={val.title}
                  className="rounded-3xl border border-teal-300/25 bg-[#153a54]/90 p-6 space-y-3 shadow-xl"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2dd4bf]/20 text-[#5eead4]">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{val.title}</h3>
                  <p className="text-xs sm:text-sm text-teal-50/85 leading-relaxed">
                    {val.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 5. FORMULARIO INTELIGENTE CONECTADO AL CRM ==================== */}
      <section id="solicitar-asesoria" className="py-24 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-6">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2dd4bf]/15 border border-[#5eead4]/40 px-4 py-1 text-xs font-extrabold text-[#99f6e4]">
                <Sparkles className="h-3.5 w-3.5" /> Atención Directa para tu Empresa
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Solicita hoy tu diagnóstico o cotización TI
              </h2>
              <p className="text-sm sm:text-base text-teal-50/90 leading-relaxed">
                Completa el formulario y tu solicitud ingresará de inmediato a nuestro CRM
                comercial para asignarte un especialista en menos de 24 horas hábiles.
              </p>

              <div className="space-y-3 pt-2">
                <div className="rounded-2xl border border-teal-300/25 bg-[#123249] p-4 flex items-center gap-3.5">
                  <MapPin className="h-5 w-5 text-[#5eead4] shrink-0" />
                  <span className="text-xs sm:text-sm text-white font-medium">
                    Viña del Mar, Región de Valparaíso • Cobertura a todo Chile
                  </span>
                </div>
                <div className="rounded-2xl border border-teal-300/25 bg-[#123249] p-4 flex items-center gap-3.5">
                  <MessageSquare className="h-5 w-5 text-emerald-400 shrink-0" />
                  <span className="text-xs sm:text-sm text-white font-medium">
                    WhatsApp Directo: {settings.whatsapp_display}
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <SmartLeadForm
                defaultServiceSlug="soporte-tecnico-servicios-ti"
                whatsappNumber={settings.whatsapp_number}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
