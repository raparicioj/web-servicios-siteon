'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Lock,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { INITIAL_SERVICES } from '@/data/siteon-catalog';

interface SmartLeadFormProps {
  defaultServiceSlug?: string;
  compact?: boolean;
  whatsappNumber?: string;
}

export function SmartLeadForm({
  defaultServiceSlug = 'soporte-tecnico-servicios-ti',
  compact = false,
  whatsappNumber = '56958324650',
}: SmartLeadFormProps) {
  const pathname = usePathname() || '/';
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceSlug, setServiceSlug] = useState(defaultServiceSlug);
  const [companySize, setCompanySize] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [description, setDescription] = useState('');
  const [referralSource, setReferralSource] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(true);
  const [honeypot, setHoneypot] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const params =
        typeof window !== 'undefined'
          ? new URLSearchParams(window.location.search)
          : new URLSearchParams();

      const selectedService = INITIAL_SERVICES.find((s) => s.slug === serviceSlug);

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          company,
          email,
          phone,
          service_slug: serviceSlug,
          service_name: selectedService?.title || 'Consultoría y Soluciones TI',
          company_size: companySize,
          budget_range: budgetRange,
          description,
          referral_source: referralSource,
          privacy_accepted: privacyAccepted,
          website_url: honeypot,
          source_page: pathname,
          utm_source: params.get('utm_source'),
          utm_medium: params.get('utm_medium'),
          utm_campaign: params.get('utm_campaign'),
          utm_term: params.get('utm_term'),
          utm_content: params.get('utm_content'),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(
          data.error || 'No pudimos procesar tu solicitud. Revisa los campos e intenta de nuevo.'
        );
        setSubmitting(false);
        return;
      }

      setSubmittedCode(data.lead_code || 'SO-2026-OK');
      setSubmitting(false);
    } catch {
      setErrorMsg(
        'Error de conexión al enviar tu solicitud. Por favor intenta nuevamente o escríbenos por WhatsApp.'
      );
      setSubmitting(false);
    }
  };

  if (submittedCode) {
    const cleanPhone = whatsappNumber.replace(/\D/g, '') || '56958324650';
    const selectedService = INITIAL_SERVICES.find((s) => s.slug === serviceSlug);
    const waText = `Hola Site On, acabo de enviar una solicitud en la web (Código *${submittedCode}*) por *${
      selectedService?.short_title || 'Servicios TI'
    }*. Mi nombre es ${fullName}.`;
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waText)}`;

    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-slate-900/90 p-8 text-center shadow-2xl backdrop-blur-xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/20 mb-3">
          Solicitud Registrada • Folio {submittedCode}
        </span>
        <h3 className="text-2xl font-bold text-white mb-2">
          ¡Recibimos tu requerimiento, {fullName.split(' ')[0]}!
        </h3>
        <p className="text-sm text-slate-300 max-w-md mx-auto mb-6 leading-relaxed">
          Tu solicitud ya fue ingresada en nuestro sistema comercial y asignada a un especialista de{' '}
          <strong className="text-white">Site On Tecnología</strong>. Te contactaremos en menos de 24 horas hábiles.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition-all shadow-lg shadow-emerald-600/25 w-full sm:w-auto"
          >
            <MessageSquare className="h-4 w-4" />
            Agilizar atención por WhatsApp ahora
          </a>
          <button
            type="button"
            onClick={() => {
              setSubmittedCode(null);
              setDescription('');
            }}
            className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800/70 hover:bg-slate-800 px-4 py-3 text-sm font-medium text-slate-300 transition-colors w-full sm:w-auto"
          >
            Enviar otra consulta
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="surface-card relative rounded-3xl border border-teal-300/35 bg-[#123249]/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl"
    >
      {/* Honeypot invisible para bots */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website_url">No completar este campo</label>
        <input
          id="website_url"
          name="website_url"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-400">
            <Sparkles className="h-3.5 w-3.5" /> Diagnóstico & Cotización Directa
          </span>
          <h3 className="text-xl font-bold text-white mt-1">
            Cuéntanos sobre tu proyecto o desafío TI
          </h3>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Respuesta &lt; 24h
        </span>
      </div>

      {errorMsg && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-200">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="lead-fullname"
            className="block text-xs font-medium text-slate-300 mb-1.5"
          >
            Nombre completo <span className="text-brand-400">*</span>
          </label>
          <input
            id="lead-fullname"
            type="text"
            required
            placeholder="Ej: Rodrigo González"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div>
          <label
            htmlFor="lead-company"
            className="block text-xs font-medium text-slate-300 mb-1.5"
          >
            Empresa u organización <span className="text-slate-500">(opcional)</span>
          </label>
          <input
            id="lead-company"
            type="text"
            placeholder="Ej: Constructora Pacífico SpA"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div>
          <label
            htmlFor="lead-email"
            className="block text-xs font-medium text-slate-300 mb-1.5"
          >
            Correo electrónico <span className="text-brand-400">*</span>
          </label>
          <input
            id="lead-email"
            type="email"
            required
            placeholder="nombre@tuempresa.cl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div>
          <label
            htmlFor="lead-phone"
            className="block text-xs font-medium text-slate-300 mb-1.5"
          >
            Teléfono / WhatsApp <span className="text-brand-400">*</span>
          </label>
          <input
            id="lead-phone"
            type="tel"
            required
            placeholder="+56 9 1234 5678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="sm:col-span-2">
          <label
            htmlFor="lead-service"
            className="block text-xs font-medium text-slate-300 mb-1.5"
          >
            Servicio principal de interés <span className="text-brand-400">*</span>
          </label>
          <select
            id="lead-service"
            value={serviceSlug}
            onChange={(e) => setServiceSlug(e.target.value)}
            className="w-full rounded-xl border border-slate-700/80 bg-slate-950/90 px-3.5 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            {INITIAL_SERVICES.map((srv) => (
              <option key={srv.slug} value={srv.slug} className="bg-slate-900 text-white">
                {srv.title}
              </option>
            ))}
          </select>
        </div>

        {!compact && (
          <>
            <div>
              <label
                htmlFor="lead-size"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Tamaño de empresa <span className="text-slate-500">(opcional)</span>
              </label>
              <select
                id="lead-size"
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                className="w-full rounded-xl border border-slate-700/80 bg-slate-950/90 px-3.5 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
              >
                <option value="" className="bg-slate-900">
                  Seleccionar tamaño...
                </option>
                <option value="Profesional / Independiente" className="bg-slate-900">
                  Profesional / Independiente
                </option>
                <option value="Pyme (2 a 15 personas)" className="bg-slate-900">
                  Pyme (2 a 15 personas)
                </option>
                <option value="Mediana empresa (16 a 80 personas)" className="bg-slate-900">
                  Mediana empresa (16 a 80 personas)
                </option>
                <option value="Gran empresa (+80 personas)" className="bg-slate-900">
                  Gran empresa (+80 personas)
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor="lead-budget"
                className="block text-xs font-medium text-slate-300 mb-1.5"
              >
                Presupuesto estimado <span className="text-slate-500">(opcional)</span>
              </label>
              <select
                id="lead-budget"
                value={budgetRange}
                onChange={(e) => setBudgetRange(e.target.value)}
                className="w-full rounded-xl border border-slate-700/80 bg-slate-950/90 px-3.5 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
              >
                <option value="" className="bg-slate-900">
                  Seleccionar rango...
                </option>
                <option value="Por evaluar con asesor" className="bg-slate-900">
                  Por evaluar con asesor
                </option>
                <option value="< $500.000 CLP" className="bg-slate-900">
                  Menos de $500.000 CLP
                </option>
                <option value="$500.000 - $1.500.000 CLP" className="bg-slate-900">
                  $500.000 - $1.500.000 CLP
                </option>
                <option value="$1.500.000 - $4.000.000 CLP" className="bg-slate-900">
                  $1.500.000 - $4.000.000 CLP
                </option>
                <option value="> $4.000.000 CLP" className="bg-slate-900">
                  Más de $4.000.000 CLP
                </option>
              </select>
            </div>
          </>
        )}

        <div className="sm:col-span-2">
          <label
            htmlFor="lead-description"
            className="block text-xs font-medium text-slate-300 mb-1.5"
          >
            Descripción de tu necesidad o proyecto <span className="text-brand-400">*</span>
          </label>
          <textarea
            id="lead-description"
            required
            rows={compact ? 3 : 4}
            placeholder="Cuéntanos qué problema buscas resolver, plazos estimados o qué resultado esperas lograr..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-slate-700/80 bg-slate-950/80 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        {!compact && (
          <div className="sm:col-span-2">
            <label
              htmlFor="lead-referral"
              className="block text-xs font-medium text-slate-300 mb-1.5"
            >
              ¿Cómo conociste a Site On Tecnología? <span className="text-slate-500">(opcional)</span>
            </label>
            <select
              id="lead-referral"
              value={referralSource}
              onChange={(e) => setReferralSource(e.target.value)}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-950/90 px-3.5 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"
            >
              <option value="" className="bg-slate-900">
                Seleccionar medio...
              </option>
              <option value="Búsqueda en Google" className="bg-slate-900">
                Búsqueda en Google
              </option>
              <option value="Recomendación de un cliente / colega" className="bg-slate-900">
                Recomendación de un cliente / colega
              </option>
              <option value="LinkedIn" className="bg-slate-900">
                LinkedIn
              </option>
              <option value="Instagram / Redes Sociales" className="bg-slate-900">
                Instagram / Redes Sociales
              </option>
              <option value="Contacto directo en Viña del Mar / V Región" className="bg-slate-900">
                Contacto directo en Viña del Mar / V Región
              </option>
            </select>
          </div>
        )}
      </div>

      {/* Consentimiento informado Ley 19.628 y Ley 21.719 */}
      <div className="mt-4 flex items-start gap-2.5">
        <input
          id="lead-privacy"
          type="checkbox"
          required
          checked={privacyAccepted}
          onChange={(e) => setPrivacyAccepted(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-950 text-brand-600 focus:ring-brand-500"
        />
        <label htmlFor="lead-privacy" className="text-xs text-slate-400 leading-relaxed">
          Acepto la{' '}
          <Link
            href="/privacidad"
            className="text-brand-400 hover:text-brand-300 underline underline-offset-2"
          >
            Política de Privacidad y Protección de Datos
          </Link>{' '}
          (Ley N° 19.628 y Ley N° 21.719 de Chile) para que Site On Tecnología me contacte respecto a mi solicitud comercial.
        </label>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 px-6 py-4 text-sm font-extrabold text-slate-950 shadow-lg shadow-cyan-400/30 transition-all disabled:opacity-60 hover:scale-[1.01]"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Procesando y asignando especialista...
          </>
        ) : (
          <>
            Solicitar diagnóstico y propuesta ahora
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>

      <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
        <Lock className="h-3 w-3 text-emerald-400" />
        <span>Datos cifrados y confidenciales • Cero spam garantizado</span>
      </div>
    </form>
  );
}

