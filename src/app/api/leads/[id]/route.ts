import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromCookies } from '@/lib/auth/admin-session';
import { notifyNewLead } from '@/lib/notifications/lead-notifier';
import {
  deleteLead,
  getLeadById,
  getPlatformSettings,
  recordAuditLog,
  updateLead,
} from '@/lib/supabase/crm-store';

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await req.json();

  // Acción especial: Reintentar notificación de correo/webhook
  if (body.action === 'retry_notification') {
    const existing = await getLeadById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Prospecto no encontrado' }, { status: 404 });
    }
    const settings = await getPlatformSettings();
    const outcome = await notifyNewLead(existing, settings);
    const updated = await updateLead(
      id,
      {
        email_notification_status: outcome.status,
        email_notification_error: outcome.error || null,
      },
      session.name
    );
    await recordAuditLog(session.email, 'retry_lead_notification', 'lead', id, {
      status: outcome.status,
    });
    return NextResponse.json({ ok: true, lead: updated, outcome });
  }

  const updated = await updateLead(id, body, session.name);
  if (!updated) {
    return NextResponse.json({ error: 'Prospecto no encontrado' }, { status: 404 });
  }

  await recordAuditLog(session.email, 'update_lead', 'lead', id, {
    stage: body.stage,
    priority: body.priority,
  });

  return NextResponse.json({ ok: true, lead: updated });
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id } = await context.params;
  const ok = await deleteLead(id);
  await recordAuditLog(session.email, 'delete_lead', 'lead', id);

  return NextResponse.json({ ok });
}

