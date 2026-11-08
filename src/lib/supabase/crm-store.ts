import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  DEFAULT_PLATFORM_SETTINGS,
  INITIAL_BLOG_POSTS,
  INITIAL_SERVICES,
} from '@/data/siteon-catalog';
import {
  ActivityType,
  AnalyticsEvent,
  BlogPost,
  CRMActivity,
  CRMLead,
  LeadPriority,
  PipelineStage,
  PlatformSettings,
  ServiceItem,
} from '@/types/siteon';

const PARTITION_ID = 'siteon_crm_v1';

let serverClient: SupabaseClient | null = null;

// In-memory runtime fallback if environment variables are not yet configured in the hosting platform
const memoryLeads = new Map<string, CRMLead>();
const memoryActivities = new Map<string, CRMActivity>();
let memorySettings: PlatformSettings = { ...DEFAULT_PLATFORM_SETTINGS };
const memoryServices = new Map<string, ServiceItem>();
const memoryPosts = new Map<string, BlogPost>();
const memoryAnalytics: AnalyticsEvent[] = [];

export function getServerSupabase(): SupabaseClient | null {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    '';
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    '';

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  if (!serverClient) {
    try {
      serverClient = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    } catch (err) {
      console.error('[SiteOn Supabase] Error al inicializar cliente Supabase:', err);
      return null;
    }
  }
  return serverClient;
}

function isMissingTableError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  const code = error.code || '';
  const msg = (error.message || '').toLowerCase();
  return (
    code === 'PGRST205' ||
    code === '42P01' ||
    msg.includes('could not find the table') ||
    msg.includes('relation') ||
    msg.includes('does not exist')
  );
}

// ============================================================================
// CAPA DE PERSISTENCIA RESILIENTE EN SUPABASE (TABLA NATIVA + PARTICIÓN CLOUD)
// ============================================================================

async function upsertPartitionRecord(
  id: string,
  recordType:
    | 'siteon_lead'
    | 'siteon_activity'
    | 'siteon_setting'
    | 'siteon_post'
    | 'siteon_service'
    | 'siteon_analytics'
    | 'siteon_audit',
  entityId: string,
  title: string,
  payload: unknown
): Promise<boolean> {
  const supabase = getServerSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('activity_logs').upsert({
      id,
      couple_id: PARTITION_ID,
      user_id: recordType,
      user_name: 'SiteOn Platform',
      action: recordType,
      entity_id: entityId,
      entity_title: title,
      description: JSON.stringify(payload),
      timestamp: new Date().toISOString(),
    });
    if (error) {
      console.error(`[SiteOn Supabase] Error en upsertPartitionRecord (${recordType}):`, error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

async function listPartitionRecords<T>(
  recordType:
    | 'siteon_lead'
    | 'siteon_activity'
    | 'siteon_setting'
    | 'siteon_post'
    | 'siteon_service'
    | 'siteon_analytics'
    | 'siteon_audit',
  limit = 500
): Promise<T[]> {
  const supabase = getServerSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('couple_id', PARTITION_ID)
      .eq('user_id', recordType)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error || !data) {
      return [];
    }

    const parsed: T[] = [];
    for (const row of data) {
      try {
        const item = JSON.parse(row.description) as T;
        parsed.push(item);
      } catch {
        // ignore malformed entry
      }
    }
    return parsed;
  } catch {
    return [];
  }
}

async function deletePartitionRecord(id: string): Promise<boolean> {
  const supabase = getServerSupabase();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('activity_logs')
      .delete()
      .eq('couple_id', PARTITION_ID)
      .eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

// ============================================================================
// 1. GESTIÓN DE PROSPECTOS (CRM LEADS)
// ============================================================================

export async function listLeads(): Promise<{ leads: CRMLead[]; storageMode: 'native_sql' | 'supabase_partition' }> {
  const supabase = getServerSupabase();
  if (!supabase) {
    const fallbackLeads = Array.from(memoryLeads.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return { leads: fallbackLeads, storageMode: 'supabase_partition' };
  }

  try {
    const { data, error } = await supabase
      .from('siteon_leads')
      .select('*, activities:siteon_lead_activities(*)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      return { leads: data as CRMLead[], storageMode: 'native_sql' };
    }

    if (isMissingTableError(error)) {
      const [leads, activities] = await Promise.all([
        listPartitionRecords<CRMLead>('siteon_lead', 500),
        listPartitionRecords<CRMActivity>('siteon_activity', 1000),
      ]);

      const activitiesByLead = new Map<string, CRMActivity[]>();
      for (const act of activities) {
        const list = activitiesByLead.get(act.lead_id) || [];
        list.push(act);
        activitiesByLead.set(act.lead_id, list);
      }

      const enriched = leads
        .map((l) => ({
          ...l,
          activities: (activitiesByLead.get(l.id) || []).sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          ),
        }))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return { leads: enriched, storageMode: 'supabase_partition' };
    }
  } catch (err) {
    console.error('[SiteOn Supabase] Error en listLeads:', err);
  }

  return { leads: Array.from(memoryLeads.values()), storageMode: 'supabase_partition' };
}

export async function getLeadById(id: string): Promise<CRMLead | null> {
  const { leads } = await listLeads();
  return leads.find((l) => l.id === id) || memoryLeads.get(id) || null;
}

export async function findRecentDuplicateLead(email: string, serviceSlug: string): Promise<CRMLead | null> {
  const { leads } = await listLeads();
  const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
  return (
    leads.find(
      (l) =>
        l.email.toLowerCase() === email.toLowerCase() &&
        l.service_slug === serviceSlug &&
        new Date(l.created_at).getTime() > tenMinutesAgo
    ) || null
  );
}

export async function createLead(lead: CRMLead, initialActivity: CRMActivity): Promise<CRMLead> {
  const enrichedLead: CRMLead = { ...lead, activities: [initialActivity] };
  memoryLeads.set(lead.id, enrichedLead);
  memoryActivities.set(initialActivity.id, initialActivity);

  const supabase = getServerSupabase();
  if (!supabase) {
    return enrichedLead;
  }

  try {
    const { data, error } = await supabase
      .from('siteon_leads')
      .insert({
        id: lead.id,
        lead_code: lead.lead_code,
        full_name: lead.full_name,
        company: lead.company || null,
        email: lead.email,
        phone: lead.phone,
        service_slug: lead.service_slug,
        service_name: lead.service_name,
        company_size: lead.company_size || null,
        budget_range: lead.budget_range || null,
        description: lead.description,
        referral_source: lead.referral_source || null,
        privacy_accepted: lead.privacy_accepted,
        privacy_accepted_at: lead.privacy_accepted_at,
        stage: lead.stage,
        priority: lead.priority,
        estimated_value_clp: lead.estimated_value_clp,
        next_contact_at: lead.next_contact_at || null,
        lost_reason: lead.lost_reason || null,
        assigned_to: lead.assigned_to,
        tags: lead.tags,
        source_page: lead.source_page,
        utm_source: lead.utm_source || null,
        utm_medium: lead.utm_medium || null,
        utm_campaign: lead.utm_campaign || null,
        utm_term: lead.utm_term || null,
        utm_content: lead.utm_content || null,
        dedup_hash: lead.dedup_hash || null,
        ai_score: lead.ai_score,
        ai_classification: lead.ai_classification,
        ai_summary: lead.ai_summary,
        ai_suggested_action: lead.ai_suggested_action,
        email_notification_status: lead.email_notification_status,
        email_notification_error: lead.email_notification_error || null,
        created_at: lead.created_at,
        updated_at: lead.updated_at,
      })
      .select()
      .single();

    if (!error && data) {
      await supabase.from('siteon_lead_activities').insert({
        id: initialActivity.id,
        lead_id: lead.id,
        activity_type: initialActivity.activity_type,
        title: initialActivity.title,
        content: initialActivity.content,
        author_name: initialActivity.author_name,
        metadata: initialActivity.metadata || {},
        created_at: initialActivity.created_at,
      });
      return { ...(data as CRMLead), activities: [initialActivity] };
    }

    // Fallback resiliente en partición Supabase Cloud
    await upsertPartitionRecord(`lead_${lead.id}`, 'siteon_lead', lead.id, lead.full_name, lead);
    await upsertPartitionRecord(
      `act_${initialActivity.id}`,
      'siteon_activity',
      lead.id,
      initialActivity.title,
      initialActivity
    );
  } catch (err) {
    console.error('[SiteOn Supabase] Error en createLead:', err);
  }

  return enrichedLead;
}

export async function updateLead(
  leadId: string,
  updates: Partial<{
    full_name: string;
    company: string;
    email: string;
    phone: string;
    service_slug: string;
    service_name: string;
    company_size: string;
    budget_range: string;
    description: string;
    stage: PipelineStage;
    priority: LeadPriority;
    estimated_value_clp: number;
    next_contact_at: string | null;
    lost_reason: string | null;
    assigned_to: string;
    tags: string[];
    email_notification_status: 'pending' | 'sent' | 'failed' | 'skipped';
    email_notification_error: string | null;
  }>,
  actorName = 'Rodrigo Aparicio'
): Promise<CRMLead | null> {
  const existing = await getLeadById(leadId);
  if (!existing) return null;

  const updatedLead: CRMLead = {
    ...existing,
    ...updates,
    updated_at: new Date().toISOString(),
  };
  memoryLeads.set(leadId, updatedLead);

  const supabase = getServerSupabase();
  if (supabase) {
    try {
      const { error } = await supabase
        .from('siteon_leads')
        .update({
          ...updates,
          updated_at: updatedLead.updated_at,
        })
        .eq('id', leadId);

      if (error && isMissingTableError(error)) {
        const { activities: _act, ...leadWithoutActivities } = updatedLead;
        await upsertPartitionRecord(
          `lead_${leadId}`,
          'siteon_lead',
          leadId,
          updatedLead.full_name,
          leadWithoutActivities
        );
      }
    } catch (err) {
      console.error('[SiteOn Supabase] Error en updateLead:', err);
    }
  }

  // Si cambió el estado del pipeline, registrar actividad automática
  if (updates.stage && updates.stage !== existing.stage) {
    await addLeadActivity({
      lead_id: leadId,
      activity_type: 'cambio_estado',
      title: `Cambio de etapa: ${existing.stage.toUpperCase()} → ${updates.stage.toUpperCase()}`,
      content: updates.lost_reason
        ? `Estado actualizado a "${updates.stage}". Motivo registrado: ${updates.lost_reason}`
        : `El prospecto avanzó de "${existing.stage}" a "${updates.stage}".`,
      author_name: actorName,
    });
  }

  return await getLeadById(leadId);
}

export async function deleteLead(leadId: string): Promise<boolean> {
  memoryLeads.delete(leadId);
  const supabase = getServerSupabase();
  if (!supabase) return true;

  try {
    const { error } = await supabase.from('siteon_leads').delete().eq('id', leadId);
    if (error && isMissingTableError(error)) {
      return await deletePartitionRecord(`lead_${leadId}`);
    }
    return !error;
  } catch {
    return false;
  }
}

export async function addLeadActivity(input: {
  lead_id: string;
  activity_type: ActivityType;
  title: string;
  content: string;
  author_name?: string;
  metadata?: Record<string, unknown>;
}): Promise<CRMActivity> {
  const activity: CRMActivity = {
    id: crypto.randomUUID(),
    lead_id: input.lead_id,
    activity_type: input.activity_type,
    title: input.title,
    content: input.content,
    author_name: input.author_name || 'Rodrigo Aparicio',
    metadata: input.metadata || {},
    created_at: new Date().toISOString(),
  };

  memoryActivities.set(activity.id, activity);
  const memLead = memoryLeads.get(input.lead_id);
  if (memLead) {
    memLead.activities = [activity, ...(memLead.activities || [])];
    memoryLeads.set(input.lead_id, memLead);
  }

  const supabase = getServerSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from('siteon_lead_activities').insert(activity);
      if (error && isMissingTableError(error)) {
        await upsertPartitionRecord(
          `act_${activity.id}`,
          'siteon_activity',
          activity.lead_id,
          activity.title,
          activity
        );
      }
    } catch (err) {
      console.error('[SiteOn Supabase] Error en addLeadActivity:', err);
    }
  }

  return activity;
}

// ============================================================================
// 2. CONFIGURACIÓN CENTRALIZADA (WHATSAPP, DATOS COMERCIALES, ANALÍTICA)
// ============================================================================

export async function getPlatformSettings(): Promise<PlatformSettings> {
  const supabase = getServerSupabase();
  if (!supabase) {
    return memorySettings;
  }

  try {
    const { data, error } = await supabase
      .from('siteon_settings')
      .select('*')
      .eq('id', 'default')
      .single();

    if (!error && data) {
      return { ...DEFAULT_PLATFORM_SETTINGS, ...(data as PlatformSettings) };
    }

    if (isMissingTableError(error)) {
      const records = await listPartitionRecords<PlatformSettings>('siteon_setting', 5);
      if (records.length > 0) {
        return { ...DEFAULT_PLATFORM_SETTINGS, ...records[0] };
      }
    }
  } catch (err) {
    console.error('[SiteOn Supabase] Error en getPlatformSettings:', err);
  }

  return memorySettings;
}

export async function updatePlatformSettings(
  updates: Partial<PlatformSettings>
): Promise<PlatformSettings> {
  const current = await getPlatformSettings();
  const nextSettings: PlatformSettings = {
    ...current,
    ...updates,
    id: 'default',
    updated_at: new Date().toISOString(),
  };
  memorySettings = nextSettings;

  const supabase = getServerSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from('siteon_settings').upsert(nextSettings);

      if (error && isMissingTableError(error)) {
        await upsertPartitionRecord(
          'setting_default',
          'siteon_setting',
          'default',
          'Platform Settings',
          nextSettings
        );
      }
    } catch (err) {
      console.error('[SiteOn Supabase] Error en updatePlatformSettings:', err);
    }
  }

  return nextSettings;
}

// ============================================================================
// 3. SERVICIOS Y BLOG / RECURSOS (CMS ADMINISTRABLE)
// ============================================================================

export async function listServices(includeInactive = false): Promise<ServiceItem[]> {
  let customServices: ServiceItem[] = Array.from(memoryServices.values());

  const supabase = getServerSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('siteon_services')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        customServices = data as ServiceItem[];
      } else if (isMissingTableError(error)) {
        customServices = await listPartitionRecords<ServiceItem>('siteon_service', 50);
      }
    } catch (err) {
      console.error('[SiteOn Supabase] Error en listServices:', err);
    }
  }

  const mergedMap = new Map<string, ServiceItem>();
  for (const s of INITIAL_SERVICES) {
    mergedMap.set(s.slug, s);
  }
  for (const s of customServices) {
    mergedMap.set(s.slug, s);
  }

  const all = Array.from(mergedMap.values()).sort((a, b) => a.sort_order - b.sort_order);
  return includeInactive ? all : all.filter((s) => s.active);
}

export async function getServiceBySlug(slug: string): Promise<ServiceItem | null> {
  const services = await listServices(true);
  return services.find((s) => s.slug === slug) || null;
}

export async function saveServiceItem(service: ServiceItem): Promise<ServiceItem> {
  memoryServices.set(service.slug, service);
  const supabase = getServerSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from('siteon_services').upsert(service, { onConflict: 'slug' });
      if (error && isMissingTableError(error)) {
        await upsertPartitionRecord(
          `srv_${service.slug}`,
          'siteon_service',
          service.slug,
          service.title,
          service
        );
      }
    } catch (err) {
      console.error('[SiteOn Supabase] Error en saveServiceItem:', err);
    }
  }
  return service;
}

export async function listBlogPosts(includeDrafts = false): Promise<BlogPost[]> {
  let customPosts: BlogPost[] = Array.from(memoryPosts.values());

  const supabase = getServerSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('siteon_posts')
        .select('*')
        .order('published_at', { ascending: false });

      if (!error && data && data.length > 0) {
        customPosts = data as BlogPost[];
      } else if (isMissingTableError(error)) {
        customPosts = await listPartitionRecords<BlogPost>('siteon_post', 100);
      }
    } catch (err) {
      console.error('[SiteOn Supabase] Error en listBlogPosts:', err);
    }
  }

  const mergedMap = new Map<string, BlogPost>();
  for (const p of INITIAL_BLOG_POSTS) {
    mergedMap.set(p.slug, p);
  }
  for (const p of customPosts) {
    mergedMap.set(p.slug, p);
  }

  const all = Array.from(mergedMap.values()).sort(
    (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  );
  return includeDrafts ? all : all.filter((p) => p.published);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await listBlogPosts(true);
  return posts.find((p) => p.slug === slug) || null;
}

export async function saveBlogPost(post: BlogPost): Promise<BlogPost> {
  memoryPosts.set(post.slug, post);
  const supabase = getServerSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from('siteon_posts').upsert(post, { onConflict: 'slug' });
      if (error && isMissingTableError(error)) {
        await upsertPartitionRecord(`post_${post.slug}`, 'siteon_post', post.slug, post.title, post);
      }
    } catch (err) {
      console.error('[SiteOn Supabase] Error en saveBlogPost:', err);
    }
  }
  return post;
}

// ============================================================================
// 4. ANALÍTICA DE CONVERSIÓN Y AUDITORÍA DE SEGURIDAD
// ============================================================================

export async function recordAnalyticsEvent(
  event: Omit<AnalyticsEvent, 'id' | 'created_at'>
): Promise<void> {
  const fullEvent: AnalyticsEvent = {
    ...event,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  memoryAnalytics.unshift(fullEvent);

  const supabase = getServerSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from('siteon_analytics_events').insert(fullEvent);
      if (error && isMissingTableError(error)) {
        await upsertPartitionRecord(
          `ev_${fullEvent.id}`,
          'siteon_analytics',
          fullEvent.event_type,
          fullEvent.page_path,
          fullEvent
        );
      }
    } catch {
      // ignore analytics logging errors
    }
  }
}

export async function listAnalyticsEvents(limit = 300): Promise<AnalyticsEvent[]> {
  const supabase = getServerSupabase();
  if (!supabase) {
    return memoryAnalytics.slice(0, limit);
  }

  try {
    const { data, error } = await supabase
      .from('siteon_analytics_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (!error && data) {
      return data as AnalyticsEvent[];
    }
    if (isMissingTableError(error)) {
      return await listPartitionRecords<AnalyticsEvent>('siteon_analytics', limit);
    }
  } catch {
    // fallback
  }
  return memoryAnalytics.slice(0, limit);
}

export async function recordAuditLog(
  actorEmail: string,
  action: string,
  targetType: string,
  targetId?: string,
  details?: Record<string, unknown>
): Promise<void> {
  const entry = {
    id: crypto.randomUUID(),
    actor_email: actorEmail,
    action,
    target_type: targetType,
    target_id: targetId || null,
    details: details || {},
    created_at: new Date().toISOString(),
  };
  const supabase = getServerSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from('siteon_audit_logs').insert(entry);
      if (error && isMissingTableError(error)) {
        await upsertPartitionRecord(`aud_${entry.id}`, 'siteon_audit', action, actorEmail, entry);
      }
    } catch {
      // ignore audit log errors
    }
  }
}
