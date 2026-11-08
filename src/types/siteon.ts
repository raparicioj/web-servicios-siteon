export type PipelineStage =
  | 'nuevo'
  | 'contactado'
  | 'en_evaluacion'
  | 'reunion_agendada'
  | 'cotizacion_enviada'
  | 'negociacion'
  | 'ganado'
  | 'perdido';

export type LeadPriority = 'baja' | 'media' | 'alta' | 'urgente';

export type ActivityType =
  | 'nota'
  | 'llamada'
  | 'reunion'
  | 'correo'
  | 'whatsapp'
  | 'cotizacion'
  | 'cambio_estado'
  | 'sistema';

export interface CRMActivity {
  id: string;
  lead_id: string;
  activity_type: ActivityType;
  title: string;
  content: string;
  author_name: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface CRMLead {
  id: string;
  lead_code: string;
  full_name: string;
  company?: string;
  email: string;
  phone: string;
  service_slug: string;
  service_name: string;
  company_size?: string;
  budget_range?: string;
  description: string;
  referral_source?: string;
  privacy_accepted: boolean;
  privacy_accepted_at: string;
  stage: PipelineStage;
  priority: LeadPriority;
  estimated_value_clp: number;
  next_contact_at?: string | null;
  lost_reason?: string | null;
  assigned_to: string;
  tags: string[];
  source_page: string;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
  dedup_hash?: string;
  ai_score: number;
  ai_classification: string;
  ai_summary: string;
  ai_suggested_action: string;
  email_notification_status: 'pending' | 'sent' | 'failed' | 'skipped';
  email_notification_error?: string | null;
  created_at: string;
  updated_at: string;
  activities?: CRMActivity[];
}

export interface ServiceUseCase {
  title: string;
  industry: string;
  challenge: string;
  outcome: string;
  metric: string;
}

export interface ServiceBenefit {
  title: string;
  description: string;
  metric?: string;
}

export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  short_title: string;
  category: 'Consultoría & Cloud' | 'Desarrollo & IA' | 'Observabilidad & FinOps' | 'Operación & Soporte TI';
  tagline: string;
  summary: string;
  problem_statement: string;
  solution_description: string;
  benefits: ServiceBenefit[];
  use_cases: ServiceUseCase[];
  deliverables: string[];
  technologies: string[];
  icon_name: string;
  featured: boolean;
  sort_order: number;
  active: boolean;
  whatsapp_prompt: string;
  seo_title: string;
  seo_description: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  read_time_minutes: number;
  author_name: string;
  author_role: string;
  cover_gradient: string;
  seo_keywords: string[];
  published: boolean;
  published_at: string;
  updated_at: string;
}

export interface PlatformSettings {
  id: string;
  company_name: string;
  commercial_slogan: string;
  whatsapp_number: string;
  whatsapp_display: string;
  whatsapp_tooltip: string;
  whatsapp_default_message: string;
  contact_email: string;
  notification_email: string;
  city: string;
  region: string;
  country: string;
  linkedin_url: string;
  instagram_url: string;
  facebook_url: string;
  ga4_measurement_id: string;
  resend_enabled: boolean;
  webhook_enabled: boolean;
  updated_at: string;
}

export interface AnalyticsEvent {
  id: string;
  event_type: 'whatsapp_click' | 'form_submission' | 'quote_request' | 'service_view' | 'cta_click';
  page_path: string;
  service_slug?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export const PIPELINE_STAGES: {
  id: PipelineStage;
  label: string;
  shortLabel: string;
  color: string;
  badgeClass: string;
}[] = [
  {
    id: 'nuevo',
    label: 'Nuevo',
    shortLabel: 'Nuevo',
    color: '#38bdf8',
    badgeClass: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  },
  {
    id: 'contactado',
    label: 'Contactado',
    shortLabel: 'Contactado',
    color: '#818cf8',
    badgeClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  },
  {
    id: 'en_evaluacion',
    label: 'En evaluación',
    shortLabel: 'Evaluación',
    color: '#c084fc',
    badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  },
  {
    id: 'reunion_agendada',
    label: 'Reunión agendada',
    shortLabel: 'Reunión',
    color: '#f59e0b',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  },
  {
    id: 'cotizacion_enviada',
    label: 'Cotización enviada',
    shortLabel: 'Cotización',
    color: '#0265FF',
    badgeClass: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  },
  {
    id: 'negociacion',
    label: 'Negociación',
    shortLabel: 'Negociación',
    color: '#fb923c',
    badgeClass: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  },
  {
    id: 'ganado',
    label: 'Ganado',
    shortLabel: 'Ganado',
    color: '#10b981',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  },
  {
    id: 'perdido',
    label: 'Perdido',
    shortLabel: 'Perdido',
    color: '#f43f5e',
    badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  },
];

