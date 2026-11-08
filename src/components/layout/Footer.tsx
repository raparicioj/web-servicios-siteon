'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, MapPin, Phone, Shield } from 'lucide-react';
import { INITIAL_SERVICES } from '@/data/siteon-catalog';
import { SiteOnLogo } from '@/components/layout/SiteOnLogo';

export function Footer() {
  const pathname = usePathname() || '/';
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="border-t border-teal-300/20 bg-[#0a1e2e]/90 backdrop-blur-md text-teal-100/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Columna 1: Identidad Site On con Logo Vectorial */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-block">
              <SiteOnLogo size="md" showSubtitle />
            </Link>
            <p className="text-sm text-white font-semibold leading-relaxed">
              &ldquo;Transformamos tecnología en soluciones que impulsan tu negocio.&rdquo;
            </p>
            <p className="text-xs text-teal-100/75 leading-relaxed">
              Soporte TI e infraestructura para empresas, redes Wi-Fi corporativas, servidores
              Windows y Linux, Cloud Microsoft 365, desarrollo web comercial y automatización de
              procesos desde Viña del Mar hacia todo Chile.
            </p>
            <div className="space-y-2 pt-2 text-xs text-teal-50">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#5eead4] shrink-0" />
                <span>Viña del Mar, Región de Valparaíso, Chile</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#5eead4] shrink-0" />
                <a href="mailto:contacto@siteon.cl" className="hover:text-white">
                  contacto@siteon.cl
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-emerald-400 shrink-0" />
                <a
                  href="https://wa.me/56958324650"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white"
                >
                  +56 9 5832 4650
                </a>
              </div>
            </div>
          </div>

          {/* Columna 2: Servicios Principales */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#5eead4] mb-3">
                Soporte TI, Redes & Servidores
              </h4>
              <ul className="space-y-2 text-xs">
                {INITIAL_SERVICES.slice(0, 5).map((srv) => (
                  <li key={srv.slug}>
                    <Link
                      href={`/servicios/${srv.slug}`}
                      className="text-teal-100/75 hover:text-[#5eead4] transition-colors"
                    >
                      {srv.short_title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#5eead4] mb-3">
                Web, Automatización & Cloud
              </h4>
              <ul className="space-y-2 text-xs">
                {INITIAL_SERVICES.slice(5, 10).map((srv) => (
                  <li key={srv.slug}>
                    <Link
                      href={`/servicios/${srv.slug}`}
                      className="text-teal-100/75 hover:text-[#5eead4] transition-colors"
                    >
                      {srv.short_title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Columna 3: Empresa y Legal (Sin botón CRM público) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#5eead4] mb-3">
              Empresa & Enlaces
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/nosotros" className="hover:text-white transition-colors">
                  Sobre Site On Tecnología
                </Link>
              </li>
              <li>
                <Link href="/servicios" className="hover:text-white transition-colors">
                  Catálogo de Servicios
                </Link>
              </li>
              <li>
                <Link href="/#planes-soporte" className="hover:text-white transition-colors">
                  Planes Mensuales de Soporte TI
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">
                  Blog Técnico & Recursos SEO
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="hover:text-white transition-colors">
                  Solicitar Diagnóstico / Cotización
                </Link>
              </li>
              <li className="pt-1">
                <Link
                  href="/privacidad"
                  className="inline-flex items-center gap-1.5 text-teal-100 hover:text-[#5eead4] transition-colors"
                >
                  <Shield className="h-3.5 w-3.5 text-emerald-400" />
                  Política de Privacidad (Ley 21.719)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-teal-300/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-teal-200/60">
          <p>
            © {new Date().getFullYear()} Site On Tecnología SpA. Todos los derechos reservados.
            Viña del Mar, Chile.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com/siteontecnologia"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white"
            >
              Instagram
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=100086742518173"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white"
            >
              Facebook
            </a>
            <Link href="/sitemap.xml" className="hover:text-white">
              Sitemap XML
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
