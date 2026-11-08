'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Calculator,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cloud,
  Cpu,
  FileCheck2,
  HelpCircle,
  Info,
  Laptop,
  Layers,
  Loader2,
  Lock,
  MessageCircle,
  Minus,
  MonitorCheck,
  Plus,
  RefreshCw,
  Server,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { convertUfToClp } from '@/data/siteon-catalog';
import {
  PlatformSettings,
  PricingConfig,
  PricingPlan,
  QuoteConfiguration,
} from '@/types/siteon';

interface SmartPricingAndQuoterSectionProps {
  pricingConfig: PricingConfig;
  settings: PlatformSettings;
  standalonePage?: boolean;
}

export function SmartPricingAndQuoterSection({
  pricingConfig,
  settings,
  standalonePage = false,
}: SmartPricingAndQuoterSectionProps) {
  const activePlans = useMemo(
    () =>
      (pricingConfig.plans || [])
        .filter((p) => p.active)
        .sort((a, b) => a.sort_order - b.sort_order),
    [pricingConfig.plans]
  );

  // ============================================================================
  // 1. GESTIÓN DE CALCULADORA UF Y CLP (VALOR VIGENTE + SINCRONIZACIÓN DIARIA)
  // ============================================================================
  const [ufRateClp, setUfRateClp] = useState<number>(pricingConfig.uf_value_clp || 41290);
  const [ufDate, setUfDate] = useState<string>(
    pricingConfig.uf_last_updated || new Date().toISOString().split('T')[0]
  );
  const [ufSourceLabel, setUfSourceLabel] = useState<string>(
    pricingConfig.uf_source_label || 'Referencia Comercial Vigente'
  );
  const [officialDailyUf, setOfficialDailyUf] = useState<{
    value: number;
    date: string;
    source: string;
  } | null>(null);
  const [syncingUf, setSyncingUf] = useState(false);
  const [showUfConverter, setShowUfConverter] = useState(false);
  const [converterUfInput, setConverterUfInput] = useState<string>('6.5');

  useEffect(() => {
    let mounted = true;
    fetch('/api/uf')
      .then((r) => r.json())
      .then((data) => {
        if (!mounted || !data?.ok) return;
        if (data.official_daily_uf?.value) {
          setOfficialDailyUf(data.official_daily_uf);
        }
        if (data.uf_mode === 'official_auto' && data.active_uf_clp) {
          setUfRateClp(Number(data.active_uf_clp));
          setUfDate(String(data.active_uf_date || ufDate));
          setUfSourceLabel(String(data.active_uf_source || 'Banco Central de Chile'));
        }
      })
      .catch(() => {
        // Mantiene el último valor válido sin interrumpir la experiencia
      });
    return () => {
      mounted = false;
    };
  }, [ufDate]);

  const handleRefreshOfficialUf = async () => {
    setSyncingUf(true);
    try {
      const res = await fetch('/api/uf?refresh=1');
      const data = await res.json();
      if (data?.official_daily_uf?.value) {
        setOfficialDailyUf(data.official_daily_uf);
        setUfRateClp(Number(data.official_daily_uf.value));
        setUfDate(String(data.official_daily_uf.date));
        setUfSourceLabel(String(data.official_daily_uf.source));
      }
    } catch {
      // Mantiene el último valor válido
    } finally {
      setSyncingUf(false);
    }
  };

  const handleUseReferenceUf = () => {
    setUfRateClp(pricingConfig.uf_value_clp || 41290);
    setUfDate(pricingConfig.uf_last_updated || new Date().toISOString().split('T')[0]);
    setUfSourceLabel(pricingConfig.uf_source_label || 'Referencia Comercial Vigente');
  };

  const formatClp = (amount: number) =>
    `$${Math.round(amount).toLocaleString('es-CL')} CLP`;

  const formatUf = (uf: number) =>
    uf % 1 === 0
      ? `${uf.toLocaleString('es-CL')} UF`
      : `${uf.toFixed(1).replace('.', ',')} UF`;

  // ============================================================================
  // 2. ESTADO DEL COTIZADOR INTELIGENTE
  // ============================================================================
  const [usersCount, setUsersCount] = useState<number>(8);
  const [computersCount, setComputersCount] = useState<number>(8);
  const [serversCount, setServersCount] = useState<number>(1);
  const [branchesCount, setBranchesCount] = useState<number>(1);
  const [productivitySuite, setProductivitySuite] = useState<
    'none' | 'microsoft_365' | 'google_workspace' | 'both'
  >('microsoft_365');
  const [supportModality, setSupportModality] = useState<
    'remote_only' | 'remote_and_scheduled_onsite' | 'intensive_onsite'
  >('remote_and_scheduled_onsite');
  const [requiresMonitoring, setRequiresMonitoring] = useState<boolean>(true);
  const [requiresCloud, setRequiresCloud] = useState<boolean>(false);
  const [requiresAutomationAi, setRequiresAutomationAi] = useState<boolean>(false);
  const [manualPlanOverrideSlug, setManualPlanOverrideSlug] = useState<string | null>(null);

  // Comparador móvil: plan activo seleccionado en vista móvil
  const [mobileComparedPlanSlug, setMobileComparedPlanSlug] = useState<string>(
    'site-on-business-pro'
  );

  // ============================================================================
  // 3. MOTOR DE RECOMENDACIÓN Y CÁLCULO SIN DOBLE COBRO
  // ============================================================================
  const quoteCalculation = useMemo(() => {
    const rates = pricingConfig.addon_rates;
    const ivaPct = pricingConfig.iva_percentage || 19;

    const findPlan = (slug: string): PricingPlan =>
      activePlans.find((p) => p.slug === slug) ||
      activePlans[Math.min(2, activePlans.length - 1)] ||
      pricingConfig.plans[0];

    // 3.1 Determinar el plan óptimo recomendado automáticamente
    let autoPlanSlug = 'site-on-start';
    let recommendationReason =
      'Ideal para equipos de hasta 3 usuarios que requieren soporte remoto ágil y mantención preventiva básica.';

    if (
      usersCount > 12 ||
      branchesCount >= 3 ||
      serversCount >= 2 ||
      (requiresCloud && serversCount >= 1 && usersCount > 8) ||
      supportModality === 'intensive_onsite'
    ) {
      autoPlanSlug = 'site-on-enterprise';
      recommendationReason =
        'Recomendado por volumen de usuarios (>12), operación multi-sede, servidores críticos o infraestructura Cloud híbrida con SLA personalizado.';
    } else if (
      usersCount > 6 ||
      serversCount === 1 ||
      requiresMonitoring ||
      branchesCount === 2
    ) {
      autoPlanSlug = 'site-on-business-pro';
      recommendationReason =
        'El equilibrio óptimo para tu empresa: cubre hasta 12 usuarios, incluye administración de red/Wi-Fi, monitoreo proactivo, 1 servidor en alcance y visita presencial mensual.';
    } else if (
      usersCount > 3 ||
      productivitySuite !== 'none' ||
      supportModality === 'remote_and_scheduled_onsite'
    ) {
      autoPlanSlug = 'site-on-business';
      recommendationReason =
        'Diseñado para equipos de hasta 6 usuarios con administración de Microsoft 365 o Google Workspace y visita trimestral programada.';
    }

    const selectedPlan = manualPlanOverrideSlug
      ? findPlan(manualPlanOverrideSlug)
      : findPlan(autoPlanSlug);

    const basePriceUf = selectedPlan.price_uf;
    const breakdown: {
      label: string;
      uf: number;
      clp: number;
      included_in_plan: boolean;
    }[] = [];

    // 3.2 Usuarios incluidos vs adicionales (0,5 UF / usuario extra)
    const includedUsers = selectedPlan.max_users;
    const extraUsers = Math.max(0, usersCount - includedUsers);
    if (extraUsers === 0) {
      breakdown.push({
        label: `Cobertura para ${usersCount} ${usersCount === 1 ? 'usuario' : 'usuarios'} (hasta ${includedUsers} incluidos)`,
        uf: 0,
        clp: 0,
        included_in_plan: true,
      });
    } else {
      const extraUsersUf = Number((extraUsers * rates.extra_user_uf).toFixed(2));
      breakdown.push({
        label: `${includedUsers} usuarios incluidos en el plan base`,
        uf: 0,
        clp: 0,
        included_in_plan: true,
      });
      breakdown.push({
        label: `${extraUsers} ${extraUsers === 1 ? 'usuario adicional' : 'usuarios adicionales'} (${formatUf(rates.extra_user_uf)} c/u)`,
        uf: extraUsersUf,
        clp: convertUfToClp(extraUsersUf, ufRateClp),
        included_in_plan: false,
      });
    }

    // 3.3 Equipos adicionales (0,2 UF / equipo adicional sobre la cobertura de usuarios/equipos del plan)
    // Evita cobrar dos veces por el computador principal de cada usuario cubierto
    const coveredComputersBaseline = Math.max(usersCount, selectedPlan.included_computers || selectedPlan.max_users);
    const extraComputers = Math.max(0, computersCount - coveredComputersBaseline);
    if (extraComputers > 0) {
      const extraCompUf = Number((extraComputers * rates.extra_computer_uf).toFixed(2));
      breakdown.push({
        label: `${extraComputers} ${extraComputers === 1 ? 'equipo adicional compartido' : 'equipos adicionales compartidos'} (${formatUf(rates.extra_computer_uf)} c/u)`,
        uf: extraCompUf,
        clp: convertUfToClp(extraCompUf, ufRateClp),
        included_in_plan: false,
      });
    } else {
      breakdown.push({
        label: `${computersCount} ${computersCount === 1 ? 'computador cubierto' : 'computadores cubiertos'} sin recargo`,
        uf: 0,
        clp: 0,
        included_in_plan: true,
      });
    }

    // 3.4 Microsoft 365 / Google Workspace (Sin doble cobro si el plan ya lo incluye)
    if (productivitySuite !== 'none') {
      const suiteLabel =
        productivitySuite === 'microsoft_365'
          ? 'Administración Microsoft 365'
          : productivitySuite === 'google_workspace'
          ? 'Administración Google Workspace'
          : 'Administración Microsoft 365 + Google Workspace';

      if (selectedPlan.includes_m365_workspace) {
        breakdown.push({
          label: `${suiteLabel} (Incluido en ${selectedPlan.name})`,
          uf: 0,
          clp: 0,
          included_in_plan: true,
        });
      } else {
        // Si forzó el plan Start pero pidió M365 completo, agregamos 1 UF de gestión de directorio/tenant
        breakdown.push({
          label: `${suiteLabel} sobre plan básico`,
          uf: 1.0,
          clp: convertUfToClp(1.0, ufRateClp),
          included_in_plan: false,
        });
      }
    }

    // 3.5 Servidores administrados (Desde 2 UF / servidor, descontando los ya incluidos en el plan)
    if (serversCount > 0) {
      const includedSrv = selectedPlan.included_servers || 0;
      const billableServers = Math.max(0, serversCount - includedSrv);

      if (includedSrv > 0) {
        const coveredNow = Math.min(serversCount, includedSrv);
        breakdown.push({
          label: `Administración de ${coveredNow} ${coveredNow === 1 ? 'servidor incluido' : 'servidores incluidos'} en ${selectedPlan.name}`,
          uf: 0,
          clp: 0,
          included_in_plan: true,
        });
      }

      if (billableServers > 0) {
        const srvUf = Number((billableServers * rates.managed_server_uf).toFixed(2));
        breakdown.push({
          label: `${billableServers} ${billableServers === 1 ? 'servidor administrado adicional' : 'servidores administrados adicionales'} (${formatUf(rates.managed_server_uf)} c/u)`,
          uf: srvUf,
          clp: convertUfToClp(srvUf, ufRateClp),
          included_in_plan: false,
        });
      }
    }

    // 3.6 Monitoreo de infraestructura (Desde 1,5 UF / servidor, sin doble cobro en Business Pro / Enterprise)
    if (requiresMonitoring) {
      if (selectedPlan.includes_monitoring) {
        const extraMonitoredServers = Math.max(
          0,
          serversCount - Math.max(1, selectedPlan.included_servers || 0)
        );
        breakdown.push({
          label: `Monitoreo proactivo de equipos y servicios base (Incluido en ${selectedPlan.name})`,
          uf: 0,
          clp: 0,
          included_in_plan: true,
        });
        if (extraMonitoredServers > 0) {
          const monUf = Number(
            (extraMonitoredServers * rates.advanced_monitoring_uf).toFixed(2)
          );
          breakdown.push({
            label: `Monitoreo avanzado para ${extraMonitoredServers} ${extraMonitoredServers === 1 ? 'servidor adicional' : 'servidores adicionales'} (${formatUf(rates.advanced_monitoring_uf)} c/u)`,
            uf: monUf,
            clp: convertUfToClp(monUf, ufRateClp),
            included_in_plan: false,
          });
        }
      } else {
        const unitsToMonitor = Math.max(1, serversCount);
        const monUf = Number((unitsToMonitor * rates.advanced_monitoring_uf).toFixed(2));
        breakdown.push({
          label: `Módulo de monitoreo proactivo (${unitsToMonitor} ${unitsToMonitor === 1 ? 'nodo/servidor' : 'nodos/servidores'})`,
          uf: monUf,
          clp: convertUfToClp(monUf, ufRateClp),
          included_in_plan: false,
        });
      }
    }

    // 3.7 Sucursales y soporte presencial (Visitas extraordinarias desde 1 UF)
    if (branchesCount > 1) {
      const extraBranches = branchesCount - 1;
      const includedBranchesInEnterprise = selectedPlan.slug === 'site-on-enterprise' ? 1 : 0;
      const billableBranches = Math.max(0, extraBranches - includedBranchesInEnterprise);

      if (includedBranchesInEnterprise > 0) {
        breakdown.push({
          label: 'Coordinación multi-sede inicial incluida en Enterprise',
          uf: 0,
          clp: 0,
          included_in_plan: true,
        });
      }
      if (billableBranches > 0) {
        const branchUf = Number((billableBranches * rates.extra_visit_uf).toFixed(2));
        breakdown.push({
          label: `Atención y visita programada para ${billableBranches} ${billableBranches === 1 ? 'sucursal adicional' : 'sucursales adicionales'} (${formatUf(rates.extra_visit_uf)} c/u)`,
          uf: branchUf,
          clp: convertUfToClp(branchUf, ufRateClp),
          included_in_plan: false,
        });
      }
    } else if (
      supportModality === 'remote_and_scheduled_onsite' &&
      selectedPlan.slug === 'site-on-start'
    ) {
      breakdown.push({
        label: `1 visita presencial programada adicional (${formatUf(rates.extra_visit_uf)})`,
        uf: rates.extra_visit_uf,
        clp: convertUfToClp(rates.extra_visit_uf, ufRateClp),
        included_in_plan: false,
      });
    } else if (selectedPlan.slug !== 'site-on-start') {
      breakdown.push({
        label: selectedPlan.onsite_visits_summary,
        uf: 0,
        clp: 0,
        included_in_plan: true,
      });
    }

    // 3.8 Servicios Cloud (Incluido en Enterprise, adicional en otros planes)
    if (requiresCloud) {
      if (selectedPlan.includes_cloud_hybrid) {
        breakdown.push({
          label: `Administración Cloud e infraestructura híbrida (Incluido en ${selectedPlan.name})`,
          uf: 0,
          clp: 0,
          included_in_plan: true,
        });
      } else {
        const cloudUf = rates.cloud_management_uf || 1.5;
        breakdown.push({
          label: `Gestión de entorno Cloud / Backups en la nube (${formatUf(cloudUf)})`,
          uf: cloudUf,
          clp: convertUfToClp(cloudUf, ufRateClp),
          included_in_plan: false,
        });
      }
    }

    // 3.9 Automatización de procesos o IA
    if (requiresAutomationAi) {
      const aiUf = rates.automation_ai_uf || 2.5;
      breakdown.push({
        label: `Módulo de Automatización de Procesos / Flujos IA (${formatUf(aiUf)})`,
        uf: aiUf,
        clp: convertUfToClp(aiUf, ufRateClp),
        included_in_plan: false,
      });
    }

    const addonsUf = Number(
      breakdown.reduce((acc, item) => acc + (item.included_in_plan ? 0 : item.uf), 0).toFixed(2)
    );
    const netUf = Number((basePriceUf + addonsUf).toFixed(2));
    const netClp = convertUfToClp(netUf, ufRateClp);
    const ivaUf = Number(((netUf * ivaPct) / 100).toFixed(2));
    const ivaClp = Math.round((netClp * ivaPct) / 100);
    const totalUfWithIva = Number((netUf + ivaUf).toFixed(2));
    const totalClpWithIva = netClp + ivaClp;

    const configuration: QuoteConfiguration = {
      source: 'smart_quoter',
      recommended_plan_slug: selectedPlan.slug,
      recommended_plan_name: selectedPlan.name,
      users_count: usersCount,
      computers_count: computersCount,
      servers_count: serversCount,
      branches_count: branchesCount,
      productivity_suite: productivitySuite,
      support_modality: supportModality,
      requires_monitoring: requiresMonitoring,
      requires_cloud: requiresCloud,
      requires_automation_ai: requiresAutomationAi,
      base_price_uf: basePriceUf,
      addons_uf: addonsUf,
      addons_breakdown: breakdown,
      net_uf: netUf,
      net_clp: netClp,
      iva_uf: ivaUf,
      iva_clp: ivaClp,
      total_uf_with_iva: totalUfWithIva,
      total_clp_with_iva: totalClpWithIva,
      uf_rate_used: ufRateClp,
      uf_date_used: ufDate,
    };

    return {
      selectedPlan,
      autoPlanSlug,
      recommendationReason,
      basePriceClp: convertUfToClp(basePriceUf, ufRateClp),
      addonsClp: convertUfToClp(addonsUf, ufRateClp),
      ivaPct,
      configuration,
    };
  }, [
    activePlans,
    pricingConfig,
    usersCount,
    computersCount,
    serversCount,
    branchesCount,
    productivitySuite,
    supportModality,
    requiresMonitoring,
    requiresCloud,
    requiresAutomationAi,
    manualPlanOverrideSlug,
    ufRateClp,
    ufDate,
  ]);

  // ============================================================================
  // 4. MODAL DE CONVERSIÓN Y SOLICITUD DE DIAGNÓSTICO (CONECTADO AL CRM)
  // ============================================================================
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSource, setModalSource] = useState<'plan_card' | 'smart_quoter'>('plan_card');
  const [modalPlan, setModalPlan] = useState<PricingPlan | null>(null);
  const [formFullName, setFormFullName] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formUsersCount, setFormUsersCount] = useState<number>(6);
  const [formDescription, setFormDescription] = useState('');
  const [formPrivacy, setFormPrivacy] = useState(true);
  const [formHoneypot, setFormHoneypot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<{
    leadCode: string;
    message: string;
    planName: string;
  } | null>(null);

  const openModalFromPlanCard = (plan: PricingPlan) => {
    setModalSource('plan_card');
    setModalPlan(plan);
    setFormUsersCount(plan.max_users);
    const planNetClp = convertUfToClp(plan.price_uf, ufRateClp);
    setFormDescription(
      `Solicito diagnóstico gratuito para el plan ${plan.name} (${formatUf(plan.price_uf)}/mes + IVA · ref. ${formatClp(planNetClp)} neto, cobertura hasta ${plan.max_users} usuarios).`
    );
    setSubmitError(null);
    setSubmitSuccess(null);
    setModalOpen(true);

    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'cta_click',
        page_path: window.location.pathname,
        service_slug: plan.slug,
        metadata: { action: 'open_plan_modal', plan_name: plan.name, price_uf: plan.price_uf },
      }),
    }).catch(() => {});
  };

  const openModalFromSmartQuoter = () => {
    setModalSource('smart_quoter');
    setModalPlan(quoteCalculation.selectedPlan);
    setFormUsersCount(usersCount);
    const cfg = quoteCalculation.configuration;
    setFormDescription(
      `Cotización simulada en web para ${cfg.recommended_plan_name}: ${cfg.users_count} usuarios, ${cfg.computers_count} computadores, ${cfg.servers_count} servidores, ${cfg.branches_count} ${cfg.branches_count === 1 ? 'sucursal' : 'sucursales'}. Valor estimado: ${formatUf(cfg.net_uf)} + IVA (${formatClp(cfg.net_clp)} neto / ${formatClp(cfg.total_clp_with_iva)} IVA incl.). Solicito diagnóstico técnico para validar alcance.`
    );
    setSubmitError(null);
    setSubmitSuccess(null);
    setModalOpen(true);

    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'quote_request',
        page_path: window.location.pathname,
        service_slug: cfg.recommended_plan_slug,
        metadata: {
          action: 'open_quoter_modal',
          net_uf: cfg.net_uf,
          net_clp: cfg.net_clp,
          users: cfg.users_count,
        },
      }),
    }).catch(() => {});
  };

  const loadPlanIntoQuoter = (plan: PricingPlan) => {
    setManualPlanOverrideSlug(plan.slug);
    setUsersCount(plan.max_users);
    setComputersCount(plan.included_computers || plan.max_users);
    setServersCount(plan.included_servers || 0);
    setRequiresMonitoring(plan.includes_monitoring);
    setRequiresCloud(plan.includes_cloud_hybrid);
    if (plan.includes_m365_workspace && productivitySuite === 'none') {
      setProductivitySuite('microsoft_365');
    }
    const el = document.getElementById('cotizador-inteligente');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleDiagnosticSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);

    try {
      const activePlan = modalPlan || quoteCalculation.selectedPlan;
      const ivaPct = pricingConfig.iva_percentage || 19;

      // Construir objeto quote_details según si vino de la tarjeta o del cotizador interactivo
      let payloadQuoteDetails: QuoteConfiguration;
      if (modalSource === 'smart_quoter') {
        payloadQuoteDetails = {
          ...quoteCalculation.configuration,
          users_count: formUsersCount || usersCount,
        };
      } else {
        const netUf = activePlan.price_uf;
        const netClp = convertUfToClp(netUf, ufRateClp);
        const ivaUf = Number(((netUf * ivaPct) / 100).toFixed(2));
        const ivaClp = Math.round((netClp * ivaPct) / 100);
        payloadQuoteDetails = {
          source: 'plan_card',
          recommended_plan_slug: activePlan.slug,
          recommended_plan_name: activePlan.name,
          users_count: formUsersCount || activePlan.max_users,
          computers_count: formUsersCount || activePlan.included_computers,
          servers_count: activePlan.included_servers || 0,
          branches_count: 1,
          productivity_suite: activePlan.includes_m365_workspace ? 'microsoft_365' : 'none',
          support_modality:
            activePlan.slug === 'site-on-start' ? 'remote_only' : 'remote_and_scheduled_onsite',
          requires_monitoring: activePlan.includes_monitoring,
          requires_cloud: activePlan.includes_cloud_hybrid,
          requires_automation_ai: false,
          base_price_uf: netUf,
          addons_uf: 0,
          addons_breakdown: activePlan.features.map((f) => ({
            label: f,
            uf: 0,
            clp: 0,
            included_in_plan: true,
          })),
          net_uf: netUf,
          net_clp: netClp,
          iva_uf: ivaUf,
          iva_clp: ivaClp,
          total_uf_with_iva: Number((netUf + ivaUf).toFixed(2)),
          total_clp_with_iva: netClp + ivaClp,
          uf_rate_used: ufRateClp,
          uf_date_used: ufDate,
        };
      }

      const urlParams = new URLSearchParams(window.location.search);

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formFullName.trim(),
          company: formCompany.trim(),
          email: formEmail.trim(),
          phone: formPhone.trim(),
          service_slug: 'soporte-tecnico-servicios-ti',
          service_name: `Plan ${activePlan.name} (${formatUf(payloadQuoteDetails.net_uf)}/mes + IVA)`,
          company_size: `${payloadQuoteDetails.users_count} usuarios / ${payloadQuoteDetails.computers_count} equipos`,
          budget_range: `${formatUf(payloadQuoteDetails.net_uf)} + IVA (${formatClp(payloadQuoteDetails.net_clp)} neto/mes)`,
          description: formDescription.trim(),
          privacy_accepted: formPrivacy,
          website_url: formHoneypot,
          referral_source:
            modalSource === 'smart_quoter'
              ? 'Cotizador Inteligente Web'
              : `Selector de Planes (${activePlan.name})`,
          source_page: window.location.pathname,
          utm_source: urlParams.get('utm_source'),
          utm_medium: urlParams.get('utm_medium'),
          utm_campaign: urlParams.get('utm_campaign'),
          utm_term: urlParams.get('utm_term'),
          utm_content: urlParams.get('utm_content'),
          quote_details: payloadQuoteDetails,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setSubmitError(
          data?.error ||
            'No pudimos registrar tu solicitud en este momento. Por favor verifica tus datos o contáctanos por WhatsApp.'
        );
        setSubmitting(false);
        return;
      }

      setSubmitSuccess({
        leadCode: data.lead_code || 'SO-2026',
        message:
          data.message ||
          '¡Solicitud registrada con éxito! Nuestro equipo técnico te contactará para coordinar tu diagnóstico gratuito.',
        planName: activePlan.name,
      });
      setSubmitting(false);
    } catch {
      setSubmitError(
        'Error de conexión al enviar tu solicitud. Por favor intenta nuevamente o escríbenos por WhatsApp.'
      );
      setSubmitting(false);
    }
  };

  const handleSendQuoteToWhatsApp = () => {
    const cfg = quoteCalculation.configuration;
    const cleanPhone = (settings.whatsapp_number || '56958324650').replace(/\D/g, '');
    const msg = `Hola Site On Tecnología, simulé mi plan en el Cotizador Inteligente de la web:\n\n• *Plan recomendado:* ${cfg.recommended_plan_name}\n• *Usuarios:* ${cfg.users_count} | *Equipos:* ${cfg.computers_count}\n• *Servidores:* ${cfg.servers_count} | *Sucursales:* ${cfg.branches_count}\n• *Estimación mensual:* ${formatUf(cfg.net_uf)} + IVA (${formatClp(cfg.net_clp)} neto / ${formatClp(cfg.total_clp_with_iva)} IVA incl.)\n\nMe gustaría agendar el diagnóstico inicial gratuito para validar el alcance.`;

    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'whatsapp_click',
        page_path: window.location.pathname,
        service_slug: cfg.recommended_plan_slug,
        metadata: {
          origin: 'smart_quoter_whatsapp',
          net_uf: cfg.net_uf,
          net_clp: cfg.net_clp,
        },
      }),
    }).catch(() => {});

    window.open(
      `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const parsedConverterUf = Math.max(0, Number(converterUfInput.replace(',', '.')) || 0);
  const convertedClpNet = convertUfToClp(parsedConverterUf, ufRateClp);
  const convertedClpIva = Math.round(
    convertedClpNet * ((pricingConfig.iva_percentage || 19) / 100)
  );

  return (
    <section
      id="planes-soporte"
      className={`relative overflow-hidden ${
        standalonePage ? 'pt-12 pb-28' : 'py-24'
      } bg-gradient-to-b from-[#081c2b]/95 via-[#0d2638]/95 to-[#091e2e]/95 text-white border-b border-teal-300/20`}
    >
      {/* Efectos sutiles de iluminación radial tipo Stripe / Linear */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[460px] w-[980px] rounded-full bg-gradient-to-r from-[#2dd4bf]/15 via-[#5eead4]/10 to-[#0284c7]/15 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ==================== BANNER PROMOCIONAL Y CABECERA ==================== */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          {pricingConfig.promo_active && pricingConfig.promo_text && (
            <div className="inline-flex items-center gap-2 rounded-full border border-[#5eead4]/50 bg-[#11354d]/90 px-4 py-1.5 text-xs font-bold text-[#99f6e4] mb-5 shadow-lg">
              <Sparkles className="h-3.5 w-3.5 text-[#5eead4] shrink-0" />
              <span>{pricingConfig.promo_text}</span>
            </div>
          )}

          <div className="block">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-300/30 bg-[#2dd4bf]/15 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-widest text-[#5eead4]">
              {pricingConfig.section_badge}
            </span>
          </div>

          <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-white mt-4 leading-[1.12]">
            {pricingConfig.section_title}
          </h2>

          <p className="text-base sm:text-lg text-teal-50/85 mt-4 leading-relaxed">
            {pricingConfig.section_subtitle}
          </p>
        </div>

        {/* ==================== BARRA DE CALCULADORA UF / CLP OFICIAL ==================== */}
        <div className="mb-12 rounded-2xl border border-teal-300/25 bg-[#0f2d42]/90 p-4 sm:px-6 shadow-xl backdrop-blur-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2dd4bf]/20 border border-[#5eead4]/40 text-[#5eead4]">
                <Calculator className="h-5 w-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#99f6e4]">
                    Tasa de Conversión Activa:
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#081c2b] border border-[#5eead4]/40 px-2.5 py-0.5 text-sm font-extrabold text-[#5eead4]">
                    1 UF = ${ufRateClp.toLocaleString('es-CL')} CLP
                  </span>
                  <span className="text-xs text-teal-100/75">
                    • Actualizado: <strong className="text-white">{ufDate}</strong> ({ufSourceLabel})
                  </span>
                </div>
                <p className="text-xs text-teal-100/75 mt-0.5">
                  Todos los planes y el cotizador expresan{' '}
                  <strong className="text-[#99f6e4]">
                    valores netos mensuales más IVA ({pricingConfig.iva_percentage}%)
                  </strong>
                  . Los contratos se pactan en UF.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {officialDailyUf &&
                Math.round(officialDailyUf.value) !== Math.round(ufRateClp) && (
                  <button
                    type="button"
                    onClick={handleRefreshOfficialUf}
                    disabled={syncingUf}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-teal-300/35 bg-[#133852] hover:bg-[#194766] px-3.5 py-2 text-xs font-bold text-teal-50 transition-all"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${syncingUf ? 'animate-spin' : ''}`} />
                    <span>
                      Usar UF SII Hoy (${officialDailyUf.value.toLocaleString('es-CL')})
                    </span>
                  </button>
                )}

              {Math.round(ufRateClp) !== Math.round(pricingConfig.uf_value_clp || 41290) && (
                <button
                  type="button"
                  onClick={handleUseReferenceUf}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-teal-300/35 bg-[#133852] hover:bg-[#194766] px-3.5 py-2 text-xs font-bold text-teal-50 transition-all"
                >
                  <span>Restaurar UF Referencia (${(pricingConfig.uf_value_clp || 41290).toLocaleString('es-CL')})</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowUfConverter((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#5eead4]/15 hover:bg-[#5eead4]/25 border border-[#5eead4]/40 px-3.5 py-2 text-xs font-extrabold text-[#99f6e4] transition-all"
              >
                <Calculator className="h-3.5 w-3.5" />
                <span>{showUfConverter ? 'Ocultar Calculadora UF' : 'Calculadora UF ↔ CLP'}</span>
              </button>

              <a
                href="#cotizador-inteligente"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#5eead4] hover:bg-[#99f6e4] px-4 py-2 text-xs font-extrabold text-slate-950 transition-all shadow-md"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Ir al Cotizador Inteligente</span>
              </a>
            </div>
          </div>

          {/* Convertidor interactivo desplegable UF <-> CLP + IVA */}
          {showUfConverter && (
            <div className="mt-4 pt-4 border-t border-teal-300/20 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-teal-100/80 mb-1">
                  Monto en UF a simular
                </label>
                <div className="flex items-center rounded-xl border border-teal-300/35 bg-[#081c2b] px-3 py-2">
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="200"
                    value={converterUfInput}
                    onChange={(e) => setConverterUfInput(e.target.value)}
                    className="w-full bg-transparent text-sm font-extrabold text-white focus:outline-none"
                  />
                  <span className="text-xs font-bold text-[#5eead4] ml-2">UF</span>
                </div>
              </div>

              <div className="rounded-xl bg-[#081c2b]/90 border border-teal-300/20 p-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-teal-100/70">
                  Equivalencia Neta (Sin IVA)
                </div>
                <div className="text-base font-display font-extrabold text-white mt-0.5">
                  {formatClp(convertedClpNet)}
                </div>
              </div>

              <div className="rounded-xl bg-[#081c2b]/90 border border-teal-300/20 p-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-teal-100/70">
                  IVA ({pricingConfig.iva_percentage}%)
                </div>
                <div className="text-base font-display font-extrabold text-teal-100 mt-0.5">
                  {formatClp(convertedClpIva)}
                </div>
              </div>

              <div className="rounded-xl bg-[#133b54] border border-[#5eead4]/40 p-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#99f6e4]">
                  Total Estimado con IVA
                </div>
                <div className="text-base font-display font-extrabold text-[#5eead4] mt-0.5">
                  {formatClp(convertedClpNet + convertedClpIva)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ==================== 2. TARJETAS DE LOS 4 PLANES COMERCIALES ==================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch mb-20">
          {activePlans.map((plan) => {
            const isRecommended = plan.recommended;
            const netClp = convertUfToClp(plan.price_uf, ufRateClp);
            const ivaClp = Math.round(netClp * ((pricingConfig.iva_percentage || 19) / 100));

            return (
              <div
                key={plan.id}
                className={`group relative rounded-3xl p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 ${
                  isRecommended
                    ? 'bg-gradient-to-b from-[#13405e] via-[#0f3149] to-[#0a2234] border-2 border-[#5eead4] shadow-[0_24px_60px_rgba(45,212,191,0.28)] lg:scale-[1.03] z-10'
                    : 'bg-[#0f2d42]/90 hover:bg-[#133750]/95 border border-teal-300/25 hover:border-[#5eead4]/55 shadow-xl'
                }`}
              >
                {isRecommended && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-[#5eead4] to-[#2dd4bf] px-4 py-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-950 shadow-lg">
                    ★ PLAN RECOMENDADO
                  </div>
                )}

                <div>
                  {/* Cabecera del Plan */}
                  <div className="flex items-center justify-between gap-2 mb-4 pt-1">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold ${
                        isRecommended
                          ? 'bg-[#5eead4]/20 text-[#99f6e4] border border-[#5eead4]/40'
                          : 'bg-[#081c2b] text-teal-100 border border-teal-300/25'
                      }`}
                    >
                      <Users className="h-3 w-3 text-[#5eead4]" />
                      <span>Hasta {plan.max_users} usuarios</span>
                    </span>

                    <span className="text-[11px] font-bold text-[#67e8f9]">
                      {plan.is_from_price ? 'Escalable' : 'Diagnóstico Gratis'}
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-extrabold text-white tracking-tight">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-teal-100/80 mt-1.5 min-h-[36px] leading-relaxed">
                    {plan.tagline}
                  </p>

                  {/* Bloque de Precio UF y CLP */}
                  <div className="my-6 pb-5 border-b border-teal-300/20">
                    <div className="flex items-baseline gap-1.5">
                      {plan.is_from_price && (
                        <span className="text-xs font-bold uppercase tracking-wider text-[#99f6e4]">
                          Desde
                        </span>
                      )}
                      <span className="font-display text-3xl sm:text-4xl font-extrabold text-white">
                        {formatUf(plan.price_uf)}
                      </span>
                      <span className="text-xs font-bold text-teal-100/80">/ mes + IVA</span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center justify-between gap-1 rounded-xl bg-[#081c2b]/85 border border-teal-300/20 px-3 py-2">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-teal-200/75">
                          Referencia actual neta:
                        </div>
                        <div className="text-sm font-extrabold text-[#5eead4]">
                          {plan.is_from_price ? 'Desde ' : ''}
                          {formatClp(netClp)}{' '}
                          <span className="text-[11px] font-semibold text-teal-100/75">+ IVA</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-teal-100/65">Total c/IVA:</div>
                        <div className="text-xs font-bold text-teal-50">
                          {formatClp(netClp + ivaClp)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lista de características */}
                  <div className="mb-6">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#99f6e4] mb-3">
                      Qué incluye este plan:
                    </div>
                    <ul className="space-y-2.5">
                      {plan.features.map((feat) => (
                        <li
                          key={feat}
                          className="flex items-start gap-2.5 text-xs text-teal-50/90 leading-relaxed"
                        >
                          <CheckCircle2 className="h-4 w-4 text-[#5eead4] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Botones CTA */}
                <div className="space-y-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => openModalFromPlanCard(plan)}
                    className={`w-full inline-flex items-center justify-center gap-2 rounded-full py-3.5 px-5 text-xs font-extrabold transition-all shadow-lg ${
                      isRecommended
                        ? 'bg-[#5eead4] hover:bg-[#99f6e4] text-slate-950 shadow-[0_10px_25px_rgba(94,234,212,0.3)]'
                        : 'bg-[#174666] hover:bg-[#5eead4] text-white hover:text-slate-950 border border-[#5eead4]/40'
                    }`}
                  >
                    <span>{plan.cta_label}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => loadPlanIntoQuoter(plan)}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-full py-2 px-4 text-[11px] font-bold text-[#99f6e4] hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Calculator className="h-3.5 w-3.5" />
                    <span>Personalizar con adicionales en Cotizador</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ==================== 3. COTIZADOR INTELIGENTE INTERACTIVO ==================== */}
        <div
          id="cotizador-inteligente"
          className="scroll-mt-24 rounded-3xl border-2 border-[#5eead4]/45 bg-gradient-to-br from-[#0e2c40]/95 via-[#0a2132]/95 to-[#081a28]/95 p-6 sm:p-10 shadow-[0_25px_70px_rgba(8,28,43,0.75)] mb-20"
        >
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 pb-6 border-b border-teal-300/20 gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#5eead4]/20 border border-[#5eead4]/40 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-[#99f6e4]">
                <SlidersHorizontal className="h-3.5 w-3.5 text-[#5eead4]" />
                <span>Simulador de Presupuesto TI en Tiempo Real</span>
              </span>
              <h3 className="font-display text-2xl sm:text-4xl font-extrabold text-white mt-3">
                Cotizador Inteligente Site On
              </h3>
              <p className="text-sm sm:text-base text-teal-50/85 mt-1.5 max-w-2xl">
                Configura la cantidad de usuarios, equipos, servidores y servicios que utiliza tu
                empresa. El sistema recomienda automáticamente el plan ideal{' '}
                <strong className="text-[#5eead4]">
                  sin cobrar dos veces lo que ya está incluido
                </strong>
                .
              </p>
            </div>

            {manualPlanOverrideSlug && (
              <button
                type="button"
                onClick={() => setManualPlanOverrideSlug(null)}
                className="self-start lg:self-auto inline-flex items-center gap-1.5 rounded-xl border border-[#5eead4]/40 bg-[#133852] px-3.5 py-2 text-xs font-bold text-[#99f6e4] hover:bg-[#194766]"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Volver a recomendación automática</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Columna Izquierda (7 cols): Controles del Cotizador */}
            <div className="lg:col-span-7 space-y-6">
              {/* 1. Sliders Numéricos: Usuarios, Computadores, Servidores, Sucursales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Cantidad de Usuarios */}
                <div className="rounded-2xl border border-teal-300/25 bg-[#0b2233]/90 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-[#5eead4]" />
                      <label className="text-xs font-extrabold uppercase tracking-wider text-teal-50">
                        Cantidad de Usuarios
                      </label>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const next = Math.max(1, usersCount - 1);
                          setUsersCount(next);
                          if (computersCount < next) setComputersCount(next);
                        }}
                        className="h-7 w-7 rounded-lg bg-[#143952] hover:bg-[#5eead4] text-white hover:text-slate-950 flex items-center justify-center transition-colors"
                        aria-label="Disminuir usuarios"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="min-w-[38px] text-center font-display text-lg font-extrabold text-[#5eead4]">
                        {usersCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const next = Math.min(50, usersCount + 1);
                          setUsersCount(next);
                          if (computersCount < next) setComputersCount(next);
                        }}
                        className="h-7 w-7 rounded-lg bg-[#143952] hover:bg-[#5eead4] text-white hover:text-slate-950 flex items-center justify-center transition-colors"
                        aria-label="Aumentar usuarios"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={40}
                    value={usersCount}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setUsersCount(val);
                      if (computersCount < val) setComputersCount(val);
                    }}
                    className="w-full accent-[#5eead4] cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-teal-100/65 mt-1">
                    <span>1 usuario</span>
                    <span>Adicional: {formatUf(pricingConfig.addon_rates.extra_user_uf)}/mes</span>
                    <span>40+</span>
                  </div>
                </div>

                {/* Cantidad de Computadores */}
                <div className="rounded-2xl border border-teal-300/25 bg-[#0b2233]/90 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Laptop className="h-4 w-4 text-[#5eead4]" />
                      <label className="text-xs font-extrabold uppercase tracking-wider text-teal-50">
                        Computadores / Equipos
                      </label>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setComputersCount(Math.max(1, computersCount - 1))}
                        className="h-7 w-7 rounded-lg bg-[#143952] hover:bg-[#5eead4] text-white hover:text-slate-950 flex items-center justify-center transition-colors"
                        aria-label="Disminuir computadores"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="min-w-[38px] text-center font-display text-lg font-extrabold text-[#5eead4]">
                        {computersCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => setComputersCount(Math.min(60, computersCount + 1))}
                        className="h-7 w-7 rounded-lg bg-[#143952] hover:bg-[#5eead4] text-white hover:text-slate-950 flex items-center justify-center transition-colors"
                        aria-label="Aumentar computadores"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={50}
                    value={computersCount}
                    onChange={(e) => setComputersCount(Number(e.target.value))}
                    className="w-full accent-[#5eead4] cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-teal-100/65 mt-1">
                    <span>1 PC/Mac</span>
                    <span>Extra: {formatUf(pricingConfig.addon_rates.extra_computer_uf)}/mes</span>
                    <span>50+</span>
                  </div>
                </div>

                {/* Cantidad de Servidores */}
                <div className="rounded-2xl border border-teal-300/25 bg-[#0b2233]/90 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-[#5eead4]" />
                      <label className="text-xs font-extrabold uppercase tracking-wider text-teal-50">
                        Servidores (Win / Linux)
                      </label>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setServersCount(Math.max(0, serversCount - 1))}
                        className="h-7 w-7 rounded-lg bg-[#143952] hover:bg-[#5eead4] text-white hover:text-slate-950 flex items-center justify-center transition-colors"
                        aria-label="Disminuir servidores"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="min-w-[38px] text-center font-display text-lg font-extrabold text-[#5eead4]">
                        {serversCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => setServersCount(Math.min(12, serversCount + 1))}
                        className="h-7 w-7 rounded-lg bg-[#143952] hover:bg-[#5eead4] text-white hover:text-slate-950 flex items-center justify-center transition-colors"
                        aria-label="Aumentar servidores"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    value={serversCount}
                    onChange={(e) => setServersCount(Number(e.target.value))}
                    className="w-full accent-[#5eead4] cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-teal-100/65 mt-1">
                    <span>Sin servidor</span>
                    <span>Desde {formatUf(pricingConfig.addon_rates.managed_server_uf)}/srv</span>
                    <span>10 srv</span>
                  </div>
                </div>

                {/* Cantidad de Sucursales */}
                <div className="rounded-2xl border border-teal-300/25 bg-[#0b2233]/90 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-[#5eead4]" />
                      <label className="text-xs font-extrabold uppercase tracking-wider text-teal-50">
                        Sucursales / Oficinas
                      </label>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setBranchesCount(Math.max(1, branchesCount - 1))}
                        className="h-7 w-7 rounded-lg bg-[#143952] hover:bg-[#5eead4] text-white hover:text-slate-950 flex items-center justify-center transition-colors"
                        aria-label="Disminuir sucursales"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="min-w-[38px] text-center font-display text-lg font-extrabold text-[#5eead4]">
                        {branchesCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => setBranchesCount(Math.min(10, branchesCount + 1))}
                        className="h-7 w-7 rounded-lg bg-[#143952] hover:bg-[#5eead4] text-white hover:text-slate-950 flex items-center justify-center transition-colors"
                        aria-label="Aumentar sucursales"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={8}
                    value={branchesCount}
                    onChange={(e) => setBranchesCount(Number(e.target.value))}
                    className="w-full accent-[#5eead4] cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-teal-100/65 mt-1">
                    <span>1 sede principal</span>
                    <span>Visitas desde {formatUf(pricingConfig.addon_rates.extra_visit_uf)}</span>
                    <span>8 sedes</span>
                  </div>
                </div>
              </div>

              {/* 2. Selector de Plataforma de Correo (Microsoft 365 / Google Workspace) */}
              <div className="rounded-2xl border border-teal-300/25 bg-[#0b2233]/90 p-5">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-[#99f6e4] mb-3">
                  ¿Utilizas Microsoft 365 o Google Workspace en tu empresa?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'microsoft_365', label: 'Microsoft 365' },
                    { id: 'google_workspace', label: 'Google Workspace' },
                    { id: 'both', label: 'Ambos entornos' },
                    { id: 'none', label: 'Correo básico / Otro' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() =>
                        setProductivitySuite(
                          opt.id as 'none' | 'microsoft_365' | 'google_workspace' | 'both'
                        )
                      }
                      className={`rounded-xl px-3 py-2.5 text-xs font-bold border transition-all ${
                        productivitySuite === opt.id
                          ? 'bg-[#5eead4] text-slate-950 border-[#5eead4] font-extrabold shadow-md'
                          : 'bg-[#081c2b] text-teal-50 border-teal-300/25 hover:border-[#5eead4]/50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Modalidad de Soporte Requerido */}
              <div className="rounded-2xl border border-teal-300/25 bg-[#0b2233]/90 p-5">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-[#99f6e4] mb-3">
                  Modalidad de Soporte TI preferida
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    {
                      id: 'remote_only',
                      title: '100% Remoto Ágil',
                      desc: 'Asistencia inmediata en línea en horario hábil',
                    },
                    {
                      id: 'remote_and_scheduled_onsite',
                      title: 'Remoto + Visitas Programadas',
                      desc: 'Atención remota continua + mantención en terreno',
                    },
                    {
                      id: 'intensive_onsite',
                      title: 'Presencial Intensivo / Corporativo',
                      desc: 'Múltiples sedes, SLA a medida y consultoría',
                    },
                  ].map((mod) => (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() =>
                        setSupportModality(
                          mod.id as
                            | 'remote_only'
                            | 'remote_and_scheduled_onsite'
                            | 'intensive_onsite'
                        )
                      }
                      className={`text-left rounded-xl p-3.5 border transition-all ${
                        supportModality === mod.id
                          ? 'bg-[#143d59] border-[#5eead4] shadow-md'
                          : 'bg-[#081c2b] border-teal-300/20 hover:border-teal-300/45'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-white">{mod.title}</span>
                        {supportModality === mod.id && (
                          <CheckCircle2 className="h-4 w-4 text-[#5eead4] shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-teal-100/75 mt-1">{mod.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Requerimientos Técnicos Especializados (Monitoreo, Cloud, IA) */}
              <div className="rounded-2xl border border-teal-300/25 bg-[#0b2233]/90 p-5">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-[#99f6e4] mb-3">
                  Capas Tecnológicas Adicionales
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setRequiresMonitoring((v) => !v)}
                    className={`flex flex-col justify-between text-left rounded-xl p-3.5 border transition-all ${
                      requiresMonitoring
                        ? 'bg-[#143d59] border-[#5eead4]'
                        : 'bg-[#081c2b] border-teal-300/20 hover:border-teal-300/45'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <MonitorCheck className="h-4 w-4 text-[#5eead4]" />
                      <span
                        className={`h-4 w-4 rounded flex items-center justify-center text-[10px] font-bold ${
                          requiresMonitoring
                            ? 'bg-[#5eead4] text-slate-950'
                            : 'border border-teal-300/40'
                        }`}
                      >
                        {requiresMonitoring && <Check className="h-3 w-3" />}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-white">
                        Monitoreo de Infraestructura
                      </div>
                      <div className="text-[11px] text-teal-100/70 mt-0.5">
                        Incluido en Business Pro / Enterprise
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRequiresCloud((v) => !v)}
                    className={`flex flex-col justify-between text-left rounded-xl p-3.5 border transition-all ${
                      requiresCloud
                        ? 'bg-[#143d59] border-[#5eead4]'
                        : 'bg-[#081c2b] border-teal-300/20 hover:border-teal-300/45'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <Cloud className="h-4 w-4 text-[#67e8f9]" />
                      <span
                        className={`h-4 w-4 rounded flex items-center justify-center text-[10px] font-bold ${
                          requiresCloud
                            ? 'bg-[#5eead4] text-slate-950'
                            : 'border border-teal-300/40'
                        }`}
                      >
                        {requiresCloud && <Check className="h-3 w-3" />}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-white">
                        Servicios Cloud & Respaldos
                      </div>
                      <div className="text-[11px] text-teal-100/70 mt-0.5">
                        Incluido en Enterprise (+{formatUf(pricingConfig.addon_rates.cloud_management_uf)} en otros)
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRequiresAutomationAi((v) => !v)}
                    className={`flex flex-col justify-between text-left rounded-xl p-3.5 border transition-all ${
                      requiresAutomationAi
                        ? 'bg-[#143d59] border-[#5eead4]'
                        : 'bg-[#081c2b] border-teal-300/20 hover:border-teal-300/45'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <Cpu className="h-4 w-4 text-[#5eead4]" />
                      <span
                        className={`h-4 w-4 rounded flex items-center justify-center text-[10px] font-bold ${
                          requiresAutomationAi
                            ? 'bg-[#5eead4] text-slate-950'
                            : 'border border-teal-300/40'
                        }`}
                      >
                        {requiresAutomationAi && <Check className="h-3 w-3" />}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-white">
                        Automatización & IA
                      </div>
                      <div className="text-[11px] text-teal-100/70 mt-0.5">
                        Flujos comerciales y bots (+{formatUf(pricingConfig.addon_rates.automation_ai_uf)})
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Columna Derecha (5 cols): Resultado del Cotizador y Desglose UF / CLP + IVA */}
            <div className="lg:col-span-5 rounded-3xl border-2 border-[#5eead4] bg-gradient-to-b from-[#11354d] to-[#081c2b] p-6 sm:p-7 shadow-2xl">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#5eead4] px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-950">
                  <Sparkles className="h-3 w-3" />
                  <span>Plan Recomendado para ti</span>
                </span>
                <span className="text-xs font-bold text-[#99f6e4]">
                  Base: {formatUf(quoteCalculation.selectedPlan.price_uf)}/mes
                </span>
              </div>

              <h4 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
                {quoteCalculation.selectedPlan.name}
              </h4>
              <p className="text-xs text-teal-100/85 mt-1.5 leading-relaxed">
                {quoteCalculation.recommendationReason}
              </p>

              {/* Selector rápido por si desea comparar otro plan base */}
              <div className="mt-4 pt-3 border-t border-teal-300/20">
                <div className="text-[10px] font-bold uppercase tracking-wider text-teal-200/75 mb-2">
                  Cambiar plan base manualmente:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {activePlans.map((p) => (
                    <button
                      key={p.slug}
                      type="button"
                      onClick={() =>
                        setManualPlanOverrideSlug(
                          p.slug === quoteCalculation.autoPlanSlug ? null : p.slug
                        )
                      }
                      className={`rounded-lg px-2 py-1.5 text-[10px] font-extrabold border transition-all truncate ${
                        quoteCalculation.selectedPlan.slug === p.slug
                          ? 'bg-[#5eead4]/25 border-[#5eead4] text-white'
                          : 'bg-[#081c2b]/70 border-teal-300/20 text-teal-100/70 hover:text-white'
                      }`}
                    >
                      {p.name.replace('SITE ON ', '')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Desglose de precio base + adicionales sin doble cobro */}
              <div className="mt-5 pt-4 border-t border-teal-300/20 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span>Precio base {quoteCalculation.selectedPlan.name}</span>
                  <span>
                    {formatUf(quoteCalculation.configuration.base_price_uf)} (
                    {formatClp(quoteCalculation.basePriceClp)})
                  </span>
                </div>

                {quoteCalculation.configuration.addons_breakdown.map((item, i) => (
                  <div
                    key={`${item.label}-${i}`}
                    className="flex items-start justify-between gap-3 text-xs"
                  >
                    <span className="text-teal-100/85 flex items-start gap-1.5">
                      <CheckCircle2
                        className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${
                          item.included_in_plan ? 'text-[#5eead4]' : 'text-[#67e8f9]'
                        }`}
                      />
                      <span>{item.label}</span>
                    </span>
                    <span
                      className={`font-bold whitespace-nowrap ${
                        item.included_in_plan ? 'text-[#5eead4]' : 'text-white'
                      }`}
                    >
                      {item.included_in_plan
                        ? 'Incluido (0 UF)'
                        : `+${formatUf(item.uf)}`}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totales Neto, IVA y Total con IVA */}
              <div className="mt-6 rounded-2xl bg-[#071622] border border-teal-300/30 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-teal-100/85">
                  <span>Subtotal Mensual Neto:</span>
                  <span className="font-bold text-white">
                    {formatUf(quoteCalculation.configuration.net_uf)} •{' '}
                    {formatClp(quoteCalculation.configuration.net_clp)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-teal-100/75">
                  <span>IVA ({quoteCalculation.ivaPct}%):</span>
                  <span>
                    {formatUf(quoteCalculation.configuration.iva_uf)} •{' '}
                    {formatClp(quoteCalculation.configuration.iva_clp)}
                  </span>
                </div>

                <div className="pt-2.5 border-t border-teal-300/20 flex items-baseline justify-between">
                  <div>
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#99f6e4]">
                      Total Mensual Estimado (Con IVA)
                    </div>
                    <div className="text-xs font-bold text-[#5eead4] mt-0.5">
                      Equivalente a {formatUf(quoteCalculation.configuration.net_uf)} + IVA
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-2xl sm:text-3xl font-extrabold text-white">
                      {formatClp(quoteCalculation.configuration.total_clp_with_iva)}
                    </div>
                    <div className="text-[10px] text-teal-100/70">
                      ({formatUf(quoteCalculation.configuration.total_uf_with_iva)} IVA incl.)
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#0f2d42]/80 border border-teal-300/20 p-3 text-[11px] text-teal-100/85 leading-relaxed">
                <Info className="h-4 w-4 text-[#5eead4] shrink-0 mt-0.5" />
                <span>
                  El valor final está sujeto a{' '}
                  <strong className="text-white">diagnóstico técnico gratuito</strong> y validación
                  del alcance operativo junto a nuestro equipo.
                </span>
              </div>

              {/* Botones de Conversión del Cotizador */}
              <div className="mt-5 space-y-2.5">
                <button
                  type="button"
                  onClick={openModalFromSmartQuoter}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#5eead4] hover:bg-[#99f6e4] py-4 px-6 text-sm font-extrabold text-slate-950 transition-all shadow-[0_12px_30px_rgba(94,234,212,0.35)]"
                >
                  <span>Solicitar diagnóstico con esta cotización</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={handleSendQuoteToWhatsApp}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-[#5eead4]/40 bg-[#12354d] hover:bg-[#184563] py-3 px-5 text-xs font-extrabold text-white transition-all"
                >
                  <MessageCircle className="h-4 w-4 text-[#5eead4]" />
                  <span>Enviar esta simulación por WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== 4. COMPARADOR DE CARACTERÍSTICAS DE PLANES ==================== */}
        <div id="comparador-planes" className="scroll-mt-24 mb-20">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-300/30 bg-[#2dd4bf]/15 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#99f6e4]">
              Comparativa Técnica Transparente
            </span>
            <h3 className="font-display text-2xl sm:text-4xl font-extrabold text-white mt-3">
              Compara qué incluye cada plan mensual
            </h3>
            <p className="text-sm sm:text-base text-teal-50/80 mt-2">
              Revisa en detalle los alcances de atención, administración de sistemas, respaldos y
              niveles de servicio (SLA) antes de solicitar tu diagnóstico.
            </p>
          </div>

          {/* Selector adaptable para Móviles */}
          <div className="lg:hidden mb-6">
            <div className="text-xs font-bold uppercase tracking-wider text-[#99f6e4] mb-2 text-center">
              Selecciona un plan para ver sus características:
            </div>
            <div className="grid grid-cols-2 gap-2">
              {activePlans.map((p) => (
                <button
                  key={p.slug}
                  type="button"
                  onClick={() => setMobileComparedPlanSlug(p.slug)}
                  className={`rounded-xl py-2.5 px-3 text-xs font-extrabold border transition-all ${
                    mobileComparedPlanSlug === p.slug
                      ? 'bg-[#5eead4] text-slate-950 border-[#5eead4] shadow-md'
                      : 'bg-[#0f2d42] text-teal-50 border-teal-300/25'
                  }`}
                >
                  {p.name} ({formatUf(p.price_uf)})
                </button>
              ))}
            </div>

            {/* Tarjeta comparativa móvil del plan activo */}
            {(() => {
              const mobilePlan =
                activePlans.find((p) => p.slug === mobileComparedPlanSlug) || activePlans[0];
              if (!mobilePlan) return null;
              return (
                <div className="mt-4 rounded-3xl border border-[#5eead4]/40 bg-[#0f2d42]/95 p-5 space-y-3 shadow-xl">
                  <div className="flex items-center justify-between border-b border-teal-300/20 pb-3">
                    <div>
                      <h4 className="font-display text-lg font-extrabold text-white">
                        {mobilePlan.name}
                      </h4>
                      <div className="text-xs text-[#5eead4] font-bold">
                        {mobilePlan.is_from_price ? 'Desde ' : ''}
                        {formatUf(mobilePlan.price_uf)}/mes + IVA (
                        {formatClp(convertUfToClp(mobilePlan.price_uf, ufRateClp))})
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => openModalFromPlanCard(mobilePlan)}
                      className="rounded-full bg-[#5eead4] px-4 py-2 text-xs font-extrabold text-slate-950"
                    >
                      Solicitar
                    </button>
                  </div>

                  <div className="divide-y divide-teal-300/15">
                    {pricingConfig.comparison_rows.map((row) => {
                      const val = row.values[mobilePlan.slug];
                      return (
                        <div
                          key={row.id}
                          className="py-2.5 flex items-center justify-between gap-4 text-xs"
                        >
                          <span className="font-bold text-teal-100">{row.feature_name}</span>
                          <span className="text-right font-semibold text-white">
                            {val === true ? (
                              <span className="inline-flex items-center gap-1 text-[#5eead4]">
                                <CheckCircle2 className="h-4 w-4" /> Incluido
                              </span>
                            ) : val === false ? (
                              <span className="text-teal-200/40">No incluido</span>
                            ) : (
                              String(val)
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Tabla Comparativa Completa para Escritorio */}
          <div className="hidden lg:block overflow-hidden rounded-3xl border border-teal-300/25 bg-[#0c2436]/95 shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-teal-300/25 bg-[#081a28]">
                  <th className="py-5 px-6 text-xs font-extrabold uppercase tracking-wider text-[#99f6e4] w-[24%]">
                    Característica / Servicio
                  </th>
                  {activePlans.map((plan) => (
                    <th
                      key={plan.slug}
                      className={`py-5 px-5 text-center w-[19%] ${
                        plan.recommended ? 'bg-[#143d59]/75 border-x border-[#5eead4]/40' : ''
                      }`}
                    >
                      {plan.recommended && (
                        <div className="inline-block rounded-full bg-[#5eead4] px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-slate-950 mb-1.5">
                          Recomendado
                        </div>
                      )}
                      <div className="font-display text-base font-extrabold text-white">
                        {plan.name}
                      </div>
                      <div className="text-sm font-extrabold text-[#5eead4] mt-0.5">
                        {plan.is_from_price ? 'Desde ' : ''}
                        {formatUf(plan.price_uf)} / mes
                      </div>
                      <div className="text-[11px] text-teal-100/75">
                        {formatClp(convertUfToClp(plan.price_uf, ufRateClp))} + IVA
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-teal-300/15 text-xs">
                {pricingConfig.comparison_rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-[#113249]/60 transition-colors"
                  >
                    <td className="py-4 px-6 font-bold text-white">{row.feature_name}</td>
                    {activePlans.map((plan) => {
                      const val = row.values[plan.slug];
                      return (
                        <td
                          key={`${row.id}-${plan.slug}`}
                          className={`py-4 px-5 text-center ${
                            plan.recommended
                              ? 'bg-[#143d59]/40 border-x border-[#5eead4]/30 font-semibold text-white'
                              : 'text-teal-50/90'
                          }`}
                        >
                          {val === true ? (
                            <span className="inline-flex items-center justify-center gap-1 text-[#5eead4] font-bold">
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Incluido</span>
                            </span>
                          ) : val === false ? (
                            <span className="inline-flex items-center justify-center text-teal-200/35">
                              —
                            </span>
                          ) : (
                            <span>{String(val)}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Fila final de botones CTA */}
                <tr className="bg-[#081a28]/90">
                  <td className="py-5 px-6 text-xs font-bold text-[#99f6e4]">
                    Comienza con diagnóstico gratis
                  </td>
                  {activePlans.map((plan) => (
                    <td
                      key={`cta-${plan.slug}`}
                      className={`py-5 px-4 text-center ${
                        plan.recommended ? 'bg-[#143d59]/60 border-x border-[#5eead4]/40' : ''
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => openModalFromPlanCard(plan)}
                        className={`w-full rounded-full py-2.5 px-3 text-xs font-extrabold transition-all ${
                          plan.recommended
                            ? 'bg-[#5eead4] hover:bg-[#99f6e4] text-slate-950 shadow-md'
                            : 'bg-[#174666] hover:bg-[#5eead4] text-white hover:text-slate-950 border border-[#5eead4]/35'
                        }`}
                      >
                        {plan.cta_label}
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ==================== 5. REGLAS COMERCIALES, ALCANCE Y EXCLUSIONES ==================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Condiciones Operativas y Alcance */}
          <div className="rounded-3xl border border-teal-300/25 bg-[#0f2d42]/90 p-7 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2dd4bf]/20 border border-[#5eead4]/40 text-[#5eead4]">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-display text-lg font-extrabold text-white">
                  Condiciones de Contratación y Operación
                </h4>
                <p className="text-xs text-[#99f6e4]">
                  Claridad comercial desde el primer día, sin letra chica
                </p>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#081c2b]/90 border border-teal-300/20 p-3.5">
                <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#5eead4]">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Horario Hábil de Soporte</span>
                </div>
                <p className="text-xs text-teal-50/90 mt-1">{pricingConfig.support_hours}</p>
              </div>
              <div className="rounded-xl bg-[#081c2b]/90 border border-teal-300/20 p-3.5">
                <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#5eead4]">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>Cobertura de Visitas</span>
                </div>
                <p className="text-xs text-teal-50/90 mt-1">
                  {pricingConfig.onsite_coverage_area}
                </p>
              </div>
            </div>

            <ul className="space-y-2.5">
              {pricingConfig.hiring_conditions.map((cond, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-xs text-teal-50/90 leading-relaxed"
                >
                  <CheckCircle2 className="h-4 w-4 text-[#5eead4] shrink-0 mt-0.5" />
                  <span>{cond}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Exclusiones y Servicios Cotizables por Separado */}
          <div className="rounded-3xl border border-teal-300/25 bg-[#0f2d42]/90 p-7 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400/15 border border-amber-300/40 text-amber-300">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-display text-lg font-extrabold text-white">
                    Exclusiones del Abono Mensual (Cotización Independiente)
                  </h4>
                  <p className="text-xs text-amber-200/90">
                    Servicios y suministros que se presupuestan por proyecto o requerimiento
                  </p>
                </div>
              </div>

              <ul className="space-y-2.5 mb-6">
                {pricingConfig.exclusions.map((excl, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs text-teal-50/85 leading-relaxed"
                  >
                    <ChevronRight className="h-4 w-4 text-amber-300 shrink-0 mt-0.5" />
                    <span>{excl}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-teal-300/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <span className="text-xs text-teal-100/80">
                ¿Necesitas una migración, servidor nuevo, cableado de red o proyecto especial?
              </span>
              <button
                type="button"
                onClick={() => {
                  const entPlan =
                    activePlans.find((p) => p.slug === 'site-on-enterprise') || activePlans[0];
                  if (entPlan) {
                    setModalSource('plan_card');
                    setModalPlan(entPlan);
                    setFormDescription(
                      'Necesito cotizar un proyecto tecnológico especial (migración, servidores, licencias, equipamiento o soporte fuera de horario).'
                    );
                    setSubmitError(null);
                    setSubmitSuccess(null);
                    setModalOpen(true);
                  }
                }}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-[#174666] hover:bg-[#5eead4] text-white hover:text-slate-950 border border-[#5eead4]/40 px-4 py-2 text-xs font-extrabold transition-all"
              >
                <span>Cotizar proyecto independiente</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Nota legal inferior */}
        <p className="mt-8 text-center text-xs text-teal-100/65 max-w-4xl mx-auto leading-relaxed">
          * {pricingConfig.legal_disclaimer}
        </p>
      </div>

      {/* ==================== 6. MODAL DE SOLICITUD DE DIAGNÓSTICO Y PROPUESTA ==================== */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-diagnostic-title"
        >
          <div className="relative w-full max-w-2xl rounded-3xl border-2 border-[#5eead4] bg-[#0b2436] p-6 sm:p-8 text-white shadow-[0_25px_80px_rgba(0,0,0,0.85)] my-8">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full bg-[#133852] text-teal-100 hover:bg-[#5eead4] hover:text-slate-950 transition-colors"
              aria-label="Cerrar ventana"
            >
              <X className="h-4 w-4" />
            </button>

            {submitSuccess ? (
              <div className="py-6 text-center space-y-5">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#5eead4]/20 border-2 border-[#5eead4] text-[#5eead4]">
                  <CheckCircle2 className="h-9 w-9" />
                </div>

                <div>
                  <span className="inline-block rounded-full bg-[#5eead4]/20 border border-[#5eead4]/40 px-3.5 py-1 text-xs font-extrabold text-[#99f6e4]">
                    Código de Solicitud CRM: {submitSuccess.leadCode}
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white mt-3">
                    ¡Diagnóstico Solicitado con Éxito!
                  </h3>
                  <p className="text-sm text-teal-100/85 mt-2 max-w-lg mx-auto leading-relaxed">
                    {submitSuccess.message}
                  </p>
                </div>

                <div className="rounded-2xl bg-[#081a28] border border-teal-300/25 p-4 max-w-md mx-auto text-left text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-teal-100/70">Plan preseleccionado:</span>
                    <span className="font-extrabold text-[#5eead4]">
                      {submitSuccess.planName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-teal-100/70">Estado en CRM Site On:</span>
                    <span className="font-bold text-emerald-300">
                      Nuevo • Asignado a Ingeniería
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleSendQuoteToWhatsApp}
                    className="inline-flex items-center gap-2 rounded-full bg-[#5eead4] hover:bg-[#99f6e4] px-6 py-3 text-xs font-extrabold text-slate-950 transition-all shadow-lg"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Hablar ahora por WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="inline-flex items-center gap-2 rounded-full border border-teal-300/30 bg-[#133852] px-6 py-3 text-xs font-bold text-white"
                  >
                    <span>Volver a los planes</span>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="pr-8">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#5eead4]/20 border border-[#5eead4]/40 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#99f6e4]">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#5eead4]" />
                    <span>Diagnóstico Inicial Gratuito • Sin Compromiso</span>
                  </span>
                  <h3
                    id="modal-diagnostic-title"
                    className="font-display text-2xl font-extrabold text-white mt-2.5"
                  >
                    Solicitar Diagnóstico y Propuesta Comercial
                  </h3>
                </div>

                {/* Resumen del plan / cotización precargada */}
                {(() => {
                  const activePlan = modalPlan || quoteCalculation.selectedPlan;
                  const isQuoter = modalSource === 'smart_quoter';
                  const netUf = isQuoter
                    ? quoteCalculation.configuration.net_uf
                    : activePlan.price_uf;
                  const netClp = convertUfToClp(netUf, ufRateClp);
                  const totalClpWithIva = Math.round(
                    netClp * (1 + (pricingConfig.iva_percentage || 19) / 100)
                  );

                  return (
                    <div className="mt-4 mb-5 rounded-2xl bg-[#071824] border border-[#5eead4]/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#99f6e4]">
                          {isQuoter ? 'Configuración del Cotizador Web' : 'Plan Seleccionado'}
                        </div>
                        <div className="text-base font-extrabold text-white">
                          {activePlan.name}{' '}
                          <span className="text-xs font-normal text-teal-100/80">
                            ({isQuoter ? `${usersCount} usuarios, ${computersCount} equipos, ${serversCount} srv` : `Hasta ${activePlan.max_users} usuarios`})
                          </span>
                        </div>
                      </div>
                      <div className="sm:text-right">
                        <div className="text-sm font-extrabold text-[#5eead4]">
                          {formatUf(netUf)} / mes + IVA
                        </div>
                        <div className="text-[11px] text-teal-100/75">
                          Neto: {formatClp(netClp)} • c/IVA: {formatClp(totalClpWithIva)}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                <form onSubmit={handleDiagnosticSubmit} className="space-y-4">
                  {/* Honeypot oculto */}
                  <div className="hidden" aria-hidden="true">
                    <input
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={formHoneypot}
                      onChange={(e) => setFormHoneypot(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-teal-50 mb-1">
                        Nombre y Apellido *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Rodrigo Pérez"
                        value={formFullName}
                        onChange={(e) => setFormFullName(e.target.value)}
                        className="w-full rounded-xl border border-teal-300/30 bg-[#071824] px-3.5 py-2.5 text-sm text-white placeholder-teal-200/40 focus:border-[#5eead4] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-teal-50 mb-1">
                        Empresa / Organización
                      </label>
                      <input
                        type="text"
                        placeholder="Nombre de tu empresa"
                        value={formCompany}
                        onChange={(e) => setFormCompany(e.target.value)}
                        className="w-full rounded-xl border border-teal-300/30 bg-[#071824] px-3.5 py-2.5 text-sm text-white placeholder-teal-200/40 focus:border-[#5eead4] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-teal-50 mb-1">
                        Correo Corporativo o de Contacto *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="nombre@tuempresa.cl"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        className="w-full rounded-xl border border-teal-300/30 bg-[#071824] px-3.5 py-2.5 text-sm text-white placeholder-teal-200/40 focus:border-[#5eead4] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-teal-50 mb-1">
                        Teléfono / WhatsApp Directo *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+56 9 XXXX XXXX"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        className="w-full rounded-xl border border-teal-300/30 bg-[#071824] px-3.5 py-2.5 text-sm text-white placeholder-teal-200/40 focus:border-[#5eead4] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                    <div>
                      <label className="block text-xs font-bold text-teal-50 mb-1">
                        Cantidad de Usuarios *
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={500}
                        required
                        value={formUsersCount}
                        onChange={(e) => setFormUsersCount(Math.max(1, Number(e.target.value)))}
                        className="w-full rounded-xl border border-teal-300/30 bg-[#071824] px-3.5 py-2.5 text-sm font-bold text-[#5eead4] focus:border-[#5eead4] focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2 text-xs text-teal-100/75 pt-4">
                      Validaremos presencialmente o en remoto la cantidad exacta de estaciones de
                      trabajo, cuentas de correo y red durante el diagnóstico gratuito.
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-teal-50 mb-1">
                      Detalles de tu necesidad o situación actual *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="w-full rounded-xl border border-teal-300/30 bg-[#071824] px-3.5 py-2.5 text-xs text-white placeholder-teal-200/40 focus:border-[#5eead4] focus:outline-none leading-relaxed"
                    />
                  </div>

                  <label className="flex items-start gap-2.5 text-xs text-teal-100/85 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPrivacy}
                      onChange={(e) => setFormPrivacy(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded accent-[#5eead4]"
                    />
                    <span>
                      Autorizo a <strong>Site On Tecnología</strong> a tratar mis datos de contacto
                      para coordinar el diagnóstico técnico y enviarme la propuesta comercial,
                      conforme a la{' '}
                      <a
                        href="/privacidad"
                        target="_blank"
                        className="text-[#5eead4] underline hover:text-white"
                      >
                        Política de Privacidad
                      </a>
                      .
                    </span>
                  </label>

                  {submitError && (
                    <div className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-950/60 p-3 text-xs text-rose-200">
                      <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="w-full sm:w-auto rounded-full border border-teal-300/30 px-5 py-3 text-xs font-bold text-teal-100 hover:bg-white/5"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#5eead4] hover:bg-[#99f6e4] disabled:opacity-60 px-7 py-3.5 text-xs font-extrabold text-slate-950 transition-all shadow-lg"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Registrando solicitud en CRM...</span>
                        </>
                      ) : (
                        <>
                          <span>Confirmar y Solicitar Diagnóstico Gratuito</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

