import { CRMLead, PlatformSettings } from '@/types/siteon';

export interface NotificationOutcome {
  status: 'sent' | 'failed' | 'skipped';
  error?: string | null;
  channels: string[];
}

export async function notifyNewLead(
  lead: CRMLead,
  settings: PlatformSettings
): Promise<NotificationOutcome> {
  const channels: string[] = [];
  const errors: string[] = [];

  const resendApiKey = process.env.RESEND_API_KEY;
  const notifyEmail =
    settings.notification_email ||
    process.env.SITEON_NOTIFY_EMAIL ||
    'raparicioj@gmail.com';
  const recipients = Array.from(
    new Set([notifyEmail, 'raparicioj@gmail.com', 'contacto@siteon.cl'])
  );

  // 1. Envío por correo mediante Resend API (si RESEND_API_KEY está configurada)
  if (settings.resend_enabled && resendApiKey) {
    try {
      const htmlBody = `
        <div style="font-family: Inter, system-ui, sans-serif; max-width: 640px; margin: 0 auto; background: #090d16; color: #f8fafc; padding: 32px; border-radius: 16px; border: 1px solid #1e293b;">
          <div style="display: inline-block; padding: 4px 12px; border-radius: 9999px; background: rgba(2,101,255,0.2); color: #60a5fa; font-size: 12px; font-weight: 600; margin-bottom: 16px;">
            NUEVO PROSPECTO CRM • ${lead.lead_code}
          </div>
          <h2 style="margin: 0 0 8px; font-size: 22px; color: #ffffff;">${lead.full_name} ${lead.company ? `(${lead.company})` : ''}</h2>
          <p style="margin: 0 0 24px; color: #94a3b8; font-size: 14px;">
            Servicio solicitado: <strong style="color: #38bdf8;">${lead.service_name}</strong> | Prioridad: <strong style="color: #34d399;">${lead.priority.toUpperCase()} (${lead.ai_score}/100)</strong>
          </p>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
            <tr><td style="padding: 8px 0; color: #94a3b8; border-bottom: 1px solid #1e293b;">Correo:</td><td style="padding: 8px 0; color: #f8fafc; border-bottom: 1px solid #1e293b;">${lead.email}</td></tr>
            <tr><td style="padding: 8px 0; color: #94a3b8; border-bottom: 1px solid #1e293b;">Teléfono / WhatsApp:</td><td style="padding: 8px 0; color: #f8fafc; border-bottom: 1px solid #1e293b;">${lead.phone}</td></tr>
            <tr><td style="padding: 8px 0; color: #94a3b8; border-bottom: 1px solid #1e293b;">Tamaño empresa:</td><td style="padding: 8px 0; color: #f8fafc; border-bottom: 1px solid #1e293b;">${lead.company_size || 'No especificado'}</td></tr>
            <tr><td style="padding: 8px 0; color: #94a3b8; border-bottom: 1px solid #1e293b;">Presupuesto ref:</td><td style="padding: 8px 0; color: #f8fafc; border-bottom: 1px solid #1e293b;">${lead.budget_range || 'Por evaluar'}</td></tr>
            <tr><td style="padding: 8px 0; color: #94a3b8; border-bottom: 1px solid #1e293b;">Origen:</td><td style="padding: 8px 0; color: #f8fafc; border-bottom: 1px solid #1e293b;">${lead.referral_source || 'Web Directo'} (${lead.source_page})</td></tr>
          </table>
          <div style="background: #0f172a; padding: 16px; border-radius: 12px; border: 1px solid #1e293b; margin-bottom: 24px;">
            <div style="font-size: 12px; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">Descripción de la necesidad</div>
            <div style="font-size: 14px; line-height: 1.6; color: #e2e8f0; white-space: pre-wrap;">${lead.description}</div>
          </div>
          <div style="background: rgba(16, 185, 129, 0.1); padding: 14px 16px; border-radius: 12px; border: 1px solid rgba(16, 185, 129, 0.25); margin-bottom: 24px; font-size: 13px; color: #a7f3d0;">
            <strong>Sugerencia IA Comercial:</strong> ${lead.ai_suggested_action}
          </div>
          <a href="https://www.siteon.cl/admin/crm" style="display: inline-block; background: #0265FF; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; font-size: 14px;">
            Abrir Ficha en CRM Site On →
          </a>
        </div>
      `;

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Site On CRM <notificaciones@siteon.cl>',
          to: recipients,
          reply_to: lead.email,
          subject: `[Nuevo Lead ${lead.lead_code}] ${lead.full_name} — ${lead.service_name}`,
          html: htmlBody,
        }),
      });

      if (res.ok) {
        channels.push('resend_email');
      } else {
        const errBody = await res.text();
        errors.push(`Resend HTTP ${res.status}: ${errBody.slice(0, 140)}`);
      }
    } catch (err) {
      errors.push(`Resend exception: ${(err as Error).message}`);
    }
  }

  // 2. Webhook de automatización comercial (Make.com opcional)
  const webhookUrl = process.env.SITEON_MAKE_WEBHOOK_URL;
  if (settings.webhook_enabled && webhookUrl) {
    try {
      const messageText = `🚀 *NUEVO PROSPECTO SITE ON CRM* (${lead.lead_code})\n• *Cliente:* ${lead.full_name}${lead.company ? ` (${lead.company})` : ''}\n• *Servicio:* ${lead.service_name}\n• *WhatsApp:* ${lead.phone}\n• *Email:* ${lead.email}\n• *Prioridad:* ${lead.priority.toUpperCase()} (${lead.ai_score}/100)\n• *Detalle:* ${lead.description.slice(0, 200)}`;
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'siteon_new_crm_lead',
          lead_code: lead.lead_code,
          lead_id: lead.id,
          full_name: lead.full_name,
          company: lead.company || '',
          email: lead.email,
          phone: lead.phone,
          service: lead.service_name,
          priority: lead.priority,
          ai_score: lead.ai_score,
          estimated_value_clp: lead.estimated_value_clp,
          message: messageText,
          text: messageText,
          timestamp: lead.created_at,
        }),
      });
      if (res.ok) {
        channels.push('make_webhook');
      } else {
        errors.push(`Webhook HTTP ${res.status}`);
      }
    } catch (err) {
      errors.push(`Webhook error: ${(err as Error).message}`);
    }
  }

  if (channels.length > 0) {
    return {
      status: 'sent',
      error: errors.length > 0 ? errors.join(' | ') : null,
      channels,
    };
  }

  if (!resendApiKey && !webhookUrl) {
    return {
      status: 'skipped',
      error: 'RESEND_API_KEY no configurada aún; prospecto guardado de forma segura en CRM.',
      channels: [],
    };
  }

  return {
    status: 'failed',
    error: errors.join(' | ') || 'No se pudo despachar la notificación externa.',
    channels: [],
  };
}

