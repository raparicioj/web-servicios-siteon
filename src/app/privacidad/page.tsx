import React from 'react';
import type { Metadata } from 'next';
import { Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Política de Privacidad y Protección de Datos (Ley 19.628 y Ley 21.719)',
  description:
    'Política de privacidad, consentimiento informado y tratamiento seguro de datos personales de Site On Tecnología conforme a la legislación chilena.',
  alternates: {
    canonical: 'https://www.siteon.cl/privacidad',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="pt-32 pb-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 sm:p-12 space-y-6 text-slate-300 text-sm leading-relaxed">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1 text-xs font-semibold text-emerald-300">
            <Shield className="h-3.5 w-3.5" /> Cumplimiento Normativo República de Chile
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
            Política de Privacidad y Tratamiento de Datos Personales
          </h1>

          <p className="text-xs text-slate-400">
            Última actualización: Noviembre 2026 • Aplicable a https://www.siteon.cl
          </p>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">1. Responsable del Tratamiento</h2>
            <p>
              <strong>Site On Tecnología</strong>, con domicilio comercial en Viña del Mar, Región de
              Valparaíso, Chile, y correo electrónico de contacto{' '}
              <a href="mailto:contacto@siteon.cl" className="text-brand-400 underline">
                contacto@siteon.cl
              </a>
              , es responsable del tratamiento de los datos personales recolectados a través de sus
              formularios web y canales digitales, en estricto cumplimiento de la{' '}
              <strong>Ley N° 19.628 sobre Protección de la Vida Privada</strong> y los estándares
              establecidos por la nueva <strong>Ley N° 21.719 sobre Protección de Datos Personales</strong>.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">
              2. Datos Recolectados y Principio de Minimización
            </h2>
            <p>
              Recolectamos exclusivamente los datos estrictamente necesarios para atender solicitudes
              comerciales, cotizaciones y diagnósticos técnicos:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Nombre completo y empresa u organización (opcional).</li>
              <li>Correo electrónico y teléfono / WhatsApp de contacto.</li>
              <li>Servicio de interés, rango presupuestario referencial y descripción del requerimiento.</li>
              <li>Parámetros técnicos de origen de campaña (UTM) con fines estadísticos de atribución.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">3. Finalidad y Base de Licitud</h2>
            <p>
              La base legal del tratamiento es el <strong>consentimiento libre, informado y expreso</strong>{' '}
              otorgado por el titular al marcar la casilla de aceptación en nuestros formularios, así
              como la ejecución de medidas precontractuales a solicitud del interesado (preparación de
              propuestas técnicas y cotizaciones).
            </p>
            <p>
              Site On Tecnología <strong>nunca vende, arrienda ni cede datos personales a terceros</strong>{' '}
              con fines publicitarios ni envía comunicaciones masivas no solicitadas (spam).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">
              4. Seguridad de la Información y Almacenamiento
            </h2>
            <p>
              Los datos se almacenan en bases de datos PostgreSQL en la nube (Supabase) protegidas con
              cifrado en tránsito (TLS 1.3), cifrado en reposo (AES-256), control de acceso basado en
              roles, políticas Row Level Security (RLS) y registro de auditoría administrativa.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">
              5. Derechos de los Titulares (Acceso, Rectificación, Supresión, Oposición y Portabilidad)
            </h2>
            <p>
              El titular de los datos puede ejercer en cualquier momento sus derechos de acceso,
              rectificación, cancelación/supresión, oposición y portabilidad enviando una solicitud a{' '}
              <a href="mailto:contacto@siteon.cl" className="text-brand-400 underline">
                contacto@siteon.cl
              </a>{' '}
              con el asunto &ldquo;Derechos Protección de Datos&rdquo;. Su solicitud será atendida sin
              costo dentro de los plazos legales vigentes.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

