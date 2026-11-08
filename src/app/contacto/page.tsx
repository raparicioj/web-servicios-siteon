import React from 'react';
import type { Metadata } from 'next';
import { Clock, Mail, MapPin, MessageSquare } from 'lucide-react';
import { getPlatformSettings } from '@/lib/supabase/crm-store';
import { SmartLeadForm } from '@/components/forms/SmartLeadForm';

export const metadata: Metadata = {
  title: 'Contacto y Solicitud de Cotización TI | Site On Tecnología',
  description:
    'Contáctanos para solicitar soporte TI, redes, servidores, desarrollo web o automatización en Viña del Mar y todo Chile.',
  alternates: {
    canonical: 'https://www.siteon.cl/contacto',
  },
};

export const dynamic = 'force-dynamic';

export default async function ContactPage() {
  const settings = await getPlatformSettings();
  const cleanPhone = settings.whatsapp_number.replace(/\D/g, '') || '56958324650';
  const waHref = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    'Hola Site On, estoy en su página de contacto y quisiera conversar sobre un requerimiento tecnológico.'
  )}`;

  return (
    <div className="pt-32 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 space-y-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2dd4bf]/15 border border-[#5eead4]/40 px-3.5 py-1 text-xs font-extrabold text-[#99f6e4]">
              Contacto Comercial & Técnico
            </span>
            <h1 className="font-display text-4xl font-extrabold text-white leading-tight">
              Hablemos hoy sobre cómo potenciar tu empresa
            </h1>
            <p className="text-sm sm:text-base text-teal-50/90 leading-relaxed">
              Completa el formulario inteligente a la derecha para registrar tu requerimiento en
              nuestro sistema comercial o escríbenos por nuestros canales directos.
            </p>

            <div className="space-y-4 pt-2">
              <div className="rounded-2xl border border-teal-300/25 bg-[#123249]/85 backdrop-blur-md p-5 flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">WhatsApp Comercial Directo</h3>
                  <p className="text-xs text-teal-100/80 mt-0.5 mb-2">
                    Ideal para consultas rápidas, coordinación de reuniones o urgencias de soporte.
                  </p>
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#5eead4] hover:text-[#99f6e4]"
                  >
                    Escribir al {settings.whatsapp_display} →
                  </a>
                </div>
              </div>

              <div className="rounded-2xl border border-teal-300/25 bg-[#123249]/85 backdrop-blur-md p-5 flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2dd4bf]/20 text-[#5eead4]">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Correo Corporativo</h3>
                  <p className="text-xs text-teal-100/80 mt-0.5 mb-1">
                    Para envío de cotizaciones formales, licitaciones o antecedentes técnicos.
                  </p>
                  <a
                    href={`mailto:${settings.contact_email}`}
                    className="text-xs font-extrabold text-[#5eead4] hover:text-[#99f6e4]"
                  >
                    {settings.contact_email}
                  </a>
                </div>
              </div>

              <div className="rounded-2xl border border-teal-300/25 bg-[#123249]/85 backdrop-blur-md p-5 flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2dd4bf]/20 text-[#5eead4]">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Ubicación y Cobertura</h3>
                  <p className="text-xs text-teal-100/80 mt-0.5">
                    {settings.city}, {settings.region}, {settings.country}. Atención presencial en V
                    Región y RM, y cobertura remota a todo Chile.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-teal-300/25 bg-[#123249]/85 backdrop-blur-md p-5 flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Tiempo de Respuesta</h3>
                  <p className="text-xs text-teal-100/80 mt-0.5">
                    Respondemos todas las solicitudes comerciales en menos de 24 horas hábiles
                    (urgencias en el mismo día).
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <SmartLeadForm whatsappNumber={settings.whatsapp_number} />
          </div>
        </div>
      </div>
    </div>
  );
}
