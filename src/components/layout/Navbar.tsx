'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowUpRight,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import { INITIAL_SERVICES } from '@/data/siteon-catalog';
import { ServiceIcon } from '@/components/services/ServiceIcon';
import { SiteOnLogo } from '@/components/layout/SiteOnLogo';

export function Navbar() {
  const pathname = usePathname() || '/';
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setServicesOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0d2638]/95 backdrop-blur-xl border-b border-teal-400/25 py-3 shadow-2xl'
          : 'bg-[#0d2638]/85 backdrop-blur-md border-b border-teal-300/15 py-4'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo Vectorial Oficial Site On */}
          <Link href="/" className="focus:outline-none">
            <SiteOnLogo size="md" showSubtitle />
          </Link>

          {/* Navegación Central Limpia en tono Calipso */}
          <nav className="hidden lg:flex items-center gap-1 rounded-full border border-teal-400/25 bg-[#123249]/95 px-2.5 py-1.5 shadow-inner">
            <Link
              href="/"
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                pathname === '/'
                  ? 'bg-[#2dd4bf] text-slate-950 shadow-sm'
                  : 'text-slate-100 hover:text-white hover:bg-white/10'
              }`}
            >
              Inicio
            </Link>

            {/* Dropdown de Servicios 100% SÓLIDO en Calipso Profundo */}
            <div
              className="relative"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <button
                type="button"
                onClick={() => setServicesOpen((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  pathname.startsWith('/servicios')
                    ? 'bg-[#2dd4bf] text-slate-950 shadow-sm'
                    : 'text-slate-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>Servicios</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${
                    servicesOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {servicesOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 w-[680px] z-[100]">
                  <div
                    style={{ backgroundColor: '#0f2d42' }}
                    className="rounded-3xl border-2 border-teal-400/40 p-6 shadow-[0_30px_90px_rgba(4,15,25,0.96)]"
                  >
                    <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-teal-400/20 px-1">
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-wider text-[#5eead4]">
                          Catálogo de Servicios Site On
                        </p>
                        <p className="text-xs text-teal-100/80">
                          Soporte TI Empresarial, Infraestructura, Redes, Servidores y Desarrollo Web
                        </p>
                      </div>
                      <Link
                        href="/servicios"
                        onClick={() => setServicesOpen(false)}
                        className="inline-flex items-center gap-1 rounded-full bg-[#2dd4bf] hover:bg-[#5eead4] px-3.5 py-1.5 text-xs font-extrabold text-slate-950 transition-colors"
                      >
                        Ver todos los servicios <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      {INITIAL_SERVICES.map((srv) => (
                        <Link
                          key={srv.slug}
                          href={`/servicios/${srv.slug}`}
                          onClick={() => setServicesOpen(false)}
                          style={{ backgroundColor: '#153a54' }}
                          className="flex items-start gap-3 rounded-2xl p-2.5 hover:bg-[#1c4b6b] border border-teal-300/20 hover:border-[#5eead4]/60 transition-all group"
                        >
                          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#2dd4bf]/20 text-[#5eead4] group-hover:bg-[#2dd4bf] group-hover:text-slate-950 transition-colors">
                            <ServiceIcon name={srv.icon_name} className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white group-hover:text-[#5eead4]">
                              {srv.short_title}
                            </div>
                            <div className="text-[11px] text-teal-100/75 line-clamp-1">
                              {srv.tagline}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/#planes-soporte"
              className="px-4 py-1.5 rounded-full text-xs font-bold text-slate-100 hover:text-white hover:bg-white/10 transition-all"
            >
              Planes Soporte
            </Link>

            <Link
              href="/nosotros"
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                pathname === '/nosotros'
                  ? 'bg-[#2dd4bf] text-slate-950 shadow-sm'
                  : 'text-slate-100 hover:text-white hover:bg-white/10'
              }`}
            >
              Nosotros
            </Link>

            <Link
              href="/blog"
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                pathname.startsWith('/blog')
                  ? 'bg-[#2dd4bf] text-slate-950 shadow-sm'
                  : 'text-slate-100 hover:text-white hover:bg-white/10'
              }`}
            >
              Blog
            </Link>

            <Link
              href="/contacto"
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                pathname === '/contacto'
                  ? 'bg-[#2dd4bf] text-slate-950 shadow-sm'
                  : 'text-slate-100 hover:text-white hover:bg-white/10'
              }`}
            >
              Contacto
            </Link>
          </nav>

          {/* Acción Derecha (Sin botón CRM público; acceso solo por URL /admin/crm) */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/contacto"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#5eead4] hover:bg-[#99f6e4] px-5 py-2.5 text-xs font-extrabold text-slate-950 shadow-lg shadow-teal-400/25 transition-all hover:scale-[1.02]"
            >
              <span>Solicitar Asesoría</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Botón Menú Móvil */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Abrir menú de navegación"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-teal-400/35 bg-[#123249] text-white"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú Móvil Desplegable (Sin botón CRM público) */}
      {mobileOpen && (
        <div
          style={{ backgroundColor: '#0f2d42' }}
          className="lg:hidden border-b border-teal-400/30 px-4 pt-3 pb-6 shadow-2xl"
        >
          <div className="flex flex-col space-y-1">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-3 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              Inicio
            </Link>
            <Link
              href="/servicios"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-3 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              Servicios TI & Infraestructura
            </Link>
            <Link
              href="/#planes-soporte"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-3 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              Planes Soporte Mensual
            </Link>
            <Link
              href="/nosotros"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-3 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              Nosotros
            </Link>
            <Link
              href="/blog"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-3 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              Blog
            </Link>
            <Link
              href="/contacto"
              onClick={() => setMobileOpen(false)}
              className="rounded-xl px-3 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              Contacto
            </Link>
            <div className="pt-3 mt-2 border-t border-teal-400/20 flex flex-col gap-2">
              <Link
                href="/contacto"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 rounded-full bg-[#5eead4] py-3 text-xs font-extrabold text-slate-950"
              >
                <span>Solicitar Asesoría</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
