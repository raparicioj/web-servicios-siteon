import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromCookies } from '@/lib/auth/admin-session';
import {
  getPlatformSettings,
  getPricingConfig,
  listAnalyticsEvents,
  listBlogPosts,
  listLeads,
  listServices,
  recordAuditLog,
  saveBlogPost,
  saveServiceItem,
  updatePlatformSettings,
  updatePricingConfig,
} from '@/lib/supabase/crm-store';
import { BlogPost, PricingConfig, ServiceItem } from '@/types/siteon';

export async function GET() {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const [{ leads, storageMode }, settings, pricingConfig, services, posts, analytics] =
    await Promise.all([
      listLeads(),
      getPlatformSettings(),
      getPricingConfig(),
      listServices(true),
      listBlogPosts(true),
      listAnalyticsEvents(400),
    ]);

  let sqlMigration = '';
  try {
    const sqlPath = path.join(
      process.cwd(),
      'supabase',
      'migrations',
      '20261107_siteon_crm_schema.sql'
    );
    if (fs.existsSync(sqlPath)) {
      sqlMigration = fs.readFileSync(sqlPath, 'utf-8');
    }
  } catch {
    // ignore
  }

  return NextResponse.json({
    session,
    storageMode,
    leads,
    settings,
    pricingConfig,
    services,
    posts,
    analytics,
    sqlMigration,
  });
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const body = await req.json();
  const resource = String(body.resource || '');

  if (resource === 'settings') {
    const updated = await updatePlatformSettings(body.data || {});
    await recordAuditLog(session.email, 'update_platform_settings', 'settings', 'default', {
      whatsapp_number: updated.whatsapp_number,
    });
    return NextResponse.json({ ok: true, settings: updated });
  }

  if (resource === 'pricing') {
    const pricingData = (body.data || {}) as Partial<PricingConfig>;
    const updatedPricing = await updatePricingConfig(pricingData);
    if (body.whatsapp_number) {
      await updatePlatformSettings({
        whatsapp_number: String(body.whatsapp_number).replace(/\D/g, ''),
        whatsapp_display: String(body.whatsapp_display || body.whatsapp_number),
      });
    }
    await recordAuditLog(session.email, 'update_pricing_config', 'pricing', 'default', {
      uf_value_clp: updatedPricing.uf_value_clp,
      uf_mode: updatedPricing.uf_mode,
      iva_percentage: updatedPricing.iva_percentage,
    });
    return NextResponse.json({ ok: true, pricingConfig: updatedPricing });
  }

  if (resource === 'service') {
    const serviceData = body.data as ServiceItem;
    const saved = await saveServiceItem(serviceData);
    await recordAuditLog(session.email, 'save_service', 'service', saved.slug);
    return NextResponse.json({ ok: true, service: saved });
  }

  if (resource === 'post') {
    const postData = body.data as BlogPost;
    const saved = await saveBlogPost({
      ...postData,
      id: postData.id || crypto.randomUUID(),
      updated_at: new Date().toISOString(),
      published_at: postData.published_at || new Date().toISOString(),
    });
    await recordAuditLog(session.email, 'save_blog_post', 'post', saved.slug);
    return NextResponse.json({ ok: true, post: saved });
  }

  return NextResponse.json({ error: 'Recurso no válido' }, { status: 400 });
}

