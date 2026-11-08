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
  const mailgunApiKey = process.env.MAILGUN_API_KEY;
  const mailgunDomain = process.env.MAILGUN_DOMAIN || 'siteon.cl';
  const mailgunHost = process.env.MAILGUN_HOST || 'api.mailgun.net'; // o api.eu.mailgun.net

  const notifyEmail =
    settings.notification_email ||
    process.env.SITEON_NOTIFY_EMAIL ||
    'raparicioj@gmail.com';
  const recipients = Array.from(
    new Set([notifyEmail, 'raparicioj@gmail.com', 'contacto@siteon.cl'])
  );

  const htmlBody = `
    <div style="font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 640px; margin: 0 auto; background: #071521; color: #f8fafc; padding: 32px; border-radius: 16px; border: 1px solid #14384d;">
      <div style="display: inline-block; padding: 4px 12px; border-radius: 9999px; background: rgba(56,189,248,0.15); color: #38bdf8; font-size: 12px; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 16px;">
        NUEVA SOLICITUD SITE ON CRM • ${lead.lead_code}
      </div>
      <h2 style="margin: 0 0 8px; font-size: 22px; color: #ffffff;">${lead.full_name} ${lead.company ? `<span style="color: #94a3b8; font-weight: 400;">(${lead.company})</span>` : ''}</h2>
      <p style="margin: 0 0 24px; color: #94a3b8; font-size: 14px;">
        Servicio / Plan: <strong style="color: #38bdf8;">${lead.service_name}</strong> | Prioridad: <strong style="color: #34d399;">${lead.priority.toUpperCase()} (${lead.ai_score}/100)</strong>
      </p>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
        <tr><td style="padding: 10px 0; color: #94a3b8; border-bottom: 1px solid #14384d; width: 35%;">Correo:</td><td style="padding: 10px 0; color: #f8fafc; border-bottom: 1px solid #14384d; font-weight: 600;"><a href="mailto:${lead.email}" style="color: #38bdf8; text-decoration: none;">${lead.email}</a></td></tr>
        <tr><td style="padding: 10px 0; color: #94a3b8; border-bottom: 1px solid #14384d;">Teléfono / WhatsApp:</td><td style="padding: 10px 0; color: #f8fafc; border-bottom: 1px solid #14384d; font-weight: 600;"><a href="https://wa.me/${lead.phone.replace(/\\D/g, '')}" style="color: #34d399; text-decoration: none;">${lead.phone}</a></td></tr>
        <tr><td style="padding: 10px 0; color: #94a3b8; border-bottom: 1px solid #14384d;">Tamaño empresa:</td><td style="padding: 10px 0; color: #f8fafc; border-bottom: 1px solid #14384d;">${lead.company_size || 'No especificado'}</td></tr>
        <tr><td style="padding: 10px 0; color: #94a3b8; border-bottom: 1px solid #14384d;">Presupuesto / Valor:</td><td style="padding: 10px 0; color: #f8fafc; border-bottom: 1px solid #14384d; font-weight: 600;">${lead.budget_range || (lead.estimated_value_clp > 0 ? '$' + lead.estimated_value_clp.toLocaleString('es-CL') + ' CLP' : 'Por evaluar')}</td></tr>
        <tr><td style="padding: 10px 0; color: #94a3b8; border-bottom: 1px solid #14384d;">Origen de captación:</td><td style="padding: 10px 0; color: #f8fafc; border-bottom: 1px solid #14384d;">${lead.referral_source || 'Web Directo'} (${lead.source_page || '/planes'})</td></tr>
        ${lead.tags && lead.tags.length > 0 ? `<tr><td style="padding: 10px 0; color: #94a3b8; border-bottom: 1px solid #14384d;">Etiquetas:</td><td style="padding: 10px 0; color: #f8fafc; border-bottom: 1px solid #14384d;">${lead.tags.map(t => `<span style="display: inline-block; padding: 2px 8px; border-radius: 6px; background: rgba(56,189,248,0.1); color: #38bdf8; font-size: 12px; margin-right: 6px;">${t}</span>`).join('')}</td></tr>` : ''}
      </table>
      <div style="background: #0b1e2c; padding: 18px; border-radius: 12px; border: 1px solid #14384d; margin-bottom: 24px;">
        <div style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700; margin-bottom: 8px;">Detalle del requerimiento</div>
        <div style="font-size: 14px; line-height: 1.6; color: #e2e8f0; white-space: pre-wrap;">${lead.description}</div>
      </div>
      <div style="background: rgba(16, 185, 129, 0.1); padding: 14px 16px; border-radius: 12px; border: 1px solid rgba(16, 185, 129, 0.25); margin-bottom: 24px; font-size: 13px; color: #a7f3d0;">
        <strong>Sugerencia Comercial:</strong> ${lead.ai_suggested_action}
      </div>
      <div style="text-align: center; margin-top: 24px;">
        <a href="https://www.siteon.cl/admin/crm" style="display: inline-block; background: #0265FF; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 14px rgba(2,101,255,0.35);">
          Abrir Ficha en CRM Site On →
        </a>
      </div>
    </div>
  `;

  // 1. Envío prioritario vía Mailgun API (si MAILGUN_API_KEY está configurada)
  if (mailgunApiKey) {
    try {
      const basicAuth = Buffer.from(`api:${mailgunApiKey}`).toString('base64');
      const formData = new URLSearchParams();
      formData.append('from', `Site On CRM <notificaciones@${mailgunDomain}>`);
      recipients.forEach(r => formData.append('to', r));
      formData.append('h:Reply-To', lead.email);
      formData.append('subject', `[Nuevo Prospecto ${lead.lead_code}] ${lead.full_name} — ${lead.service_name}`);
      formData.append('html', htmlBody);

      const mgRes = await fetch(`https://${mailgunHost}/v3/${mailgunDomain}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (mgRes.ok) {
        channels.push('mailgun_email');
      } else {
        const errText = await mgRes.text();
        errors.push(`Mailgun HTTP ${mgRes.status}: ${errText.slice(0, 160)}`);
      }
    } catch (err) {
      errors.push(`Mailgun exception: ${(err as Error).message}`);
    }
  }

  // 2. Envío de respaldo vía Resend API (si RESEND_API_KEY está configurada y Mailgun no se usó)
  if (settings.resend_enabled && resendApiKey && !channels.includes('mailgun_email')) {
    try {
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

  if (!mailgunApiKey && !resendApiKey && !webhookUrl) {
    return {
      status: 'skipped',
      error: 'Ni MAILGUN_API_KEY ni RESEND_API_KEY configuradas aún; prospecto registrado de forma segura en CRM.',
      channels: [],
    };
  }

  return {
    status: 'failed',
    error: errors.join(' | ') || 'No se pudo despachar la notificación externa.',
    channels: [],
  };
}

