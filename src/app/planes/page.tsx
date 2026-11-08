import React from 'react';
import { Metadata } from 'next';
import { getPlatformSettings, getPricingConfig } from '@/lib/supabase/crm-store';
import { convertUfToClp } from '@/data/siteon-catalog';
import { SmartPricingAndQuoterSection } from '@/components/pricing/SmartPricingAndQuoterSection';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title:
    'Planes de Soporte TI Mensual, Precios en UF y Cotizador Inteligente | Site On Tecnología Chile',
  description:
    'Compara nuestros planes de Soporte Informático para empresas (Start, Business, Business Pro y Enterprise), simula tu presupuesto en UF y CLP con nuestro Cotizador Inteligente y solicita tu diagnóstico gratuito en Viña del Mar y Chile.',
  keywords: [
    'Servicios TI Viña del Mar',
    'Soporte informático para empresas',
    'Soporte TI mensual Chile',
    'Administración de sistemas',
    'Servicios Cloud',
    'Consultoría tecnológica',
    'Precios soporte TI UF Chile',
    'Cotizador soporte informático empresas',
  ],
  alternates: {
    canonical: 'https://www.siteon.cl/planes',
  },
  openGraph: {
    title: 'Planes de Soporte TI y Cotizador Inteligente | Site On Tecnología',
    description:
      'Calcula el plan de soporte e infraestructura TI ideal para tu empresa en UF y pesos chilenos. Diagnóstico técnico inicial gratuito.',
    url: 'https://www.siteon.cl/planes',
    siteName: 'Site On Tecnología',
    locale: 'es_CL',
    type: 'website',
  },
};

export default async function PlanesPage() {
  const [pricingConfig, settings] = await Promise.all([
    getPricingConfig(),
    getPlatformSettings(),
  ]);

  const activePlans = (pricingConfig.plans || []).filter((p) => p.active);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Planes Mensuales de Soporte TI e Infraestructura Tecnológica para Empresas',
    provider: {
      '@type': 'LocalBusiness',
      name: settings.company_name || 'Site On Tecnología',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Viña del Mar',
        addressRegion: 'Valparaíso',
        addressCountry: 'CL',
      },
      telephone: `+${settings.whatsapp_number}`,
      url: 'https://www.siteon.cl',
    },
    areaServed: ['Viña del Mar', 'Valparaíso', 'Concón', 'Quilpué', 'Santiago', 'Chile'],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Planes de Continuidad Operativa y Soporte TI Site On',
      itemListElement: activePlans.map((plan) => ({
        '@type': 'Offer',
        name: plan.name,
        description: `${plan.tagline} Cobertura hasta ${plan.max_users} usuarios (${plan.price_uf} UF/mes + IVA).`,
        priceCurrency: 'CLP',
        price: convertUfToClp(plan.price_uf, pricingConfig.uf_value_clp || 41290),
        url: 'https://www.siteon.cl/planes',
      })),
    },
  };

  return (
    <div className="pt-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <SmartPricingAndQuoterSection
        pricingConfig={pricingConfig}
        settings={settings}
        standalonePage={true}
      />
    </div>
  );
}

