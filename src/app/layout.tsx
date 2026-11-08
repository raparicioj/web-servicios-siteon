import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { WhatsAppFloatingButton } from '@/components/whatsapp/WhatsAppFloatingButton';
import { NetworkGraphBackground } from '@/components/layout/NetworkGraphBackground';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.siteon.cl'),
  title: {
    default:
      'Site On Tecnología | Consultoría TI, Desarrollo Web, IA y Observabilidad en Chile',
    template: '%s | Site On Tecnología',
  },
  description:
    'Transformamos tecnología en soluciones que impulsan tu negocio. Consultoría TI, desarrollo de software y web, automatización con IA, observabilidad Dynatrace/Datadog, Cloud y soporte informático desde Viña del Mar hacia todo Chile.',
  keywords: [
    'Servicios TI Viña del Mar',
    'Consultoría informática Chile',
    'Desarrollo web Chile',
    'Automatización de procesos',
    'Desarrollo de software',
    'Servicios Cloud',
    'Consultoría tecnológica',
    'Observabilidad Dynatrace',
    'Soporte informático para empresas',
    'Site On Tecnología',
  ],
  authors: [{ name: 'Site On Tecnología — Rodrigo Aparicio', url: 'https://www.siteon.cl' }],
  creator: 'Site On Tecnología',
  publisher: 'Site On Tecnología',
  alternates: {
    canonical: 'https://www.siteon.cl',
  },
  openGraph: {
    type: 'website',
    locale: 'es_CL',
    url: 'https://www.siteon.cl',
    siteName: 'Site On Tecnología',
    title: 'Site On Tecnología | Ingeniería TI, Automatización IA, Cloud y Observabilidad',
    description:
      'Transformamos tecnología en soluciones que impulsan tu negocio. Aliado tecnológico para empresas en Viña del Mar, Región de Valparaíso y todo Chile.',
    images: [
      {
        url: '/SiteON.png',
        width: 1200,
        height: 630,
        alt: 'Site On Tecnología — Soluciones Tecnológicas en Chile',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Site On Tecnología | Consultoría TI, IA, Cloud y Desarrollo en Chile',
    description:
      'Transformamos tecnología en soluciones que impulsan tu negocio. Viña del Mar y todo Chile.',
    images: ['/SiteON.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/SiteON_transparent.png',
    apple: '/SiteON_transparent.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schemaOrgJsonLd = {
    '@context': 'https://schema.org',
    '@type': ['ProfessionalService', 'LocalBusiness'],
    name: 'Site On Tecnología',
    alternateName: 'SITEON Tecnología',
    url: 'https://www.siteon.cl',
    logo: 'https://www.siteon.cl/SiteON_transparent.png',
    image: 'https://www.siteon.cl/SiteON.png',
    description:
      'Empresa de ingeniería y consultoría tecnológica en Viña del Mar, Chile. Especialistas en Consultoría TI, Desarrollo de Software y Web, Automatización con IA, Observabilidad (Dynatrace, Datadog), Cloud, FinOps y Soporte Informático Empresarial.',
    slogan: 'Transformamos tecnología en soluciones que impulsan tu negocio',
    telephone: '+56958324650',
    email: 'contacto@siteon.cl',
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Viña del Mar',
      addressRegion: 'Región de Valparaíso',
      addressCountry: 'CL',
    },
    areaServed: [
      { '@type': 'City', name: 'Viña del Mar' },
      { '@type': 'AdministrativeArea', name: 'Región de Valparaíso' },
      { '@type': 'Country', name: 'Chile' },
    ],
    founder: {
      '@type': 'Person',
      name: 'Rodrigo Aparicio',
      jobTitle: 'Director de Tecnología',
    },
    sameAs: [
      'https://instagram.com/siteontecnologia',
      'https://www.facebook.com/profile.php?id=100086742518173',
    ],
  };

  return (
    <html lang="es-CL" className={`${inter.variable} ${spaceGrotesk.variable} dark`}>
      <body className="font-sans antialiased selection:bg-[#2dd4bf] selection:text-slate-950 min-h-screen flex flex-col bg-[#0d2638] text-slate-100 relative">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrgJsonLd) }}
        />
        <NetworkGraphBackground />
        <Navbar />
        <main className="flex-1 relative z-10">{children}</main>
        <div className="relative z-10">
          <Footer />
        </div>
        <WhatsAppFloatingButton />
      </body>
    </html>
  );
}

