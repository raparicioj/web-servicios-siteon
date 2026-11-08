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
  quote_details?: QuoteConfiguration | null;
  created_at: string;
  updated_at: string;
  activities?: CRMActivity[];
}

export interface PricingPlan {
  id: string;
  slug: 'site-on-start' | 'site-on-business' | 'site-on-business-pro' | 'site-on-enterprise' | string;
  name: string;
  badge?: string;
  tagline: string;
  price_uf: number;
  is_from_price: boolean;
  reference_clp: number;
  max_users: number;
  included_computers: number;
  included_servers: number;
  includes_m365_workspace: boolean;
  includes_monitoring: boolean;
  includes_cloud_hybrid: boolean;
  onsite_visits_summary: string;
  features: string[];
  cta_label: string;
  recommended: boolean;
  active: boolean;
  sort_order: number;
}

export interface PricingAddonRates {
  extra_user_uf: number;
  extra_computer_uf: number;
  managed_server_uf: number;
  advanced_monitoring_uf: number;
  extra_visit_uf: number;
  cloud_management_uf: number;
  automation_ai_uf: number;
}

export interface PricingComparisonRow {
  id: string;
  feature_name: string;
  category: 'Cobertura & Soporte' | 'Infraestructura & Cloud' | 'Gestión & SLA';
  tooltip?: string;
  values: {
    'site-on-start': string | boolean;
    'site-on-business': string | boolean;
    'site-on-business-pro': string | boolean;
    'site-on-enterprise': string | boolean;
    [key: string]: string | boolean;
  };
}

export interface PricingConfig {
  id: string;
  uf_mode: 'official_auto' | 'manual_reference';
  uf_value_clp: number;
  uf_last_updated: string;
  uf_source_label: string;
  iva_percentage: number;
  promo_active: boolean;
  promo_text: string;
  promo_discount_pct: number;
  section_badge: string;
  section_title: string;
  section_subtitle: string;
  legal_disclaimer: string;
  support_hours: string;
  onsite_coverage_area: string;
  addon_rates: PricingAddonRates;
  plans: PricingPlan[];
  comparison_rows: PricingComparisonRow[];
  exclusions: string[];
  hiring_conditions: string[];
  updated_at: string;
}

export interface QuoteConfiguration {
  source: 'plan_card' | 'smart_quoter';
  recommended_plan_slug: string;
  recommended_plan_name: string;
  users_count: number;
  computers_count: number;
  servers_count: number;
  branches_count: number;
  productivity_suite: 'none' | 'microsoft_365' | 'google_workspace' | 'both';
  support_modality: 'remote_only' | 'remote_and_scheduled_onsite' | 'intensive_onsite';
  requires_monitoring: boolean;
  requires_cloud: boolean;
  requires_automation_ai: boolean;
  base_price_uf: number;
  addons_uf: number;
  addons_breakdown: {
    label: string;
    uf: number;
    clp: number;
    included_in_plan: boolean;
  }[];
  net_uf: number;
  net_clp: number;
  iva_uf: number;
  iva_clp: number;
  total_uf_with_iva: number;
  total_clp_with_iva: number;
  uf_rate_used: number;
  uf_date_used: string;
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

