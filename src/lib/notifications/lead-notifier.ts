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

      // 1.a. Plantilla para el Administrador (Outlook / Gmail / Apple Mail Bulletproof)
      const adminHtml = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Nuevo Prospecto CRM</title>
</head>
<body style="margin: 0; padding: 20px 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <center>
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; text-align: left;">
      <!-- Header -->
      <tr>
        <td style="padding: 24px 30px; background-color: #0d2638; border-bottom: 3px solid #0284c7;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td>
                <div style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">SITE ON <span style="color: #38bdf8; font-weight: 400;">TECNOLOGÍA</span></div>
                <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px;">Alerta de Captación Comercial • CRM</div>
              </td>
              <td align="right">
                <span style="display: inline-block; padding: 5px 12px; background-color: #0284c7; color: #ffffff; font-size: 11px; font-weight: 700; border-radius: 4px;">${lead.lead_code}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Body Content -->
      <tr>
        <td style="padding: 30px;">
          <h2 style="margin: 0 0 6px 0; font-size: 20px; color: #0f172a; font-weight: 700;">
            ${lead.full_name} ${lead.company ? `<span style="font-weight: 400; color: #64748b;">(${lead.company})</span>` : ''}
          </h2>
          <div style="font-size: 13px; color: #64748b; margin-bottom: 24px;">
            Servicio: <strong style="color: #0284c7;">${lead.service_name}</strong> | Prioridad: <strong style="color: #0f766e;">${lead.priority.toUpperCase()} (${lead.ai_score}/100)</strong>
          </div>

          <!-- Tabla de Datos -->
          <table border="0" cellpadding="8" cellspacing="0" width="100%" style="font-size: 13px; margin-bottom: 24px; border-collapse: collapse;">
            <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
              <td style="color: #64748b; width: 35%; font-weight: 600;">Correo:</td>
              <td style="color: #0f172a;"><a href="mailto:${lead.email}" style="color: #0284c7; text-decoration: none; font-weight: 600;">${lead.email}</a></td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="color: #64748b; font-weight: 600;">Teléfono / WhatsApp:</td>
              <td style="color: #0f172a;"><a href="https://wa.me/${lead.phone.replace(/\D/g, '')}" style="color: #16a34a; text-decoration: none; font-weight: 600;">${lead.phone}</a></td>
            </tr>
            <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
              <td style="color: #64748b; font-weight: 600;">Tamaño empresa:</td>
              <td style="color: #0f172a;">${lead.company_size || 'No especificado'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="color: #64748b; font-weight: 600;">Presupuesto / Valor:</td>
              <td style="color: #0f172a; font-weight: 700;">${lead.budget_range || (lead.estimated_value_clp > 0 ? '$' + lead.estimated_value_clp.toLocaleString('es-CL') + ' CLP' : 'Por evaluar')}</td>
            </tr>
            <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
              <td style="color: #64748b; font-weight: 600;">Origen:</td>
              <td style="color: #0f172a;">${lead.referral_source || 'Web Directo'}</td>
            </tr>
          </table>

          <!-- Mensaje / Detalle -->
          <div style="background-color: #f1f5f9; border-left: 4px solid #0284c7; padding: 14px 16px; margin-bottom: 24px; border-radius: 0 4px 4px 0;">
            <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #475569; margin-bottom: 4px;">Mensaje del cliente</div>
            <div style="font-size: 13px; line-height: 1.5; color: #1e293b; white-space: pre-wrap;">${lead.description}</div>
          </div>

          <!-- Sugerencia IA -->
          <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 12px 16px; border-radius: 6px; margin-bottom: 26px; font-size: 12px; color: #065f46;">
            <strong>Acción sugerida:</strong> ${lead.ai_suggested_action}
          </div>

          <!-- Boton CRM -->
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td align="center">
                <a href="https://www.siteon.cl/admin/crm" style="display: inline-block; padding: 12px 28px; background-color: #0284c7; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; border-radius: 6px;">
                  Abrir Ficha en el CRM Site On &rarr;
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="padding: 16px 30px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center;">
          Site On Tecnología SpA • Viña del Mar, Chile • <a href="https://www.siteon.cl" style="color: #64748b;">www.siteon.cl</a>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>`;

      const formData = new URLSearchParams();
      formData.append('from', `Site On CRM <notificaciones@${mailgunDomain}>`);
      recipients.forEach(r => formData.append('to', r));
      formData.append('h:Reply-To', lead.email);
      formData.append('subject', `[Nuevo Prospecto ${lead.lead_code}] ${lead.full_name} — ${lead.service_name}`);
      formData.append('html', adminHtml);

      const mgRes = await fetch(`https://${mailgunHost}/v3/${mailgunDomain}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (mgRes.ok) {
        channels.push('mailgun_admin_email');
      } else {
        const errText = await mgRes.text();
        errors.push(`Mailgun Admin HTTP ${mgRes.status}: ${errText.slice(0, 160)}`);
      }

      // 1.b. Enviar comprobante de solicitud y cotización formal al CLIENTE / VISITANTE (Outlook Bulletproof HTML)
      if (lead.email && lead.email.includes('@')) {
        try {
          const clientFormData = new URLSearchParams();
          clientFormData.append('from', `Site On Tecnología <contacto@${mailgunDomain}>`);
          clientFormData.append('to', lead.email);
          clientFormData.append('h:Reply-To', `contacto@${mailgunDomain}`);
          clientFormData.append(
            'subject',
            `Recibimos tu solicitud de diagnóstico [${lead.lead_code}] — Site On Tecnología`
          );

          const clientHtml = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Confirmación de Solicitud Site On</title>
</head>
<body style="margin: 0; padding: 20px 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <center>
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; text-align: left;">
      <!-- Header Superior con Logo Site On -->
      <tr>
        <td style="padding: 26px 30px; background-color: #0d2638; border-bottom: 3px solid #0284c7;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td>
                <div style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">SITE ON <span style="color: #38bdf8; font-weight: 400;">TECNOLOGÍA</span></div>
                <div style="font-size: 11px; color: #94a3b8; margin-top: 3px;">Soporte TI, Infraestructura & Soluciones Empresariales</div>
              </td>
              <td align="right">
                <span style="display: inline-block; padding: 5px 12px; background-color: #0284c7; color: #ffffff; font-size: 11px; font-weight: 700; border-radius: 4px;">${lead.lead_code}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Contenido Principal -->
      <tr>
        <td style="padding: 30px;">
          <h1 style="margin: 0 0 12px 0; font-size: 20px; color: #0f172a; font-weight: 700; line-height: 1.3;">
            ¡Hola ${lead.full_name.split(' ')[0]}! Recibimos tu solicitud con éxito
          </h1>
          <p style="margin: 0 0 22px 0; font-size: 14px; line-height: 1.6; color: #334155;">
            Gracias por contactar a <strong>Site On Tecnología</strong>. Nuestro equipo de consultoría y soporte informático ha registrado tu requerimiento y te contactaremos a la brevedad para coordinar tu <strong>diagnóstico técnico inicial gratuito</strong>.
          </p>

          <!-- Resumen de Requerimiento -->
          <div style="border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; margin-bottom: 22px;">
            <div style="background-color: #f8fafc; padding: 10px 16px; border-bottom: 1px solid #e2e8f0; font-size: 11px; font-weight: 700; color: #0284c7; text-transform: uppercase; letter-spacing: 0.5px;">
              Resumen de tu Solicitud
            </div>
            <table border="0" cellpadding="10" cellspacing="0" width="100%" style="font-size: 13px; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="color: #64748b; width: 40%; font-weight: 600;">Servicio / Plan:</td>
                <td style="color: #0f172a; font-weight: 600;">${lead.service_name}</td>
              </tr>
              ${lead.company ? `
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="color: #64748b; font-weight: 600;">Empresa:</td>
                <td style="color: #0f172a;">${lead.company}</td>
              </tr>` : ''}
              ${lead.budget_range ? `
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="color: #64748b; font-weight: 600;">Presupuesto Referencial:</td>
                <td style="color: #0f766e; font-weight: 700;">${lead.budget_range}</td>
              </tr>` : ''}
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="color: #64748b; font-weight: 600;">Teléfono de Contacto:</td>
                <td style="color: #0f172a;">${lead.phone}</td>
              </tr>
              <tr>
                <td style="color: #64748b; font-weight: 600;">Estado:</td>
                <td style="color: #0284c7; font-weight: 700;">Ingresado • Asignado a Consultoría</td>
              </tr>
            </table>
          </div>

          <!-- Si viene del cotizador inteligente -->
          ${lead.quote_details ? `
          <div style="background-color: #f0fdfa; border: 1px solid #99f6e4; border-radius: 6px; padding: 16px; margin-bottom: 22px;">
            <div style="font-size: 12px; font-weight: 700; color: #0f766e; margin-bottom: 8px; text-transform: uppercase;">
              Configuración Simulada en Cotizador Web
            </div>
            <div style="font-size: 13px; color: #134e4a; line-height: 1.6;">
              &bull; <strong>Plan Base:</strong> ${lead.quote_details.recommended_plan_name}<br />
              &bull; <strong>Alcance:</strong> ${lead.quote_details.users_count} usuarios, ${lead.quote_details.computers_count} computadores, ${lead.quote_details.servers_count} servidores.<br />
              &bull; <strong>Soporte:</strong> ${lead.quote_details.support_modality === 'remote_and_scheduled_onsite' ? 'Remoto prioritario + Visita mensual en terreno' : 'Remoto prioritario'}.<br />
              &bull; <strong>Total Estimado:</strong> ${lead.quote_details.net_uf.toFixed(2)} UF + IVA ($${lead.quote_details.total_clp_with_iva.toLocaleString('es-CL')} CLP c/IVA).
            </div>
            <div style="font-size: 11px; color: #0f766e; margin-top: 8px; font-style: italic;">
              * El valor final se confirmará tras validar técnicamente tu infraestructura en el diagnóstico.
            </div>
          </div>` : ''}

          <!-- Botón de WhatsApp Directo para Urgencias -->
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 24px 0;">
            <tr>
              <td align="center">
                <a href="https://wa.me/56958324650?text=Hola%20Site%20On,%20acabo%20de%20enviar%20mi%20solicitud%20${encodeURIComponent(lead.lead_code)}%20y%20quisiera%20conversar%20directamente." style="display: inline-block; padding: 14px 28px; background-color: #16a34a; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; border-radius: 6px;">
                  &iquest;Tienes una urgencia? Escr&iacute;benos por WhatsApp &rarr;
                </a>
              </td>
            </tr>
          </table>

          <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">
            Si necesitas agregar información adicional, simplemente responde a este correo o llámanos directamente.
          </p>
        </td>
      </tr>

      <!-- Footer Corporativo -->
      <tr>
        <td style="padding: 20px 30px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; text-align: center; line-height: 1.6;">
          <strong>Site On Tecnología SpA</strong> &bull; Viña del Mar, Chile<br />
          Web: <a href="https://www.siteon.cl" style="color: #0284c7; text-decoration: none;">www.siteon.cl</a> &bull; Email: <a href="mailto:contacto@siteon.cl" style="color: #0284c7; text-decoration: none;">contacto@siteon.cl</a> &bull; Tel: +56 9 5832 4650<br />
          <span style="color: #94a3b8;">Mensaje automático de confirmación generado por www.siteon.cl</span>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>`;

          clientFormData.append('html', clientHtml);

          const clientRes = await fetch(`https://${mailgunHost}/v3/${mailgunDomain}/messages`, {
            method: 'POST',
            headers: {
              Authorization: `Basic ${basicAuth}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: clientFormData.toString(),
          });

          if (clientRes.ok) {
            channels.push('mailgun_client_email');
          } else {
            const clientErr = await clientRes.text();
            errors.push(`Mailgun Client HTTP ${clientRes.status}: ${clientErr.slice(0, 140)}`);
          }
        } catch (clientEx) {
          errors.push(`Mailgun client email exception: ${(clientEx as Error).message}`);
        }
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

