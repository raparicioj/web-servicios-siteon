'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  Database,
  Download,
  ExternalLink,
  FolderKanban,
  Layers,
  Loader2,
  Lock,
  LogOut,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import {
  ActivityType,
  AnalyticsEvent,
  BlogPost,
  CRMLead,
  LeadPriority,
  PIPELINE_STAGES,
  PipelineStage,
  PlatformSettings,
  ServiceItem,
} from '@/types/siteon';
import { generateCommercialFollowUpDraft } from '@/lib/ai/lead-intelligence';
import { SiteOnLogo } from '@/components/layout/SiteOnLogo';

type AdminTab =
  | 'dashboard'
  | 'kanban'
  | 'prospectos'
  | 'clientes_erp'
  | 'servicios'
  | 'blog'
  | 'configuracion';

const STAGE_PROGRESS: Record<PipelineStage, number> = {
  nuevo: 15,
  contactado: 30,
  en_evaluacion: 45,
  reunion_agendada: 60,
  cotizacion_enviada: 75,
  negociacion: 90,
  ganado: 100,
  perdido: 0,
};

const STAGE_DOT_COLORS: Record<PipelineStage, string> = {
  nuevo: 'bg-sky-400',
  contactado: 'bg-indigo-400',
  en_evaluacion: 'bg-cyan-400',
  reunion_agendada: 'bg-purple-400',
  cotizacion_enviada: 'bg-amber-400',
  negociacion: 'bg-orange-400',
  ganado: 'bg-emerald-400',
  perdido: 'bg-rose-400',
};

export function AdminCrmWorkspace({
  initialTab = 'kanban',
}: {
  initialTab?: AdminTab;
}) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [loginEmail, setLoginEmail] = useState('contacto@siteon.cl');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [loadingData, setLoadingData] = useState(false);
  const [storageMode, setStorageMode] = useState<'native_sql' | 'supabase_partition'>(
    'supabase_partition'
  );
  const [leads, setLeads] = useState<CRMLead[]>([]);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsEvent[]>([]);
  const [sqlMigration, setSqlMigration] = useState('');

  // Filtros y búsqueda de prospectos
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('todos');
  const [serviceFilter, setServiceFilter] = useState<string>('todos');
  const [dateFilter, setDateFilter] = useState<string>('todos');
  const [sortBy, setSortBy] = useState<'newest' | 'value_desc' | 'score_desc'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Drag & Drop Kanban
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<PipelineStage | null>(null);

  // Ficha individual del prospecto seleccionado
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const selectedLead = useMemo(
    () => leads.find((l) => l.id === selectedLeadId) || null,
    [leads, selectedLeadId]
  );

  // Formulario de nueva actividad dentro de la ficha
  const [activityType, setActivityType] = useState<ActivityType>('nota');
  const [activityTitle, setActivityTitle] = useState('');
  const [activityContent, setActivityContent] = useState('');
  const [savingActivity, setSavingActivity] = useState(false);

  // Modal de creación manual de prospecto
  const [newLeadModalOpen, setNewLeadModalOpen] = useState(false);
  const [manualLead, setManualLead] = useState({
    full_name: '',
    company: '',
    email: '',
    phone: '',
    service_slug: 'soporte-tecnico',
    company_size: 'Pyme (2 a 15 personas)',
    budget_range: '$250.000 - $800.000 CLP',
    description: '',
  });

  // Editor de artículos de blog
  const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);
  const [statusToast, setStatusToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setStatusToast(msg);
    setTimeout(() => setStatusToast(null), 3500);
  };

  const fetchAllAdminData = useCallback(async () => {
    setLoadingData(true);
    try {
      const res = await fetch('/api/admin/cms');
      if (res.status === 401) {
        setAuthenticated(false);
        setLoadingData(false);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setAuthenticated(true);
        setStorageMode(data.storageMode || 'supabase_partition');
        setLeads(data.leads || []);
        setSettings(data.settings || null);
        setServices(data.services || []);
        setPosts(data.posts || []);
        setAnalytics(data.analytics || []);
        setSqlMigration(data.sqlMigration || '');
      }
    } catch {
      // ignore
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchAllAdminData();
  }, [fetchAllAdminData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || 'Error de autenticación');
        setLoginLoading(false);
        return;
      }
      setAuthenticated(true);
      setLoginLoading(false);
      fetchAllAdminData();
    } catch {
      setLoginError('Error de conexión con el servidor');
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    setAuthenticated(false);
  };

  const handleUpdateLead = async (
    leadId: string,
    updates: Record<string, unknown>,
    toastMessage?: string
  ) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? ({ ...l, ...updates, updated_at: new Date().toISOString() } as CRMLead)
          : l
      )
    );

    const res = await fetch(`/api/leads/${leadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.lead) {
        setLeads((prev) => prev.map((l) => (l.id === leadId ? data.lead : l)));
      }
      if (toastMessage) showToast(toastMessage);
    }
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !activityContent.trim()) return;
    setSavingActivity(true);

    const res = await fetch(`/api/leads/${selectedLead.id}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        activity_type: activityType,
        title:
          activityTitle.trim() ||
          `Registro de ${activityType.toUpperCase()} comercial`,
        content: activityContent.trim(),
      }),
    });

    setSavingActivity(false);
    if (res.ok) {
      const data = await res.json();
      if (data.lead) {
        setLeads((prev) =>
          prev.map((l) => (l.id === selectedLead.id ? data.lead : l))
        );
      }
      setActivityTitle('');
      setActivityContent('');
      showToast('Actividad registrada en el historial del prospecto');
    }
  };

  const handleCreateManualLead = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...manualLead,
        privacy_accepted: true,
        referral_source: 'Ingreso Manual CRM',
        source_page: '/admin/crm',
      }),
    });
    if (res.ok) {
      setNewLeadModalOpen(false);
      setManualLead({
        full_name: '',
        company: '',
        email: '',
        phone: '',
        service_slug: 'soporte-tecnico',
        company_size: 'Pyme (2 a 15 personas)',
        budget_range: '$250.000 - $800.000 CLP',
        description: '',
      });
      await fetchAllAdminData();
      showToast('Prospecto creado exitosamente en el CRM');
    }
  };

  // Estadísticas ejecutivas del Dashboard Comercial
  const metrics = useMemo(() => {
    const total = leads.length;
    const nuevos = leads.filter((l) => l.stage === 'nuevo').length;
    const enSeguimiento = leads.filter((l) =>
      ['contactado', 'en_evaluacion', 'reunion_agendada', 'negociacion'].includes(
        l.stage
      )
    ).length;
    const cotizaciones = leads.filter((l) => l.stage === 'cotizacion_enviada').length;
    const ganados = leads.filter((l) => l.stage === 'ganado').length;
    const perdidos = leads.filter((l) => l.stage === 'perdido').length;
    const conversionRate = total > 0 ? Math.round((ganados / total) * 100) : 0;

    const pipelineValueClp = leads
      .filter((l) => l.stage !== 'perdido')
      .reduce((acc, l) => acc + (Number(l.estimated_value_clp) || 0), 0);

    const wonValueClp = leads
      .filter((l) => l.stage === 'ganado')
      .reduce((acc, l) => acc + (Number(l.estimated_value_clp) || 0), 0);

    const now = Date.now();
    const pendingFollowUp = leads.filter(
      (l) =>
        !['ganado', 'perdido'].includes(l.stage) &&
        l.next_contact_at &&
        new Date(l.next_contact_at).getTime() <= now + 12 * 60 * 60 * 1000
    ).length;

    const totalActivities = leads.reduce(
      (acc, l) => acc + (l.activities?.length || 0),
      0
    );

    // Prospectos por servicio
    const byServiceMap = new Map<string, number>();
    for (const l of leads) {
      const key = l.service_name || l.service_slug;
      byServiceMap.set(key, (byServiceMap.get(key) || 0) + 1);
    }
    const byService = Array.from(byServiceMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Evolución mensual de captaciones
    const byMonthMap = new Map<string, number>();
    for (const l of leads) {
      const d = new Date(l.created_at);
      const label = d.toLocaleDateString('es-CL', { month: 'short', year: 'numeric' });
      byMonthMap.set(label, (byMonthMap.get(label) || 0) + 1);
    }
    const byMonth = Array.from(byMonthMap.entries()).map(([month, count]) => ({
      month,
      count,
    }));

    const whatsappClicks = analytics.filter(
      (e) => e.event_type === 'whatsapp_click'
    ).length;

    // Últimas actividades globales
    const recentActivities = leads
      .flatMap((l) =>
        (l.activities || []).map((a) => ({
          ...a,
          lead_name: l.full_name,
          lead_company: l.company,
          lead_id: l.id,
        }))
      )
      .sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 5);

    return {
      total,
      nuevos,
      enSeguimiento,
      cotizaciones,
      ganados,
      perdidos,
      conversionRate,
      pipelineValueClp,
      wonValueClp,
      pendingFollowUp,
      totalActivities,
      byService,
      byMonth,
      whatsappClicks,
      recentActivities,
    };
  }, [leads, analytics]);

  // Filtrado y ordenamiento de prospectos
  const filteredLeads = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const now = Date.now();

    return leads
      .filter((l) => {
        if (stageFilter !== 'todos' && l.stage !== stageFilter) return false;
        if (serviceFilter !== 'todos' && l.service_slug !== serviceFilter) return false;

        if (dateFilter === 'hoy') {
          if (now - new Date(l.created_at).getTime() > 24 * 60 * 60 * 1000) return false;
        } else if (dateFilter === '7dias') {
          if (now - new Date(l.created_at).getTime() > 7 * 24 * 60 * 60 * 1000)
            return false;
        } else if (dateFilter === '30dias') {
          if (now - new Date(l.created_at).getTime() > 30 * 24 * 60 * 60 * 1000)
            return false;
        }

        if (!q) return true;
        return (
          l.full_name.toLowerCase().includes(q) ||
          (l.company || '').toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.phone.toLowerCase().includes(q) ||
          l.lead_code.toLowerCase().includes(q) ||
          l.service_name.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'value_desc') {
          return (b.estimated_value_clp || 0) - (a.estimated_value_clp || 0);
        }
        if (sortBy === 'score_desc') {
          return (b.ai_score || 0) - (a.ai_score || 0);
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [leads, searchQuery, stageFilter, serviceFilter, dateFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / pageSize));
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Exportación CSV con BOM UTF-8
  const handleExportCsv = () => {
    const headers = [
      'Codigo',
      'Fecha Ingreso',
      'Nombre',
      'Empresa',
      'Email',
      'Telefono',
      'Servicio',
      'Etapa',
      'Prioridad',
      'Score IA',
      'Valor Estimado CLP',
      'Proximo Contacto',
      'Origen',
      'Motivo Perdida',
    ];

    const rows = filteredLeads.map((l) => [
      l.lead_code,
      new Date(l.created_at).toLocaleString('es-CL'),
      `"${(l.full_name || '').replace(/"/g, '""')}"`,
      `"${(l.company || '').replace(/"/g, '""')}"`,
      l.email,
      l.phone,
      `"${(l.service_name || '').replace(/"/g, '""')}"`,
      l.stage,
      l.priority,
      l.ai_score,
      l.estimated_value_clp || 0,
      l.next_contact_at ? new Date(l.next_contact_at).toLocaleDateString('es-CL') : '',
      `"${(l.referral_source || '').replace(/"/g, '""')}"`,
      `"${(l.lost_reason || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SiteOn_CRM_Prospectos_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Archivo CSV exportado correctamente');
  };

  // ==================== PANTALLA DE CARGA INICIAL ====================
  if (authenticated === null) {
    return (
      <div className="min-h-screen bg-[#0d2638] flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-teal-50 text-sm">
          <Loader2 className="h-5 w-5 animate-spin text-[#5eead4]" />
          <span>Verificando sesión segura del CRM Site On...</span>
        </div>
      </div>
    );
  }

  // ==================== PANTALLA DE LOGIN PRIVADO ====================
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#0d2638] flex flex-col justify-center items-center p-4 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(94,234,212,0.28),transparent_65%)]" />
        <div className="w-full max-w-md rounded-3xl border border-teal-300/30 bg-[#123249]/95 p-8 shadow-2xl backdrop-blur-xl relative z-10">
          <div className="flex items-center justify-between mb-6">
            <SiteOnLogo size="sm" showSubtitle={false} />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2dd4bf]/20 border border-[#5eead4]/40 px-3 py-1 text-xs font-extrabold text-[#99f6e4]">
              <Lock className="h-3.5 w-3.5" /> Acceso Privado CRM
            </span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">
            Site On CRM & Gestión Comercial
          </h1>
          <p className="text-xs text-teal-100/80 mb-6">
            Acceso exclusivo para administración autorizada de Site On Tecnología.
          </p>

          {loginError && (
            <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-teal-50 mb-1.5">
                Correo de Administrador Autorizado
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full rounded-xl border border-teal-300/30 bg-[#0d2638] px-3.5 py-2.5 text-sm text-white focus:border-[#5eead4] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-teal-50 mb-1.5">
                Contraseña de Seguridad
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full rounded-xl border border-teal-300/30 bg-[#0d2638] px-3.5 py-2.5 text-sm text-white focus:border-[#5eead4] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#5eead4] hover:bg-[#99f6e4] py-3 text-sm font-extrabold text-slate-950 shadow-lg shadow-teal-400/25 transition-all"
            >
              {loginLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Autenticando...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" /> Ingresar al CRM
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-teal-300/20 flex items-center justify-between text-xs text-teal-100/70">
            <Link href="/" className="hover:text-white">
              ← Volver al sitio público
            </Link>
            <span>Supabase Cloud + RLS</span>
          </div>
        </div>
      </div>
    );
  }

  const navItems: Array<{
    id: AdminTab;
    label: string;
    badge?: number;
    icon: React.ElementType;
  }> = [
    { id: 'kanban', label: 'Pipeline Kanban', badge: leads.length, icon: FolderKanban },
    { id: 'dashboard', label: 'Analítica & Forecast', icon: BarChart3 },
    { id: 'prospectos', label: 'Prospectos (Tabla)', badge: leads.length, icon: Users },
    {
      id: 'clientes_erp',
      label: 'Clientes & Contratos',
      badge: metrics.ganados,
      icon: UserCheck,
    },
    { id: 'servicios', label: 'Catálogo Servicios', icon: Layers },
    { id: 'blog', label: 'Blog & SEO', icon: BookOpen },
    { id: 'configuracion', label: 'Configuración', icon: Settings },
  ];

  // ==================== INTERFAZ PRINCIPAL DEL CRM (ESTILO FLOWRIZE / APEXCRM CALIPSO CLARO) ====================
  return (
    <div className="min-h-screen bg-[#0d2638] text-slate-100 flex">
      {/* Toast flotante de confirmación */}
      {statusToast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl border border-emerald-400/50 bg-[#123249] px-4 py-3 text-xs font-semibold text-emerald-300 shadow-2xl">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{statusToast}</span>
        </div>
      )}

      {/* ==================== SIDEBAR VERTICAL IZQUIERDO (DESKTOP) ==================== */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col justify-between border-r border-teal-300/20 bg-[#102d42] p-4 select-none">
        <div className="space-y-6">
          {/* Logo Site On */}
          <div className="flex items-center justify-between px-2 pt-1">
            <Link href="/">
              <SiteOnLogo
                size="sm"
                showSubtitle
                subtitleText="● Supabase Cloud Activo"
              />
            </Link>
          </div>

          {/* Botón Primario Rápido */}
          <button
            type="button"
            onClick={() => setNewLeadModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#5eead4] hover:bg-[#99f6e4] py-2.5 px-4 text-xs font-extrabold text-slate-950 shadow-lg shadow-teal-400/25 transition-all"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" /> Nuevo Prospecto
          </button>

          {/* Menú de Navegación */}
          <div className="space-y-1">
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-teal-200/70">
              Gestión Comercial
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold transition-all ${
                    active
                      ? 'bg-[#2dd4bf] text-slate-950 shadow-lg shadow-teal-400/25'
                      : 'text-teal-50/80 hover:text-white hover:bg-[#163d59]'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </span>
                  {item.badge !== undefined && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                        active
                          ? 'bg-slate-950/20 text-slate-950'
                          : 'bg-[#0d2638] text-[#5eead4]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer del Sidebar: Meta de Conversión y Usuario */}
        <div className="space-y-3 pt-4 border-t border-teal-300/20">
          <div className="rounded-2xl bg-[#153a54] border border-teal-300/25 p-3.5 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-teal-50 font-medium">Conversión a Clientes</span>
              <span className="font-extrabold text-[#5eead4]">
                {metrics.conversionRate}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[#0d2638] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#5eead4] to-emerald-400"
                style={{ width: `${Math.max(10, metrics.conversionRate)}%` }}
              />
            </div>
            <div className="text-[10px] text-teal-100/80">
              {metrics.ganados} clientes cerrados de {metrics.total} prospectos
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs text-teal-100/80 hover:text-white"
            >
              <span>Ver sitio web</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1 rounded-lg border border-teal-300/25 bg-[#153a54] hover:border-rose-400/50 px-2.5 py-1.5 text-xs text-teal-100 hover:text-rose-200"
            >
              <LogOut className="h-3.5 w-3.5" /> Salir
            </button>
          </div>
        </div>
      </aside>

      {/* ==================== ÁREA PRINCIPAL DERECHA ==================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar Estilo Flowrize / ApexCRM */}
        <header className="sticky top-0 z-30 border-b border-teal-300/20 bg-[#102d42]/95 backdrop-blur-xl px-4 sm:px-6 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Buscador Global */}
            <div className="relative flex-1 max-w-md min-w-[220px]">
              <Search className="h-4 w-4 text-[#5eead4] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar prospecto, empresa, código o servicio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-teal-300/25 bg-[#0d2638] pl-10 pr-4 py-2 text-xs text-white placeholder-teal-200/50 focus:border-[#5eead4] focus:outline-none"
              />
            </div>

            {/* Navegación móvil compacta */}
            <div className="flex lg:hidden items-center gap-1 overflow-x-auto max-w-full py-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold whitespace-nowrap ${
                    activeTab === item.id
                      ? 'bg-[#2dd4bf] text-slate-950'
                      : 'bg-[#153a54] text-teal-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Controles Rápidos Derecha */}
            <div className="flex items-center gap-2.5">
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="hidden sm:block rounded-xl border border-teal-300/25 bg-[#0d2638] px-3 py-2 text-xs text-white"
              >
                <option value="todos">Todos los servicios TI</option>
                {services.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.short_title}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleExportCsv}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-teal-300/25 bg-[#153a54] hover:bg-[#1c4b6b] px-3 py-2 text-xs font-semibold text-white transition-colors"
              >
                <Download className="h-3.5 w-3.5 text-[#5eead4]" /> Exportar CSV
              </button>

              <button
                type="button"
                onClick={() => setNewLeadModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#5eead4] hover:bg-[#99f6e4] px-3.5 py-2 text-xs font-extrabold text-slate-950 transition-colors"
              >
                <Plus className="h-3.5 w-3.5 stroke-[2.5]" /> Nuevo Prospecto
              </button>

              <button
                type="button"
                onClick={fetchAllAdminData}
                title="Sincronizar con Supabase"
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-teal-300/25 bg-[#153a54] text-teal-100 hover:text-white"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${loadingData ? 'animate-spin' : ''}`}
                />
              </button>
            </div>
          </div>
        </header>

        {/* Contenido Dinámico */}
        <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-x-hidden">
          {/* ==================== FILA DE 4 TARJETAS KPI CON GRÁFICOS SPARKLINE (ESTILO FLOWRIZE CALIPSO) ==================== */}
          {(activeTab === 'kanban' || activeTab === 'dashboard') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {/* KPI 1: Ingresos Cerrados & Pipeline */}
              <div className="rounded-2xl border border-teal-300/25 bg-[#123249] p-5 flex items-center justify-between gap-4 shadow-lg">
                <div>
                  <div className="text-xs font-medium text-teal-100/80">
                    Ingresos Clientes / Pipeline
                  </div>
                  <div className="text-2xl font-extrabold text-white mt-1">
                    ${(metrics.wonValueClp || metrics.pipelineValueClp).toLocaleString('es-CL')}
                  </div>
                  <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#5eead4] mt-1">
                    <span>▲ +24%</span>
                    <span className="text-teal-200/70">
                      ({metrics.ganados} clientes cerrados)
                    </span>
                  </div>
                </div>
                <svg className="w-24 h-12 shrink-0" viewBox="0 0 100 45">
                  <defs>
                    <linearGradient id="sparkBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#5eead4" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#5eead4" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 38 Q 20 32, 35 24 T 70 16 T 100 6 L 100 45 L 0 45 Z"
                    fill="url(#sparkBlue)"
                  />
                  <path
                    d="M0 38 Q 20 32, 35 24 T 70 16 T 100 6"
                    fill="none"
                    stroke="#5eead4"
                    strokeWidth="2.5"
                  />
                </svg>
              </div>

              {/* KPI 2: Prospectos Activos */}
              <div className="rounded-2xl border border-teal-300/25 bg-[#123249] p-5 flex items-center justify-between gap-4 shadow-lg">
                <div>
                  <div className="text-xs font-medium text-teal-100/80">
                    Prospectos en Embudo
                  </div>
                  <div className="text-2xl font-extrabold text-white mt-1">
                    {metrics.total}
                  </div>
                  <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#67e8f9] mt-1">
                    <span>● {metrics.nuevos} nuevos</span>
                    <span className="text-teal-200/70">
                      • {metrics.cotizaciones} cotizados
                    </span>
                  </div>
                </div>
                <svg className="w-24 h-12 shrink-0" viewBox="0 0 100 45">
                  <defs>
                    <linearGradient id="sparkGreen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#67e8f9" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 35 Q 25 28, 45 30 T 75 14 T 100 8 L 100 45 L 0 45 Z"
                    fill="url(#sparkGreen)"
                  />
                  <path
                    d="M0 35 Q 25 28, 45 30 T 75 14 T 100 8"
                    fill="none"
                    stroke="#67e8f9"
                    strokeWidth="2.5"
                  />
                </svg>
              </div>

              {/* KPI 3: Tasa de Conversión a Clientes */}
              <div className="rounded-2xl border border-teal-300/25 bg-[#123249] p-5 flex items-center justify-between gap-4 shadow-lg">
                <div>
                  <div className="text-xs font-medium text-teal-100/80">
                    Conversión a Clientes
                  </div>
                  <div className="text-2xl font-extrabold text-[#5eead4] mt-1">
                    {metrics.conversionRate}%
                  </div>
                  <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 mt-1">
                    <span>Meta comercial: 35%</span>
                  </div>
                </div>
                <svg className="w-24 h-12 shrink-0" viewBox="0 0 100 45">
                  <defs>
                    <linearGradient id="sparkAmber" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 40 Q 30 34, 50 22 T 85 18 T 100 10 L 100 45 L 0 45 Z"
                    fill="url(#sparkAmber)"
                  />
                  <path
                    d="M0 40 Q 30 34, 50 22 T 85 18 T 100 10"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                  />
                </svg>
              </div>

              {/* KPI 4: Llamadas, Seguimientos & Clics WhatsApp */}
              <div className="rounded-2xl border border-teal-300/25 bg-[#123249] p-5 flex items-center justify-between gap-4 shadow-lg">
                <div>
                  <div className="text-xs font-medium text-teal-100/80">
                    Interacciones & WhatsApp
                  </div>
                  <div className="text-2xl font-extrabold text-white mt-1">
                    {metrics.totalActivities + metrics.whatsappClicks}
                  </div>
                  <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#99f6e4] mt-1">
                    <span>{metrics.pendingFollowUp} seguimientos hoy</span>
                  </div>
                </div>
                <svg className="w-24 h-12 shrink-0" viewBox="0 0 100 45">
                  {[18, 28, 22, 35, 26, 40, 32, 42].map((h, idx) => (
                    <rect
                      key={idx}
                      x={idx * 12 + 4}
                      y={45 - h}
                      width="7"
                      height={h}
                      rx="2"
                      fill={idx >= 5 ? '#5eead4' : '#1b4f70'}
                    />
                  ))}
                </svg>
              </div>
            </div>
          )}

          {/* ==================== PESTAÑA KANBAN + PANEL DERECHO DE PRONÓSTICO (ESTILO FLOWRIZE) ==================== */}
          {activeTab === 'kanban' && (
            <div className="grid grid-cols-1 2xl:grid-cols-12 gap-5 items-start">
              {/* Tablero Kanban con Scroll Horizontal Suave */}
              <div className="2xl:col-span-9 overflow-x-auto pb-4">
                <div className="flex gap-3.5 min-w-max">
                  {PIPELINE_STAGES.map((stage) => {
                    const stageLeads = filteredLeads.filter(
                      (l) => l.stage === stage.id
                    );
                    const stageSum = stageLeads.reduce(
                      (acc, l) => acc + (Number(l.estimated_value_clp) || 0),
                      0
                    );
                    const isOver = dragOverStage === stage.id;

                    return (
                      <div
                        key={stage.id}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragOverStage(stage.id);
                        }}
                        onDragLeave={() => setDragOverStage(null)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragOverStage(null);
                          if (draggedLeadId) {
                            handleUpdateLead(
                              draggedLeadId,
                              { stage: stage.id },
                              `Prospecto movido a "${stage.label}"`
                            );
                            setDraggedLeadId(null);
                          }
                        }}
                        className={`w-[270px] shrink-0 rounded-2xl border p-3.5 min-h-[560px] flex flex-col transition-all ${
                          isOver
                            ? 'border-[#5eead4] bg-[#17425f]'
                            : 'border-teal-300/25 bg-[#123249]'
                        }`}
                      >
                        {/* Cabecera de Columna Estilo Kanban UI */}
                        <div className="mb-3.5 pb-3 border-b border-teal-300/20">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className={`h-2.5 w-2.5 rounded-full ${STAGE_DOT_COLORS[stage.id]}`}
                              />
                              <span className="text-xs font-extrabold text-white">
                                {stage.label}
                              </span>
                              <span className="rounded-md bg-[#0d2638] px-1.5 py-0.5 text-[10px] font-bold text-[#5eead4]">
                                {stageLeads.length}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setNewLeadModalOpen(true)}
                              className="text-teal-200 hover:text-white text-xs font-bold"
                              title="Agregar prospecto"
                            >
                              +
                            </button>
                          </div>
                          <div className="text-[11px] font-semibold text-teal-100/75 mt-1">
                            Total:{' '}
                            <span className="text-[#5eead4] font-mono">
                              ${stageSum.toLocaleString('es-CL')}
                            </span>
                          </div>
                        </div>

                        {/* Tarjetas del Kanban */}
                        <div className="space-y-3 flex-1">
                          {stageLeads.map((lead) => {
                            const progress = STAGE_PROGRESS[lead.stage] ?? 25;
                            const initials = lead.full_name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase();

                            return (
                              <div
                                key={lead.id}
                                draggable
                                onDragStart={() => setDraggedLeadId(lead.id)}
                                onClick={() => setSelectedLeadId(lead.id)}
                                className="cursor-pointer rounded-2xl border border-teal-300/25 bg-[#173f5c] hover:border-[#5eead4] p-3.5 shadow-md transition-all hover:-translate-y-0.5 space-y-2.5"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <div className="text-xs font-extrabold text-white line-clamp-1">
                                      {lead.company || lead.full_name}
                                    </div>
                                    <div className="text-[11px] text-teal-100/80 line-clamp-1">
                                      {lead.full_name}
                                    </div>
                                  </div>
                                  <span className="rounded-lg bg-[#5eead4]/20 border border-[#5eead4]/40 px-2 py-0.5 text-[10px] font-mono font-bold text-[#99f6e4] shrink-0">
                                    ${(lead.estimated_value_clp || 0).toLocaleString('es-CL')}
                                  </span>
                                </div>

                                <div className="inline-block rounded-md bg-[#0d2638] border border-teal-300/30 px-2 py-0.5 text-[10px] font-semibold text-[#5eead4] line-clamp-1">
                                  {lead.service_name}
                                </div>

                                {/* Barra de progreso segmentada estilo Flowrize */}
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-[10px] text-teal-100/75">
                                    <span>Avance cierre</span>
                                    <span className="font-mono text-white">
                                      {progress}%
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-5 gap-1">
                                    {[20, 40, 60, 80, 100].map((step) => (
                                      <div
                                        key={step}
                                        className={`h-1.5 rounded-full ${
                                          progress >= step
                                            ? lead.stage === 'ganado'
                                              ? 'bg-emerald-400'
                                              : 'bg-[#5eead4]'
                                            : 'bg-[#0d2638]'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>

                                <div className="pt-2 border-t border-teal-300/20 flex items-center justify-between text-[10px] text-teal-100/80">
                                  <div className="flex items-center gap-1.5">
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2dd4bf] text-[9px] font-extrabold text-slate-950">
                                      {initials}
                                    </span>
                                    <span className="font-mono">{lead.lead_code}</span>
                                  </div>
                                  <span
                                    className={`rounded px-1.5 py-0.5 font-bold uppercase ${
                                      lead.priority === 'urgente'
                                        ? 'bg-rose-500/20 text-rose-200'
                                        : lead.priority === 'alta'
                                          ? 'bg-amber-500/20 text-amber-200'
                                          : 'bg-[#0d2638] text-teal-100'
                                    }`}
                                  >
                                    {lead.priority}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Panel Lateral Derecho: Revenue Forecast + Donut Chart + Actividad Reciente */}
              <div className="2xl:col-span-3 space-y-4">
                {/* Gráfico de Pronóstico y Distribución */}
                <div className="rounded-2xl border border-teal-300/25 bg-[#123249] p-5 space-y-4 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-extrabold text-white">
                        Pronóstico de Ingresos
                      </h3>
                      <p className="text-[11px] text-teal-100/80">
                        Pipeline activo vs clientes cerrados
                      </p>
                    </div>
                    <span className="rounded-lg bg-[#5eead4]/20 px-2 py-1 text-[10px] font-bold text-[#99f6e4]">
                      En vivo
                    </span>
                  </div>

                  {/* Donut Chart + Leyenda */}
                  <div className="flex items-center gap-4 py-2">
                    <div className="relative h-24 w-24 shrink-0 flex items-center justify-center">
                      <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          stroke="#0d2638"
                          strokeWidth="4.5"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          stroke="#2dd4bf"
                          strokeWidth="4.5"
                          strokeDasharray="60 100"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          stroke="#67e8f9"
                          strokeWidth="4.5"
                          strokeDasharray={`${Math.max(12, metrics.conversionRate)} 100`}
                        />
                      </svg>
                      <div className="absolute text-center">
                        <div className="text-xs font-extrabold text-white">
                          {metrics.total}
                        </div>
                        <div className="text-[9px] text-teal-100/80">Leads</div>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs flex-1">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-teal-50">
                          <span className="h-2 w-2 rounded-full bg-[#67e8f9]" />
                          Ganados
                        </span>
                        <span className="font-bold text-white">{metrics.ganados}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-teal-50">
                          <span className="h-2 w-2 rounded-full bg-[#5eead4]" />
                          Cotizados
                        </span>
                        <span className="font-bold text-white">
                          {metrics.cotizaciones}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-teal-50">
                          <span className="h-2 w-2 rounded-full bg-[#2dd4bf]" />
                          En gestión
                        </span>
                        <span className="font-bold text-white">
                          {metrics.enSeguimiento + metrics.nuevos}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-[#0d2638] border border-teal-300/20 p-3 flex items-center justify-between text-xs">
                    <span className="text-teal-100/80">Valor total Pipeline:</span>
                    <span className="font-mono font-extrabold text-[#5eead4]">
                      ${metrics.pipelineValueClp.toLocaleString('es-CL')} CLP
                    </span>
                  </div>
                </div>

                {/* Actividad Reciente Estilo Flowrize */}
                <div className="rounded-2xl border border-teal-300/25 bg-[#123249] p-5 space-y-3.5 shadow-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-white">
                      Actividad Reciente
                    </h3>
                    <Activity className="h-4 w-4 text-[#5eead4]" />
                  </div>

                  {metrics.recentActivities.length === 0 ? (
                    <p className="text-xs text-teal-100/70 py-4">
                      Sin interacciones recientes registradas.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {metrics.recentActivities.map((act) => (
                        <div
                          key={act.id}
                          onClick={() => setSelectedLeadId(act.lead_id)}
                          className="cursor-pointer rounded-xl bg-[#173f5c] hover:bg-[#1d4f73] p-3 text-xs transition-colors"
                        >
                          <div className="flex items-center justify-between text-[10px] text-[#5eead4] font-bold uppercase mb-0.5">
                            <span>{act.activity_type}</span>
                            <span className="text-teal-100/75">
                              {new Date(act.created_at).toLocaleDateString('es-CL', {
                                day: '2-digit',
                                month: 'short',
                              })}
                            </span>
                          </div>
                          <div className="font-bold text-white line-clamp-1">
                            {act.lead_company || act.lead_name}
                          </div>
                          <div className="text-[11px] text-teal-100/80 line-clamp-1 mt-0.5">
                            {act.title}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==================== PESTAÑA DASHBOARD EJECUTIVO ==================== */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-[#0d1627] p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Demanda Comercial por Servicio TI
                    </h3>
                    <p className="text-xs text-slate-400">
                      Servicios que generan más oportunidades en Site On
                    </p>
                  </div>
                  <span className="rounded-lg bg-[#2563eb]/20 px-3 py-1 text-xs font-semibold text-[#93c5fd]">
                    Pipeline: ${metrics.pipelineValueClp.toLocaleString('es-CL')} CLP
                  </span>
                </div>

                {metrics.byService.length === 0 ? (
                  <p className="text-xs text-slate-500 py-8 text-center">
                    Aún no hay prospectos registrados.
                  </p>
                ) : (
                  <div className="space-y-3.5">
                    {metrics.byService.map((item) => {
                      const pct = Math.max(
                        8,
                        Math.round((item.count / Math.max(1, metrics.total)) * 100)
                      );
                      return (
                        <div key={item.name} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-semibold text-white">
                              {item.name}
                            </span>
                            <span className="text-slate-400">
                              {item.count} prospecto(s) ({pct}%)
                            </span>
                          </div>
                          <div className="h-2.5 w-full rounded-full bg-[#070d19] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#2563eb] to-[#38bdf8]"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-[#0d1627] p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white mb-1">
                    Evolución Mensual de Captaciones
                  </h3>
                  <p className="text-xs text-slate-400 mb-5">
                    Prospectos registrados en Supabase por mes
                  </p>

                  <div className="space-y-2.5 mb-6">
                    {metrics.byMonth.map((m) => (
                      <div
                        key={m.month}
                        className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#070d19] px-3.5 py-2.5 text-xs"
                      >
                        <span className="font-medium text-slate-300 capitalize">
                          {m.month}
                        </span>
                        <span className="rounded-full bg-[#2563eb]/20 px-2.5 py-0.5 font-bold text-[#38bdf8]">
                          {m.count} prospectos
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 mb-1">
                    <UserCheck className="h-4 w-4" /> Clientes Cerrados:{' '}
                    {metrics.ganados} (${metrics.wonValueClp.toLocaleString('es-CL')} CLP)
                  </div>
                  <p className="text-[11px] text-emerald-200/80">
                    Indicador principal centrado en conversión real a clientes y contratos.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ==================== PESTAÑA TABLA DE PROSPECTOS ==================== */}
          {activeTab === 'prospectos' && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-[#0d1627] p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <select
                    value={stageFilter}
                    onChange={(e) => {
                      setStageFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="rounded-xl border border-slate-800 bg-[#070d19] px-3 py-2 text-xs text-slate-200"
                  >
                    <option value="todos">Todos los estados</option>
                    {PIPELINE_STAGES.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={dateFilter}
                    onChange={(e) => {
                      setDateFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="rounded-xl border border-slate-800 bg-[#070d19] px-3 py-2 text-xs text-slate-200"
                  >
                    <option value="todos">Cualquier fecha</option>
                    <option value="hoy">Últimas 24 horas</option>
                    <option value="7dias">Últimos 7 días</option>
                    <option value="30dias">Últimos 30 días</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(
                        e.target.value as 'newest' | 'value_desc' | 'score_desc'
                      )
                    }
                    className="rounded-xl border border-slate-800 bg-[#070d19] px-3 py-2 text-xs text-slate-200"
                  >
                    <option value="newest">Más recientes</option>
                    <option value="score_desc">Mayor Score IA</option>
                    <option value="value_desc">Mayor Valor CLP</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 px-4 py-2 text-xs font-bold text-emerald-300"
                >
                  <Download className="h-3.5 w-3.5" /> Exportar CSV ({filteredLeads.length})
                </button>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-[#0d1627] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 bg-[#070d19] text-slate-400 uppercase text-[11px]">
                        <th className="py-3.5 px-4">Folio / Fecha</th>
                        <th className="py-3.5 px-4">Prospecto & Empresa</th>
                        <th className="py-3.5 px-4">Servicio Solicitado</th>
                        <th className="py-3.5 px-4">Estado</th>
                        <th className="py-3.5 px-4">Prioridad</th>
                        <th className="py-3.5 px-4">Valor Est. CLP</th>
                        <th className="py-3.5 px-4 text-right">Ficha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70">
                      {paginatedLeads.map((lead) => {
                        const st = PIPELINE_STAGES.find((s) => s.id === lead.stage);
                        return (
                          <tr
                            key={lead.id}
                            onClick={() => setSelectedLeadId(lead.id)}
                            className="hover:bg-[#121f36] cursor-pointer transition-colors"
                          >
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="font-mono font-semibold text-[#38bdf8]">
                                {lead.lead_code}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {new Date(lead.created_at).toLocaleDateString('es-CL')}
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-white">{lead.full_name}</div>
                              <div className="text-[11px] text-slate-400">
                                {lead.company || 'Contacto directo'} • {lead.email}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-slate-200">
                              {lead.service_name}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] font-semibold ${
                                  st?.badgeClass || ''
                                }`}
                              >
                                {st?.label || lead.stage}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 uppercase font-semibold text-slate-200">
                              {lead.priority}
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                              ${(lead.estimated_value_clp || 0).toLocaleString('es-CL')}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedLeadId(lead.id);
                                }}
                                className="rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] px-3 py-1.5 text-xs font-semibold text-white"
                              >
                                Abrir
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="border-t border-slate-800 bg-[#070d19] px-4 py-3 flex items-center justify-between text-xs text-slate-400">
                  <span>
                    Mostrando {paginatedLeads.length} de {filteredLeads.length} prospectos
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="rounded-lg border border-slate-800 bg-[#0d1627] px-3 py-1 disabled:opacity-40"
                    >
                      Anterior
                    </button>
                    <span>
                      Página {currentPage} de {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="rounded-lg border border-slate-800 bg-[#0d1627] px-3 py-1 disabled:opacity-40"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== PESTAÑA CLIENTES & CONTRATOS (ERP) ==================== */}
          {activeTab === 'clientes_erp' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-800 bg-[#0d1627] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Cartera Activa • Contratos, Cotizaciones y Facturación
                  </span>
                  <h2 className="text-xl font-bold text-white mt-1">
                    Clientes Ganados ({metrics.ganados})
                  </h2>
                  <p className="text-xs text-slate-300 mt-1">
                    Cada prospecto marcado como &ldquo;Ganado&rdquo; en el Kanban pasa a tu cartera de clientes activos para seguimiento de planes mensuales en UF y facturación.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('kanban')}
                  className="rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] px-5 py-2.5 text-xs font-bold text-white shrink-0"
                >
                  Ir al Pipeline Kanban →
                </button>
              </div>

              {leads.filter((l) => l.stage === 'ganado').length === 0 ? (
                <div className="rounded-2xl border border-slate-800 bg-[#0d1627] p-12 text-center space-y-3">
                  <UserCheck className="h-10 w-10 text-[#38bdf8] mx-auto" />
                  <h3 className="text-base font-bold text-white">
                    Mueve un prospecto a la columna &ldquo;Ganado&rdquo; para activar su ficha de cliente
                  </h3>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {leads
                    .filter((l) => l.stage === 'ganado')
                    .map((client) => (
                      <div
                        key={client.id}
                        onClick={() => setSelectedLeadId(client.id)}
                        className="cursor-pointer rounded-2xl border border-emerald-500/35 bg-[#0d1627] hover:border-emerald-400 p-5 space-y-3 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                            ● Cliente Activo
                          </span>
                          <span className="font-mono text-xs text-[#38bdf8]">
                            {client.lead_code}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white">
                            {client.company || client.full_name}
                          </h3>
                          <p className="text-xs text-slate-300">
                            {client.full_name} • {client.phone}
                          </p>
                        </div>
                        <div className="rounded-xl bg-[#070d19] p-3 border border-slate-800">
                          <div className="text-[11px] text-slate-400">Servicio:</div>
                          <div className="text-xs font-bold text-[#38bdf8]">
                            {client.service_name}
                          </div>
                          <div className="text-sm font-mono font-extrabold text-emerald-400 mt-1">
                            ${(client.estimated_value_clp || 0).toLocaleString('es-CL')} CLP
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* ==================== PESTAÑA SERVICIOS ==================== */}
          {activeTab === 'servicios' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((srv) => (
                <div
                  key={srv.slug}
                  className="rounded-2xl border border-slate-800 bg-[#0d1627] p-5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-semibold text-[#38bdf8] uppercase">
                        {srv.category}
                      </span>
                      <h3 className="text-base font-bold text-white">{srv.title}</h3>
                    </div>
                    <Link
                      href={`/servicios/${srv.slug}`}
                      target="_blank"
                      className="text-xs text-[#38bdf8] hover:underline shrink-0"
                    >
                      Ver página ↗
                    </Link>
                  </div>
                  <p className="text-xs text-slate-400">{srv.summary}</p>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Mensaje contextual automático de WhatsApp:
                    </label>
                    <input
                      type="text"
                      defaultValue={srv.whatsapp_prompt}
                      onBlur={async (e) => {
                        const updated: ServiceItem = {
                          ...srv,
                          whatsapp_prompt: e.target.value,
                        };
                        await fetch('/api/admin/cms', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ resource: 'service', data: updated }),
                        });
                        showToast(`Servicio "${srv.short_title}" actualizado`);
                      }}
                      className="w-full rounded-xl border border-slate-800 bg-[#070d19] px-3 py-2 text-xs text-slate-200"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ==================== PESTAÑA BLOG & SEO ==================== */}
          {activeTab === 'blog' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-800 bg-[#0d1627] p-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Artículos y Recursos SEO ({posts.length})
                  </h2>
                  <p className="text-xs text-slate-400">
                    Publica guías prácticas para atraer empresas desde Google
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEditingPost({
                      slug: '',
                      title: '',
                      category: 'Soporte TI & Continuidad',
                      excerpt: '',
                      content: '',
                      read_time_minutes: 5,
                      author_name: 'Equipo Ingeniería Site On',
                      author_role: 'Especialistas TI — Site On',
                      cover_gradient: 'from-blue-600/30 via-indigo-900/20 to-slate-950',
                      seo_keywords: ['Soporte TI Viña del Mar', 'Mantención computadores empresas'],
                      published: true,
                    })
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] px-4 py-2 text-xs font-bold text-white"
                >
                  <Plus className="h-4 w-4" /> Nuevo Artículo
                </button>
              </div>

              {editingPost && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const slug =
                      editingPost.slug ||
                      (editingPost.title || 'articulo')
                        .toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)/g, '');

                    const res = await fetch('/api/admin/cms', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        resource: 'post',
                        data: { ...editingPost, slug },
                      }),
                    });
                    if (res.ok) {
                      setEditingPost(null);
                      await fetchAllAdminData();
                      showToast('Artículo publicado correctamente');
                    }
                  }}
                  className="rounded-2xl border border-[#38bdf8]/40 bg-[#0d1627] p-6 space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      required
                      placeholder="Título del artículo"
                      value={editingPost.title || ''}
                      onChange={(e) =>
                        setEditingPost({ ...editingPost, title: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-700 bg-[#070d19] px-3 py-2 text-xs text-white"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Categoría"
                      value={editingPost.category || ''}
                      onChange={(e) =>
                        setEditingPost({ ...editingPost, category: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-700 bg-[#070d19] px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Resumen SEO"
                    value={editingPost.excerpt || ''}
                    onChange={(e) =>
                      setEditingPost({ ...editingPost, excerpt: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-700 bg-[#070d19] px-3 py-2 text-xs text-white"
                  />
                  <textarea
                    rows={6}
                    required
                    placeholder="Contenido..."
                    value={editingPost.content || ''}
                    onChange={(e) =>
                      setEditingPost({ ...editingPost, content: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-700 bg-[#070d19] p-3 text-xs text-white"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="rounded-xl bg-emerald-500 px-5 py-2 text-xs font-bold text-slate-950"
                    >
                      Publicar
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingPost(null)}
                      className="rounded-xl border border-slate-700 px-4 py-2 text-xs text-slate-300"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {posts.map((post) => (
                  <div
                    key={post.slug}
                    className="rounded-2xl border border-slate-800 bg-[#0d1627] p-5 flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[11px] font-semibold text-[#38bdf8]">
                        {post.category}
                      </span>
                      <h3 className="text-base font-bold text-white mt-1 mb-2">
                        {post.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-3 mb-4">
                        {post.excerpt}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                      <button
                        type="button"
                        onClick={() => setEditingPost(post)}
                        className="text-[#38bdf8] font-semibold"
                      >
                        Editar
                      </button>
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="text-slate-400 hover:text-white"
                      >
                        Ver ↗
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== PESTAÑA CONFIGURACIÓN WHATSAPP & SUPABASE ==================== */}
          {activeTab === 'configuracion' && settings && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const res = await fetch('/api/admin/cms', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ resource: 'settings', data: settings }),
                  });
                  if (res.ok) {
                    showToast('Configuración guardada en Supabase');
                  }
                }}
                className="lg:col-span-7 rounded-2xl border border-slate-800 bg-[#0d1627] p-6 space-y-5"
              >
                <h2 className="text-lg font-bold text-white">
                  Configuración de WhatsApp y Datos Comerciales
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Número Oficial WhatsApp (sin +)
                    </label>
                    <input
                      type="text"
                      value={settings.whatsapp_number}
                      onChange={(e) =>
                        setSettings({ ...settings, whatsapp_number: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-700 bg-[#070d19] px-3.5 py-2 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Teléfono Visible
                    </label>
                    <input
                      type="text"
                      value={settings.whatsapp_display}
                      onChange={(e) =>
                        setSettings({ ...settings, whatsapp_display: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-700 bg-[#070d19] px-3.5 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Tooltip Botón WhatsApp
                    </label>
                    <input
                      type="text"
                      value={settings.whatsapp_tooltip}
                      onChange={(e) =>
                        setSettings({ ...settings, whatsapp_tooltip: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-700 bg-[#070d19] px-3.5 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Correo Alertas CRM
                    </label>
                    <input
                      type="email"
                      value={settings.notification_email}
                      onChange={(e) =>
                        setSettings({ ...settings, notification_email: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-700 bg-[#070d19] px-3.5 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] px-6 py-3 text-xs font-bold text-white"
                >
                  Guardar Cambios en Supabase
                </button>
              </form>

              <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-[#0d1627] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-emerald-400" />
                    <h3 className="text-base font-bold text-white">
                      Persistencia Supabase Cloud
                    </h3>
                  </div>
                  <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                    Conectado
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Las credenciales están protegidas en variables de entorno de servidor (
                  <code>process.env</code>). Copia el esquema SQL oficial si deseas
                  ejecutar migraciones manuales en Supabase:
                </p>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(sqlMigration);
                    showToast('Script SQL copiado');
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-[#070d19] px-3.5 py-2 text-xs font-semibold text-[#38bdf8]"
                >
                  <Copy className="h-3.5 w-3.5" /> Copiar Esquema SQL
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ==================== DRAWER LATERAL: FICHA INDIVIDUAL DEL PROSPECTO ==================== */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[#0a1222] border-l border-slate-800 h-full overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-[#38bdf8] font-bold">
                    {selectedLead.lead_code}
                  </span>
                  <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                    Score IA: {selectedLead.ai_score}/100 ({selectedLead.ai_classification})
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white mt-1">
                  {selectedLead.full_name}
                </h2>
                <p className="text-xs text-slate-400">
                  {selectedLead.company || 'Contacto directo'} • Ingresó el{' '}
                  {new Date(selectedLead.created_at).toLocaleString('es-CL')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLeadId(null)}
                className="rounded-xl border border-slate-800 bg-[#0d1627] p-2 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Acciones Rápidas de Contacto */}
            <div className="rounded-2xl border border-[#2563eb]/40 bg-[#121f36] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#38bdf8]">
                  <Sparkles className="h-4 w-4" /> Sugerencia Comercial
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {selectedLead.ai_suggested_action}
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {(() => {
                  const draft = generateCommercialFollowUpDraft(selectedLead);
                  const cleanPhone = selectedLead.phone.replace(/\D/g, '');
                  const waHref = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                    draft.whatsappMessage
                  )}`;
                  const mailHref = `mailto:${selectedLead.email}?subject=${encodeURIComponent(
                    draft.emailSubject
                  )}&body=${encodeURIComponent(draft.emailBody)}`;

                  return (
                    <>
                      <a
                        href={waHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-3.5 py-2 text-xs font-extrabold text-slate-950"
                      >
                        <MessageSquare className="h-3.5 w-3.5" /> Responder por WhatsApp
                      </a>
                      <a
                        href={mailHref}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-[#0d1627] hover:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200"
                      >
                        <Mail className="h-3.5 w-3.5" /> Enviar Correo
                      </a>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Controles de Estado, Prioridad, Valor Estimado y Próximo Contacto */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-slate-800 bg-[#0d1627] p-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Etapa del Pipeline Comercial
                </label>
                <select
                  value={selectedLead.stage}
                  onChange={(e) => {
                    const nextStage = e.target.value as PipelineStage;
                    let lostReason = selectedLead.lost_reason;
                    if (nextStage === 'perdido') {
                      lostReason =
                        window.prompt(
                          'Indica el motivo de pérdida:',
                          selectedLead.lost_reason || 'Presupuesto fuera de rango'
                        ) || 'No especificado';
                    }
                    handleUpdateLead(
                      selectedLead.id,
                      { stage: nextStage, lost_reason: lostReason },
                      `Etapa actualizada a ${nextStage}`
                    );
                  }}
                  className="w-full rounded-xl border border-slate-700 bg-[#070d19] px-3 py-2 text-xs text-white font-semibold"
                >
                  {PIPELINE_STAGES.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Prioridad Comercial
                </label>
                <select
                  value={selectedLead.priority}
                  onChange={(e) =>
                    handleUpdateLead(
                      selectedLead.id,
                      { priority: e.target.value as LeadPriority },
                      'Prioridad actualizada'
                    )
                  }
                  className="w-full rounded-xl border border-slate-700 bg-[#070d19] px-3 py-2 text-xs text-white font-semibold uppercase"
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Valor Estimado de Oportunidad (CLP)
                </label>
                <input
                  type="number"
                  defaultValue={selectedLead.estimated_value_clp || 0}
                  onBlur={(e) =>
                    handleUpdateLead(
                      selectedLead.id,
                      { estimated_value_clp: Number(e.target.value) || 0 },
                      'Valor estimado actualizado'
                    )
                  }
                  className="w-full rounded-xl border border-slate-700 bg-[#070d19] px-3 py-2 text-xs text-emerald-400 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Próxima Fecha de Contacto
                </label>
                <input
                  type="date"
                  defaultValue={
                    selectedLead.next_contact_at
                      ? selectedLead.next_contact_at.slice(0, 10)
                      : ''
                  }
                  onChange={(e) =>
                    handleUpdateLead(
                      selectedLead.id,
                      {
                        next_contact_at: e.target.value
                          ? new Date(e.target.value).toISOString()
                          : null,
                      },
                      'Fecha de próximo seguimiento programada'
                    )
                  }
                  className="w-full rounded-xl border border-slate-700 bg-[#070d19] px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            {/* Datos del Prospecto */}
            <div className="rounded-2xl border border-slate-800 bg-[#0d1627] p-4 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 block">Correo:</span>
                  <span className="text-white font-medium">{selectedLead.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Teléfono / WhatsApp:</span>
                  <span className="text-white font-medium">{selectedLead.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Servicio Solicitado:</span>
                  <span className="text-[#38bdf8] font-semibold">
                    {selectedLead.service_name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Tamaño / Presupuesto:</span>
                  <span className="text-slate-200">
                    {selectedLead.company_size || 'N/A'} •{' '}
                    {selectedLead.budget_range || 'Por evaluar'}
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-400 block mb-1">Mensaje del cliente:</span>
                <p className="rounded-xl bg-[#070d19] p-3 text-slate-200 whitespace-pre-wrap">
                  {selectedLead.description}
                </p>
              </div>
            </div>

            {/* Registrar Nueva Nota o Llamada */}
            <form
              onSubmit={handleAddActivity}
              className="rounded-2xl border border-slate-800 bg-[#0d1627] p-4 space-y-3"
            >
              <div className="text-xs font-bold text-white">
                Registrar Llamada, Reunión, Cotización o Nota
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <select
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value as ActivityType)}
                  className="rounded-xl border border-slate-700 bg-[#070d19] px-3 py-2 text-xs text-white"
                >
                  <option value="nota">Nota interna</option>
                  <option value="llamada">Llamada telefónica</option>
                  <option value="reunion">Reunión agendada</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="cotizacion">Cotización enviada</option>
                </select>
                <input
                  type="text"
                  placeholder="Resumen breve..."
                  value={activityTitle}
                  onChange={(e) => setActivityTitle(e.target.value)}
                  className="sm:col-span-2 rounded-xl border border-slate-700 bg-[#070d19] px-3 py-2 text-xs text-white"
                />
              </div>
              <textarea
                rows={2}
                required
                placeholder="Escribe los detalles del acuerdo o seguimiento..."
                value={activityContent}
                onChange={(e) => setActivityContent(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-[#070d19] p-3 text-xs text-white"
              />
              <button
                type="submit"
                disabled={savingActivity}
                className="rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] px-4 py-2 text-xs font-bold text-white"
              >
                {savingActivity ? 'Guardando...' : 'Guardar en Historial'}
              </button>
            </form>

            {/* Historial */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Historial de Actividad ({selectedLead.activities?.length || 0})
              </div>
              {(selectedLead.activities || []).map((act) => (
                <div
                  key={act.id}
                  className="rounded-xl border border-slate-800 bg-[#0d1627] p-3.5 text-xs"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span className="font-bold text-[#38bdf8] uppercase">
                      {act.activity_type} • {act.title}
                    </span>
                    <span>{new Date(act.created_at).toLocaleString('es-CL')}</span>
                  </div>
                  <p className="text-slate-200 whitespace-pre-wrap">{act.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL: CREAR PROSPECTO MANUAL ==================== */}
      {newLeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleCreateManualLead}
            className="w-full max-w-lg rounded-3xl border border-slate-800 bg-[#0d1627] p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                Registrar Nuevo Prospecto en CRM
              </h3>
              <button
                type="button"
                onClick={() => setNewLeadModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Nombre completo *</label>
                <input
                  type="text"
                  required
                  value={manualLead.full_name}
                  onChange={(e) =>
                    setManualLead({ ...manualLead, full_name: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-700 bg-[#070d19] px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Empresa</label>
                <input
                  type="text"
                  value={manualLead.company}
                  onChange={(e) =>
                    setManualLead({ ...manualLead, company: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-700 bg-[#070d19] px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Correo *</label>
                <input
                  type="email"
                  required
                  value={manualLead.email}
                  onChange={(e) =>
                    setManualLead({ ...manualLead, email: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-700 bg-[#070d19] px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Teléfono / WhatsApp *</label>
                <input
                  type="text"
                  required
                  value={manualLead.phone}
                  onChange={(e) =>
                    setManualLead({ ...manualLead, phone: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-700 bg-[#070d19] px-3 py-2 text-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-300 mb-1">Servicio solicitado *</label>
                <select
                  value={manualLead.service_slug}
                  onChange={(e) =>
                    setManualLead({ ...manualLead, service_slug: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-700 bg-[#070d19] px-3 py-2 text-white"
                >
                  {services.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-300 mb-1">
                  Descripción del requerimiento *
                </label>
                <textarea
                  rows={3}
                  required
                  value={manualLead.description}
                  onChange={(e) =>
                    setManualLead({ ...manualLead, description: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-700 bg-[#070d19] p-3 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setNewLeadModalOpen(false)}
                className="rounded-xl border border-slate-700 px-4 py-2 text-xs text-slate-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-5 py-2 text-xs font-extrabold text-slate-950"
              >
                Guardar Prospecto
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
