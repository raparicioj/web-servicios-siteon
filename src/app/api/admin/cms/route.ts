import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromCookies } from '@/lib/auth/admin-session';
import {
  getPlatformSettings,
  listAnalyticsEvents,
  listBlogPosts,
  listLeads,
  listServices,
  recordAuditLog,
  saveBlogPost,
  saveServiceItem,
  updatePlatformSettings,
} from '@/lib/supabase/crm-store';
import { BlogPost, ServiceItem } from '@/types/siteon';

export async function GET() {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const [{ leads, storageMode }, settings, services, posts, analytics] = await Promise.all([
    listLeads(),
    getPlatformSettings(),
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

