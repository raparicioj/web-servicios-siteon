import { CRMLead, LeadPriority } from '@/types/siteon';

export interface LeadIntelligenceResult {
  score: number;
  priority: LeadPriority;
  classification: string;
  estimatedValueClp: number;
  summary: string;
  suggestedAction: string;
  suggestedResponseDraft: string;
  tags: string[];
}

const BUDGET_MAP_CLP: Record<string, { value: number; points: number }> = {
  '< $500.000 CLP': { value: 400000, points: 10 },
  '$500.000 - $1.500.000 CLP': { value: 950000, points: 20 },
  '$1.500.000 - $4.000.000 CLP': { value: 2500000, points: 32 },
  '> $4.000.000 CLP': { value: 5500000, points: 42 },
  'Por evaluar con asesor': { value: 1200000, points: 18 },
};

const COMPANY_SIZE_POINTS: Record<string, number> = {
  'Profesional / Independiente': 8,
  'Pyme (2 a 15 personas)': 16,
  'Mediana empresa (16 a 80 personas)': 26,
  'Gran empresa (+80 personas)': 35,
};

const HIGH_VALUE_SERVICES = new Set([
  'observabilidad-monitoreo-dynatrace-datadog',
  'optimizacion-infraestructura-finops',
  'desarrollo-software-aplicaciones',
  'automatizacion-procesos-ia',
  'cloud-infraestructura',
]);

export function evaluateLeadIntelligence(input: {
  full_name: string;
  company?: string;
  email: string;
  phone: string;
  service_slug: string;
  service_name: string;
  company_size?: string;
  budget_range?: string;
  description: string;
}): LeadIntelligenceResult {
  let score = 40;
  const tags: string[] = [];

  if (input.company && input.company.trim().length > 1) {
    score += 10;
    tags.push('B2B Empresa');
  } else {
    tags.push('Contacto Directo');
  }

  // Dominio corporativo
  const emailDomain = input.email.split('@')[1]?.toLowerCase() || '';
  if (
    emailDomain &&
    !['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'icloud.com', 'live.cl', 'hotmail.cl'].includes(
      emailDomain
    )
  ) {
    score += 12;
    tags.push('Correo Corporativo');
  }

  // Servicio de alto ticket
  if (HIGH_VALUE_SERVICES.has(input.service_slug)) {
    score += 14;
    tags.push('Soluciones Avanzadas');
  }

  // Presupuesto estimado
  const budgetInfo = input.budget_range ? BUDGET_MAP_CLP[input.budget_range] : undefined;
  let estimatedValueClp = budgetInfo ? budgetInfo.value : 1100000;
  if (budgetInfo) {
    score += budgetInfo.points;
  } else if (HIGH_VALUE_SERVICES.has(input.service_slug)) {
    estimatedValueClp = 2400000;
  }

  // Tamaño de empresa
  if (input.company_size && COMPANY_SIZE_POINTS[input.company_size]) {
    score += Math.round(COMPANY_SIZE_POINTS[input.company_size] * 0.5);
  }

  // Detección de urgencia en descripción
  const descLower = input.description.toLowerCase();
  const urgentKeywords = [
    'urgente',
    'caído',
    'caida',
    'emergencia',
    'hoy',
    'inmediato',
    'crítico',
    'critico',
    'producción',
    'produccion',
    'licitacion',
    'licitación',
  ];
  const hasUrgency = urgentKeywords.some((k) => descLower.includes(k));
  if (hasUrgency) {
    score += 15;
    tags.push('Urgencia Detectada');
  }

  score = Math.min(99, Math.max(25, score));

  let priority: LeadPriority = 'media';
  if (score >= 85 || hasUrgency) {
    priority = 'urgente';
  } else if (score >= 70) {
    priority = 'alta';
  } else if (score < 48) {
    priority = 'baja';
  }

  const classification =
    score >= 80
      ? 'Oportunidad Enterprise / Alta Conversión'
      : score >= 65
        ? 'Oportunidad Comercial Calificada (SQL)'
        : 'Prospecto en Exploración (MQL)';

  const companyLabel = input.company?.trim() ? `de ${input.company.trim()}` : '(contacto directo)';
  const summary = `Solicitud de ${input.full_name} ${companyLabel} para ${input.service_name}. ${
    input.company_size ? `Tamaño: ${input.company_size}. ` : ''
  }${input.budget_range ? `Presupuesto ref: ${input.budget_range}. ` : ''}Prioridad ${priority.toUpperCase()} (Score ${score}/100).`;

  const suggestedAction =
    priority === 'urgente'
      ? 'Contactar por teléfono o WhatsApp en los próximos 30 minutos para diagnóstico técnico inmediato.'
      : priority === 'alta'
        ? 'Enviar mensaje de bienvenida por WhatsApp hoy y agendar reunión de levantamiento de 20 minutos.'
        : 'Enviar presentación de servicio por correo y contactar dentro de las próximas 24 horas hábiles.';

  const suggestedResponseDraft = `Hola ${input.full_name.split(' ')[0]}, ¿cómo estás? Te escribe Rodrigo Aparicio de Site On Tecnología. Recibimos tu solicitud sobre *${input.service_name}*${
    input.company ? ` para ${input.company}` : ''
  }. Revisé el detalle que nos comentaste y me encantaría que conversemos 15 minutos para proponerte una solución concreta. ¿Te acomoda hoy en la tarde o mañana en la mañana?`;

  return {
    score,
    priority,
    classification,
    estimatedValueClp,
    summary,
    suggestedAction,
    suggestedResponseDraft,
    tags,
  };
}

export function generateCommercialFollowUpDraft(lead: CRMLead): {
  whatsappMessage: string;
  emailSubject: string;
  emailBody: string;
} {
  const firstName = lead.full_name.split(' ')[0] || lead.full_name;
  const companyPhrase = lead.company ? ` en ${lead.company}` : '';

  const whatsappMessage = `Hola ${firstName}, te saluda Rodrigo de *Site On Tecnología*. Te escribo respecto a tu consulta por *${lead.service_name}*${companyPhrase}. ¿Tienes 10 minutos hoy o mañana para revisar cómo podemos apoyarlos?`;

  const emailSubject = `Propuesta y diagnóstico inicial: ${lead.service_name} | Site On Tecnología`;
  const emailBody = `Estimado/a ${lead.full_name},

Junto con saludar, te escribo desde Site On Tecnología en respuesta a tu requerimiento sobre ${lead.service_name}${companyPhrase}.

Hemos analizado preliminarmente tu solicitud:
"${lead.description}"

Nuestro equipo cuenta con experiencia directa implementando este tipo de soluciones en Chile. Nos gustaría agendar una breve sesión de diagnóstico (sin costo) de 15-20 minutos para:
1. Comprender en detalle su escenario actual y objetivos.
2. Presentarles una propuesta técnica y económica clara, con plazos definidos.

Quedo atento a tu disponibilidad para coordinar una videollamada o llamada telefónica.

Atentamente,
Rodrigo Aparicio
Director — Site On Tecnología
Viña del Mar, Chile | https://www.siteon.cl`;

  return { whatsappMessage, emailSubject, emailBody };
}

