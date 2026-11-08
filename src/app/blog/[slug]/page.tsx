import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, User } from 'lucide-react';
import {
  getBlogPostBySlug,
  getPlatformSettings,
} from '@/lib/supabase/crm-store';
import { SmartLeadForm } from '@/components/forms/SmartLeadForm';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: 'Artículo no encontrado' };

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.seo_keywords,
    alternates: {
      canonical: `https://www.siteon.cl/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://www.siteon.cl/blog/${post.slug}`,
      type: 'article',
    },
  };
}

export default async function BlogPostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, settings] = await Promise.all([
    getBlogPostBySlug(slug),
    getPlatformSettings(),
  ]);

  if (!post) {
    notFound();
  }

  return (
    <div className="pt-32 pb-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a Blog y Recursos
        </Link>

        <article className="rounded-3xl border border-slate-800 bg-slate-900/60 overflow-hidden mb-16 shadow-2xl">
          <div className={`p-8 sm:p-12 bg-gradient-to-br ${post.cover_gradient} border-b border-slate-800`}>
            <span className="inline-block rounded-full bg-slate-950/80 border border-slate-700 px-3.5 py-1 text-xs font-semibold text-brand-300 mb-4">
              {post.category}
            </span>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
              <span className="inline-flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-brand-400" />
                {post.author_name} ({post.author_role})
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-emerald-400" />
                {post.read_time_minutes} min de lectura
              </span>
            </div>
          </div>

          <div className="p-8 sm:p-12 space-y-5 text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-line">
            {post.content}
          </div>
        </article>

        <div className="space-y-6">
          <h2 className="font-display text-2xl font-bold text-white text-center">
            ¿Deseas implementar esta solución en tu empresa?
          </h2>
          <SmartLeadForm compact whatsappNumber={settings.whatsapp_number} />
        </div>
      </div>
    </div>
  );
}

