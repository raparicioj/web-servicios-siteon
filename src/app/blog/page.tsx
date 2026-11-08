import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, Clock } from 'lucide-react';
import { listBlogPosts } from '@/lib/supabase/crm-store';

export const metadata: Metadata = {
  title: 'Blog Técnico y Recursos Empresariales TI | Site On Tecnología',
  description:
    'Artículos, guías y consejos prácticos sobre Soporte TI para empresas, redes, servidores, Cloud y automatización en Chile.',
  alternates: {
    canonical: 'https://www.siteon.cl/blog',
  },
};

export const dynamic = 'force-dynamic';

export default async function BlogIndexPage() {
  const posts = await listBlogPosts(false);

  return (
    <div className="pt-32 pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2dd4bf]/15 border border-[#5eead4]/40 px-3.5 py-1 text-xs font-extrabold text-[#99f6e4]">
            <BookOpen className="h-3.5 w-3.5" /> Conocimiento Aplicado & Guías TI
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white mt-4 leading-tight">
            Blog y Recursos Tecnológicos
          </h1>
          <p className="text-base text-teal-50/90 mt-3 leading-relaxed">
            Guías prácticas sobre continuidad operativa, soporte informático, seguridad en redes,
            servidores y automatización para empresas en Chile.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group rounded-3xl border border-teal-300/25 bg-[#123249]/85 backdrop-blur-md hover:border-[#5eead4]/60 overflow-hidden flex flex-col justify-between transition-all hover:-translate-y-1 shadow-xl"
            >
              <div>
                <div className="h-36 bg-gradient-to-br from-[#164e63] via-[#133852] to-[#0d2638] p-6 flex items-end border-b border-teal-300/20">
                  <span className="rounded-full bg-[#0d2638]/90 border border-[#5eead4]/40 px-3 py-1 text-xs font-bold text-[#99f6e4]">
                    {post.category}
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-teal-100/75 mb-3">
                    <Clock className="h-3.5 w-3.5 text-[#5eead4]" />
                    <span>{post.read_time_minutes} min de lectura</span>
                    <span>•</span>
                    <span>
                      {new Date(post.published_at).toLocaleDateString('es-CL', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <h2 className="text-lg font-extrabold text-white group-hover:text-[#5eead4] transition-colors mb-3">
                    {post.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-teal-100/80 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-3 border-t border-teal-300/15 flex items-center justify-between text-xs font-extrabold text-[#5eead4]">
                <span>Leer publicación completa</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
