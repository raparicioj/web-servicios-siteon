-- ==============================================================================
-- SITE ON TECNOLOGÍA - ESQUEMA INTEGRAL CRM, CMS Y ANALÍTICA (SUPABASE / POSTGRESQL)
-- ==============================================================================
-- Instrucciones: Ejecuta este script en el SQL Editor de tu proyecto Supabase:
-- https://supabase.com/dashboard/project/wlwadurbzzhlztxrvndp/sql
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA: PROSPECTOS COMERCIALES (CRM LEADS)
CREATE TABLE IF NOT EXISTS public.siteon_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_code TEXT UNIQUE NOT NULL, -- Ej: SO-2026-0001
  full_name TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  service_slug TEXT NOT NULL,
  service_name TEXT NOT NULL,
  company_size TEXT, -- Ej: '1-10', '11-50', '51-200', '200+'
  budget_range TEXT, -- Ej: '< $500.000 CLP', '$500k - $2M CLP', '$2M - $5M CLP', '> $5M CLP', 'Por definir'
  description TEXT NOT NULL,
  referral_source TEXT, -- Ej: 'Google / Búsqueda orgánica', 'Recomendación', 'LinkedIn', 'Instagram', 'Otro'
  privacy_accepted BOOLEAN NOT NULL DEFAULT true,
  privacy_accepted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  -- Pipeline y gestión comercial
  stage TEXT NOT NULL DEFAULT 'nuevo' CHECK (stage IN (
    'nuevo',
    'contactado',
    'en_evaluacion',
    'reunion_agendada',
    'cotizacion_enviada',
    'negociacion',
    'ganado',
    'perdido'
  )),
  priority TEXT NOT NULL DEFAULT 'media' CHECK (priority IN ('baja', 'media', 'alta', 'urgente')),
  estimated_value_clp BIGINT DEFAULT 0,
  next_contact_at TIMESTAMPTZ,
  lost_reason TEXT,
  assigned_to TEXT DEFAULT 'Rodrigo Aparicio',
  tags TEXT[] DEFAULT '{}',
  -- Trazabilidad de marketing y UTM
  source_page TEXT DEFAULT '/',
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  dedup_hash TEXT,
  -- Inteligencia Comercial y Automatización (Extensible)
  ai_score INTEGER DEFAULT 70,
  ai_classification TEXT DEFAULT 'Oportunidad B2B',
  ai_summary TEXT,
  ai_suggested_action TEXT,
  -- Estado de notificaciones resilientes
  email_notification_status TEXT DEFAULT 'pending' CHECK (email_notification_status IN ('pending', 'sent', 'failed', 'skipped')),
  email_notification_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. TABLA: HISTORIAL DE INTERACCIONES Y NOTAS DEL PROSPECTO
CREATE TABLE IF NOT EXISTS public.siteon_lead_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES public.siteon_leads(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'nota',
    'llamada',
    'reunion',
    'correo',
    'whatsapp',
    'cotizacion',
    'cambio_estado',
    'sistema'
  )),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL DEFAULT 'Rodrigo Aparicio',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. TABLA: CATÁLOGO DE SERVICIOS ADMINISTRABLE
CREATE TABLE IF NOT EXISTS public.siteon_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  short_title TEXT NOT NULL,
  category TEXT NOT NULL,
  tagline TEXT NOT NULL,
  summary TEXT NOT NULL,
  problem_statement TEXT NOT NULL,
  solution_description TEXT NOT NULL,
  benefits JSONB NOT NULL DEFAULT '[]'::jsonb,
  use_cases JSONB NOT NULL DEFAULT '[]'::jsonb,
  deliverables JSONB NOT NULL DEFAULT '[]'::jsonb,
  technologies TEXT[] DEFAULT '{}',
  icon_name TEXT NOT NULL DEFAULT 'Cpu',
  featured BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 1,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. TABLA: BLOG Y RECURSOS TÉCNICOS (SEO CMS)
CREATE TABLE IF NOT EXISTS public.siteon_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  read_time_minutes INTEGER NOT NULL DEFAULT 5,
  author_name TEXT NOT NULL DEFAULT 'Rodrigo Aparicio',
  author_role TEXT NOT NULL DEFAULT 'Director de Tecnología — Site On',
  cover_gradient TEXT DEFAULT 'from-brand-600/30 via-indigo-900/20 to-slate-950',
  seo_keywords TEXT[] DEFAULT '{}',
  published BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. TABLA: CONFIGURACIÓN CENTRALIZADA DE LA PLATAFORMA Y WHATSAPP
CREATE TABLE IF NOT EXISTS public.siteon_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  company_name TEXT NOT NULL DEFAULT 'Site On Tecnología',
  commercial_slogan TEXT NOT NULL DEFAULT 'Transformamos tecnología en soluciones que impulsan tu negocio',
  whatsapp_number TEXT NOT NULL DEFAULT '56958324650',
  whatsapp_display TEXT NOT NULL DEFAULT '+56 9 5832 4650',
  whatsapp_tooltip TEXT NOT NULL DEFAULT '¿Hablamos de tu proyecto?',
  whatsapp_default_message TEXT NOT NULL DEFAULT 'Hola, llegué a Site On y quisiera recibir información sobre sus servicios tecnológicos.',
  contact_email TEXT NOT NULL DEFAULT 'contacto@siteon.cl',
  notification_email TEXT NOT NULL DEFAULT 'contacto@siteon.cl',
  city TEXT NOT NULL DEFAULT 'Viña del Mar',
  region TEXT NOT NULL DEFAULT 'Región de Valparaíso',
  country TEXT NOT NULL DEFAULT 'Chile',
  linkedin_url TEXT DEFAULT 'https://www.linkedin.com',
  instagram_url TEXT DEFAULT 'https://instagram.com/siteontecnologia',
  facebook_url TEXT DEFAULT 'https://www.facebook.com/profile.php?id=100086742518173',
  ga4_measurement_id TEXT DEFAULT '',
  resend_enabled BOOLEAN NOT NULL DEFAULT true,
  webhook_enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. TABLA: ANALÍTICA COMERCIAL Y EVENTOS DE CONVERSIÓN
CREATE TABLE IF NOT EXISTS public.siteon_analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL CHECK (event_type IN (
    'whatsapp_click',
    'form_submission',
    'quote_request',
    'service_view',
    'cta_click'
  )),
  page_path TEXT NOT NULL,
  service_slug TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. TABLA: REGISTRO DE AUDITORÍA DE SEGURIDAD ADMINISTRATIVA
CREATE TABLE IF NOT EXISTS public.siteon_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_email TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  ip_hint TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. ÍNDICES DE RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_siteon_leads_stage ON public.siteon_leads(stage);
CREATE INDEX IF NOT EXISTS idx_siteon_leads_created_at ON public.siteon_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_siteon_leads_service ON public.siteon_leads(service_slug);
CREATE INDEX IF NOT EXISTS idx_siteon_leads_email ON public.siteon_leads(email);
CREATE INDEX IF NOT EXISTS idx_siteon_lead_activities_lead ON public.siteon_lead_activities(lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_siteon_analytics_type_date ON public.siteon_analytics_events(event_type, created_at DESC);

-- 9. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.siteon_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.siteon_lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.siteon_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.siteon_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.siteon_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.siteon_analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.siteon_audit_logs ENABLE ROW LEVEL SECURITY;

-- Lectura pública para catálogo de servicios, artículos publicados y configuración pública
CREATE POLICY "Public read active services" ON public.siteon_services
  FOR SELECT USING (active = true);

CREATE POLICY "Public read published posts" ON public.siteon_posts
  FOR SELECT USING (published = true);

CREATE POLICY "Public read settings" ON public.siteon_settings
  FOR SELECT USING (true);

-- Inserción pública controlada para captación de prospectos y eventos de conversión
CREATE POLICY "Public insert leads" ON public.siteon_leads
  FOR INSERT WITH CHECK (privacy_accepted = true);

CREATE POLICY "Public insert analytics events" ON public.siteon_analytics_events
  FOR INSERT WITH CHECK (true);

-- Acceso administrativo completo para usuarios autenticados o Service Role
CREATE POLICY "Admin full access leads" ON public.siteon_leads
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access activities" ON public.siteon_lead_activities
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access services" ON public.siteon_services
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access posts" ON public.siteon_posts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access settings" ON public.siteon_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access analytics" ON public.siteon_analytics_events
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access audit_logs" ON public.siteon_audit_logs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT ON public.siteon_leads TO anon;
GRANT SELECT, INSERT ON public.siteon_analytics_events TO anon;
GRANT SELECT ON public.siteon_services, public.siteon_posts, public.siteon_settings TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;



-- ==============================================================================
-- 10. EXTENSIÓN COMERCIAL MODULAR: CLIENTES, COTIZACIONES, CONTRATOS Y FACTURACIÓN
-- (Arquitectura preparada desde el Día 1 para escalar sin reconstruir el CRM)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.siteon_clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES public.siteon_leads(id) ON DELETE SET NULL,
  client_code TEXT UNIQUE NOT NULL, -- Ej: CLI-2026-0001
  company_name TEXT NOT NULL,
  rut_empresa TEXT,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  active_service TEXT NOT NULL,
  monthly_retainer_uf NUMERIC(10,2) DEFAULT 0,
  contract_value_clp BIGINT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'activo' CHECK (status IN ('activo', 'onboarding', 'pausado', 'finalizado')),
  renewal_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.siteon_quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_number TEXT UNIQUE NOT NULL, -- Ej: COT-2026-0001
  lead_id UUID REFERENCES public.siteon_leads(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.siteon_clients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal_clp BIGINT NOT NULL DEFAULT 0,
  tax_clp BIGINT NOT NULL DEFAULT 0,
  total_clp BIGINT NOT NULL DEFAULT 0,
  total_uf NUMERIC(10,2),
  status TEXT NOT NULL DEFAULT 'enviada' CHECK (status IN ('borrador', 'enviada', 'aceptada', 'rechazada', 'vencida')),
  valid_until DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.siteon_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT NOT NULL,
  client_id UUID REFERENCES public.siteon_clients(id) ON DELETE CASCADE,
  quote_id UUID REFERENCES public.siteon_quotes(id) ON DELETE SET NULL,
  amount_clp BIGINT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'pagada', 'vencida', 'anulada')),
  due_date DATE,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.siteon_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.siteon_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.siteon_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access clients" ON public.siteon_clients
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access quotes" ON public.siteon_quotes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access invoices" ON public.siteon_invoices
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
