import { NextRequest, NextResponse } from 'next/server';
import { getAdminSessionFromCookies } from '@/lib/auth/admin-session';
import { evaluateLeadIntelligence } from '@/lib/ai/lead-intelligence';
import { notifyNewLead } from '@/lib/notifications/lead-notifier';
import {
  addLeadActivity,
  createLead,
  findRecentDuplicateLead,
  getPlatformSettings,
  getServiceBySlug,
  listLeads,
  recordAnalyticsEvent,
  updateLead,
} from '@/lib/supabase/crm-store';
import { CRMActivity, CRMLead, QuoteConfiguration } from '@/types/siteon';

// Rate limiting en memoria por IP (ventana de 10 minutos, máx 6 envíos)
const ipRateMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipRateMap.get(ip);
  if (!entry || entry.resetAt < now) {
    ipRateMap.set(ip, { count: 1, resetAt: now + 10 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 6) {
    return false;
  }
  entry.count += 1;
  return true;
}

export async function GET() {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const { leads, storageMode } = await listLeads();
  return NextResponse.json({ leads, storageMode });
}

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          error:
            'Has realizado demasiadas solicitudes en pocos minutos. Por favor intenta nuevamente más tarde o escríbenos por WhatsApp.',
        },
        { status: 429 }
      );
    }

    const body = await req.json();

    // 1. Protección Honeypot contra bots de spam
    if (body.website_url && String(body.website_url).trim().length > 0) {
      return NextResponse.json({
        ok: true,
        message: 'Solicitud recibida correctamente.',
      });
    }

    // 2. Validación de campos obligatorios
    const fullName = String(body.full_name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const phone = String(body.phone || '').trim();
    const serviceSlug = String(body.service_slug || 'consultoria-ti').trim();
    const description = String(body.description || '').trim();
    const privacyAccepted = Boolean(body.privacy_accepted);

    if (fullName.length < 2) {
      return NextResponse.json(
        { error: 'Por favor ingresa tu nombre completo.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Por favor ingresa un correo electrónico válido.' },
        { status: 400 }
      );
    }

    if (phone.replace(/\D/g, '').length < 8) {
      return NextResponse.json(
        { error: 'Por favor ingresa un número de teléfono o WhatsApp válido.' },
        { status: 400 }
      );
    }

    if (description.length < 10) {
      return NextResponse.json(
        { error: 'Cuéntanos brevemente tu necesidad (mínimo 10 caracteres).' },
        { status: 400 }
      );
    }

    if (!privacyAccepted) {
      return NextResponse.json(
        { error: 'Debes aceptar la Política de Privacidad para enviar tu solicitud.' },
        { status: 400 }
      );
    }

    // 3. Prevención de duplicados recientes (mismo email + servicio en < 10 min)
    const quoteDetails = (body.quote_details || null) as QuoteConfiguration | null;
    const duplicate = await findRecentDuplicateLead(email, serviceSlug);
    if (duplicate && !quoteDetails) {
      return NextResponse.json({
        ok: true,
        duplicate: true,
        lead_code: duplicate.lead_code,
        message:
          'Ya recibimos tu solicitud hace unos instantes y está asignada a nuestro equipo.',
      });
    }

    const serviceObj = await getServiceBySlug(serviceSlug);
    const serviceName = quoteDetails?.recommended_plan_name
      ? `Plan ${quoteDetails.recommended_plan_name} (Soporte & Continuidad TI)`
      : serviceObj?.title || String(body.service_name || 'Consultoría y Soluciones TI');

    // 4. Evaluación inteligente de oportunidad comercial
    const intel = evaluateLeadIntelligence({
      full_name: fullName,
      company: body.company ? String(body.company).trim() : undefined,
      email,
      phone,
      service_slug: serviceSlug,
      service_name: serviceName,
      company_size: body.company_size ? String(body.company_size) : undefined,
      budget_range: body.budget_range ? String(body.budget_range) : undefined,
      description,
    });

    const mergedTags = Array.from(
      new Set([
        ...intel.tags,
        ...(quoteDetails ? ['Cotizador Web', quoteDetails.recommended_plan_name] : []),
      ])
    );

    const estimatedClp =
      quoteDetails && quoteDetails.net_clp > 0
        ? quoteDetails.net_clp
        : intel.estimatedValueClp;

    const nowIso = new Date().toISOString();

    // Si el prospecto ya existía recientemente y envía una nueva simulación del cotizador, actualizamos su ficha
    if (duplicate && quoteDetails) {
      const updatedTags = Array.from(new Set([...(duplicate.tags || []), ...mergedTags]));
      await updateLead(
        duplicate.id,
        {
          full_name: fullName,
          company: body.company ? String(body.company).trim() : duplicate.company,
          phone,
          service_slug: serviceSlug,
          service_name: serviceName,
          company_size: body.company_size ? String(body.company_size) : duplicate.company_size,
          budget_range:
            body.budget_range
              ? String(body.budget_range)
              : `${quoteDetails.net_uf.toFixed(1)} UF + IVA ($${quoteDetails.net_clp.toLocaleString('es-CL')} CLP neto)`,
          description,
          estimated_value_clp: estimatedClp,
          tags: updatedTags,
        },
        'Cotizador Inteligente Web'
      );

      await addLeadActivity({
        lead_id: duplicate.id,
        activity_type: 'cotizacion',
        title: `Nueva simulación en Cotizador Web: ${quoteDetails.recommended_plan_name} (${quoteDetails.net_uf.toFixed(1)} UF + IVA)`,
        content: `Plan: ${quoteDetails.recommended_plan_name} | Usuarios: ${quoteDetails.users_count} | Equipos: ${quoteDetails.computers_count} | Servidores: ${quoteDetails.servers_count} | Sedes: ${quoteDetails.branches_count}\nNeto: ${quoteDetails.net_uf.toFixed(2)} UF ($${quoteDetails.net_clp.toLocaleString('es-CL')} CLP) | IVA: $${quoteDetails.iva_clp.toLocaleString('es-CL')} CLP | Total c/IVA: $${quoteDetails.total_clp_with_iva.toLocaleString('es-CL')} CLP.`,
        author_name: 'Cotizador Inteligente Site On',
        metadata: { quote_details: quoteDetails },
      });

      return NextResponse.json({
        ok: true,
        lead_code: duplicate.lead_code,
        priority: duplicate.priority,
        message:
          '¡Actualizamos tu solicitud de diagnóstico y cotización! Nuestro equipo te contactará con la propuesta detallada.',
      });
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const leadCode = `SO-${new Date().getFullYear()}-${randomSuffix}`;
    const leadId = crypto.randomUUID();

    // Próxima fecha de contacto sugerida (2 horas para urgente, 24h para normal)
    const nextContactDate = new Date(
      Date.now() + (intel.priority === 'urgente' ? 2 : 24) * 60 * 60 * 1000
    ).toISOString();

    const computedBudgetRange = body.budget_range
      ? String(body.budget_range)
      : quoteDetails
      ? `${quoteDetails.net_uf.toFixed(1)} UF + IVA ($${quoteDetails.net_clp.toLocaleString('es-CL')} CLP neto/mes)`
      : '';

    const computedCompanySize = body.company_size
      ? String(body.company_size)
      : quoteDetails
      ? `${quoteDetails.users_count} usuarios / ${quoteDetails.computers_count} equipos`
      : '';

    const newLead: CRMLead = {
      id: leadId,
      lead_code: leadCode,
      full_name: fullName,
      company: body.company ? String(body.company).trim() : '',
      email,
      phone,
      service_slug: serviceSlug,
      service_name: serviceName,
      company_size: computedCompanySize,
      budget_range: computedBudgetRange,
      description,
      referral_source: body.referral_source
        ? String(body.referral_source)
        : quoteDetails
        ? 'Cotizador Web Site On'
        : 'Sitio Web Directo',
      privacy_accepted: true,
      privacy_accepted_at: nowIso,
      stage: 'nuevo',
      priority: intel.priority,
      estimated_value_clp: estimatedClp,
      next_contact_at: nextContactDate,
      lost_reason: null,
      assigned_to: 'Rodrigo Aparicio',
      tags: mergedTags,
      source_page: body.source_page ? String(body.source_page) : '/',
      utm_source: body.utm_source ? String(body.utm_source) : null,
      utm_medium: body.utm_medium ? String(body.utm_medium) : null,
      utm_campaign: body.utm_campaign ? String(body.utm_campaign) : null,
      utm_term: body.utm_term ? String(body.utm_term) : null,
      utm_content: body.utm_content ? String(body.utm_content) : null,
      dedup_hash: `${email}_${serviceSlug}`,
      ai_score: intel.score,
      ai_classification: intel.classification,
      ai_summary: quoteDetails
        ? `Cotización Web: ${quoteDetails.recommended_plan_name} (${quoteDetails.net_uf.toFixed(1)} UF + IVA = $${quoteDetails.total_clp_with_iva.toLocaleString('es-CL')} CLP c/IVA) para ${quoteDetails.users_count} usuarios, ${quoteDetails.computers_count} equipos y ${quoteDetails.servers_count} servidores. ${intel.summary}`
        : intel.summary,
      ai_suggested_action: intel.suggestedAction,
      email_notification_status: 'pending',
      email_notification_error: null,
      quote_details: quoteDetails,
      created_at: nowIso,
      updated_at: nowIso,
    };

    const initialActivity: CRMActivity = {
      id: crypto.randomUUID(),
      lead_id: leadId,
      activity_type: quoteDetails ? 'cotizacion' : 'sistema',
      title: quoteDetails
        ? `Cotización generada en Cotizador Web: ${quoteDetails.recommended_plan_name} (${quoteDetails.net_uf.toFixed(1)} UF + IVA)`
        : `Prospecto captado vía formulario web (${leadCode})`,
      content: quoteDetails
        ? `Configuración solicitada en el Cotizador Inteligente:\n• Plan recomendado: ${quoteDetails.recommended_plan_name} (Base ${quoteDetails.base_price_uf} UF)\n• Usuarios: ${quoteDetails.users_count} | Computadores: ${quoteDetails.computers_count} | Servidores: ${quoteDetails.servers_count} | Sucursales: ${quoteDetails.branches_count}\n• Correo/Suite: ${quoteDetails.productivity_suite} | Modalidad: ${quoteDetails.support_modality}\n• Valor Neto Estimado: ${quoteDetails.net_uf.toFixed(2)} UF ($${quoteDetails.net_clp.toLocaleString('es-CL')} CLP)\n• IVA (19%): $${quoteDetails.iva_clp.toLocaleString('es-CL')} CLP | Total c/IVA: $${quoteDetails.total_clp_with_iva.toLocaleString('es-CL')} CLP\n• Tasa UF aplicada: $${quoteDetails.uf_rate_used.toLocaleString('es-CL')} CLP (${quoteDetails.uf_date_used})`
        : `${intel.summary}\nAcción sugerida: ${intel.suggestedAction}`,
      author_name: quoteDetails ? 'Cotizador Inteligente Site On' : 'Sistema CRM Site On',
      metadata: quoteDetails ? { quote_details: quoteDetails } : {},
      created_at: nowIso,
    };

    // 5. Guardar primero en la base de datos (NUNCA perder un prospecto por falla de correo)
    const savedLead = await createLead(newLead, initialActivity);

    // 6. Registrar evento analítico de conversión
    await recordAnalyticsEvent({
      event_type: 'form_submission',
      page_path: newLead.source_page,
      service_slug: newLead.service_slug,
      utm_source: newLead.utm_source || undefined,
      utm_medium: newLead.utm_medium || undefined,
      utm_campaign: newLead.utm_campaign || undefined,
      metadata: {
        lead_code: leadCode,
        priority: intel.priority,
        ai_score: intel.score,
      },
    });

    // 7. Despachar notificación por correo / webhook de forma resiliente
    const settings = await getPlatformSettings();
    const notifyResult = await notifyNewLead(savedLead, settings);

    await updateLead(
      leadId,
      {
        email_notification_status: notifyResult.status,
        email_notification_error: notifyResult.error || null,
      },
      'Sistema CRM Site On'
    );

    return NextResponse.json({
      ok: true,
      lead_code: leadCode,
      priority: intel.priority,
      message:
        '¡Recibimos tu solicitud! Nuestro equipo de ingeniería y consultoría te contactará a la brevedad.',
    });
  } catch (err) {
    console.error('[API /api/leads POST] Error:', err);
    return NextResponse.json(
      {
        error:
          'Ocurrió un inconveniente al procesar tu solicitud. Por favor intenta nuevamente o contáctanos directo por WhatsApp.',
      },
      { status: 500 }
    );
  }
}

