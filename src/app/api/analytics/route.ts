import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromCookies } from '@/lib/auth/admin-session';
import { listAnalyticsEvents, recordAnalyticsEvent } from '@/lib/supabase/crm-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const allowedTypes = new Set([
      'whatsapp_click',
      'form_submission',
      'quote_request',
      'service_view',
      'cta_click',
    ]);
    const eventType = allowedTypes.has(body.event_type)
      ? body.event_type
      : 'cta_click';

    await recordAnalyticsEvent({
      event_type: eventType,
      page_path: String(body.page_path || '/').slice(0, 180),
      service_slug: body.service_slug ? String(body.service_slug).slice(0, 100) : undefined,
      utm_source: body.utm_source ? String(body.utm_source).slice(0, 80) : undefined,
      utm_medium: body.utm_medium ? String(body.utm_medium).slice(0, 80) : undefined,
      utm_campaign: body.utm_campaign ? String(body.utm_campaign).slice(0, 100) : undefined,
      metadata: typeof body.metadata === 'object' && body.metadata ? body.metadata : {},
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}

export async function GET() {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const events = await listAnalyticsEvents(500);
  return NextResponse.json({ events });
}

