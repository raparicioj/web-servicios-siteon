'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { INITIAL_SERVICES } from '@/data/siteon-catalog';

interface PublicWhatsAppConfig {
  whatsapp_number: string;
  whatsapp_tooltip: string;
  whatsapp_default_message: string;
}

export function WhatsAppFloatingButton({
  initialConfig,
}: {
  initialConfig?: PublicWhatsAppConfig;
}) {
  const pathname = usePathname() || '/';
  const [config, setConfig] = useState<PublicWhatsAppConfig>({
    whatsapp_number: initialConfig?.whatsapp_number || '56958324650',
    whatsapp_tooltip: initialConfig?.whatsapp_tooltip || '¿Hablamos de tu proyecto?',
    whatsapp_default_message:
      initialConfig?.whatsapp_default_message ||
      'Hola, llegué a Site On y quisiera recibir información sobre sus servicios tecnológicos.',
  });
  const [tooltipDismissed, setTooltipDismissed] = useState(false);

  useEffect(() => {
    fetch('/api/public-config')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.whatsapp_number) {
          setConfig({
            whatsapp_number: data.whatsapp_number,
            whatsapp_tooltip: data.whatsapp_tooltip || '¿Hablamos de tu proyecto?',
            whatsapp_default_message:
              data.whatsapp_default_message ||
              'Hola, llegué a Site On y quisiera recibir información sobre sus servicios tecnológicos.',
          });
        }
      })
      .catch(() => {});
  }, []);

  // Ocultar el botón flotante dentro del panel administrativo para no tapar el Kanban
  if (pathname.startsWith('/admin')) {
    return null;
  }

  // Determinar mensaje contextual según la ruta o servicio actual
  let contextualMessage = config.whatsapp_default_message;
  let currentServiceSlug: string | undefined;

  if (pathname.startsWith('/servicios/')) {
    const slug = pathname.replace('/servicios/', '').split('/')[0];
    currentServiceSlug = slug;
    const matchedService = INITIAL_SERVICES.find((s) => s.slug === slug);
    if (matchedService) {
      contextualMessage = matchedService.whatsapp_prompt;
    }
  } else if (pathname === '/servicios') {
    contextualMessage =
      'Hola Site On, estoy revisando su catálogo de servicios tecnológicos y quisiera solicitar una asesoría.';
  } else if (pathname.startsWith('/blog')) {
    contextualMessage =
      'Hola Site On, leí uno de sus artículos técnicos y me gustaría conversar sobre cómo aplicarlo en mi empresa.';
  } else if (pathname === '/nosotros') {
    contextualMessage =
      'Hola Site On, conocí su equipo en la web y quisiera conversar sobre un proyecto tecnológico.';
  } else if (pathname === '/contacto') {
    contextualMessage =
      'Hola Site On, estoy en la sección de contacto de su web y prefiero conversar directamente por WhatsApp sobre mi proyecto.';
  }

  const cleanPhone = config.whatsapp_number.replace(/\D/g, '') || '56958324650';
  const whatsappHref = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(contextualMessage)}`;

  const handleWhatsAppClick = () => {
    const params =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search)
        : new URLSearchParams();

    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'whatsapp_click',
        page_path: pathname,
        service_slug: currentServiceSlug,
        utm_source: params.get('utm_source') || undefined,
        utm_medium: params.get('utm_medium') || undefined,
        utm_campaign: params.get('utm_campaign') || undefined,
        metadata: {
          contextual_message: contextualMessage,
          source: 'floating_widget',
        },
      }),
      keepalive: true,
    }).catch(() => {});
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 group">
      {/* Tooltip elegante */}
      {!tooltipDismissed && (
        <div className="hidden sm:flex items-center gap-2.5 pl-4 pr-2.5 py-2 rounded-full bg-slate-900/95 dark:bg-slate-900/95 text-slate-100 border border-slate-700/70 shadow-2xl backdrop-blur-md transition-all duration-300 group-hover:border-emerald-500/50 group-hover:-translate-x-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWhatsAppClick}
            className="text-xs font-medium tracking-wide text-slate-100 hover:text-white whitespace-nowrap"
          >
            {config.whatsapp_tooltip}
          </a>
          <button
            type="button"
            onClick={() => setTooltipDismissed(true)}
            aria-label="Cerrar sugerencia de WhatsApp"
            className="text-slate-400 hover:text-slate-200 text-xs px-1"
          >
            ×
          </button>
        </div>
      )}

      {/* Botón principal de WhatsApp con diseño SaaS Premium */}
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleWhatsAppClick}
        aria-label="Hablar por WhatsApp con Site On Tecnología"
        className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-[0_8px_30px_rgba(16,185,129,0.4)] border border-emerald-400/30 transition-all duration-300 hover:scale-105 hover:shadow-[0_12px_36px_rgba(16,185,129,0.6)] active:scale-95"
      >
        <span className="absolute -inset-1 rounded-2xl bg-emerald-500/20 blur-md opacity-75 group-hover:opacity-100 transition-opacity" />
        <svg
          className="relative w-7 h-7 fill-current"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M12.031 2c-5.516 0-9.969 4.453-9.969 9.969 0 1.758.459 3.469 1.328 4.984L2 22l5.188-1.359c1.469.805 3.125 1.234 4.843 1.234 5.516 0 9.969-4.453 9.969-9.969S17.547 2 12.031 2zm5.828 14.141c-.242.688-1.406 1.313-1.953 1.398-.5.078-1.148.109-1.852-.117-.43-.141-.984-.328-1.695-.633-2.984-1.289-4.93-4.297-5.078-4.492-.148-.195-1.211-1.609-1.211-3.07 0-1.461.766-2.18 1.039-2.477.273-.297.594-.375.797-.375.195 0 .398.008.57.016.18.008.422-.07.664.508.242.586.828 2.016.898 2.164.07.148.117.32.023.516-.094.195-.141.32-.289.492-.148.172-.313.383-.445.516-.148.148-.305.313-.133.609.172.297.766 1.266 1.648 2.047 1.133 1.008 2.086 1.32 2.383 1.469.297.148.469.125.641-.078.172-.195.742-.867.938-1.164.195-.297.398-.242.664-.148.273.094 1.719.813 2.016.961.297.148.492.219.563.344.07.125.07.719-.172 1.406z" />
        </svg>
      </a>
    </div>
  );
}

