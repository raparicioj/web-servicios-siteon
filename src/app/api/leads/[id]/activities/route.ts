import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromCookies } from '@/lib/auth/admin-session';
import { addLeadActivity, getLeadById, recordAuditLog } from '@/lib/supabase/crm-store';
import { ActivityType } from '@/types/siteon';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await req.json();

  const activityType = (body.activity_type || 'nota') as ActivityType;
  const title = String(body.title || 'Nota comercial').trim();
  const content = String(body.content || '').trim();

  if (!content) {
    return NextResponse.json(
      { error: 'El contenido del registro no puede estar vacío.' },
      { status: 400 }
    );
  }

  const activity = await addLeadActivity({
    lead_id: id,
    activity_type: activityType,
    title,
    content,
    author_name: session.name,
    metadata: body.metadata || {},
  });

  await recordAuditLog(session.email, 'add_lead_activity', 'lead', id, {
    activity_type: activityType,
  });

  const updatedLead = await getLeadById(id);
  return NextResponse.json({ ok: true, activity, lead: updatedLead });
}

