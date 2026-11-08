import { NextRequest, NextResponse } from 'next/server';
import { fetchOfficialUfFromApi, getPricingConfig } from '@/lib/supabase/crm-store';

export async function GET(req: NextRequest) {
  try {
    const force = req.nextUrl.searchParams.get('refresh') === '1';
    const [pricingConfig, officialUf] = await Promise.all([
      getPricingConfig(),
      fetchOfficialUfFromApi(force),
    ]);

    const activeUfValue =
      pricingConfig.uf_mode === 'official_auto' && officialUf?.value
        ? officialUf.value
        : pricingConfig.uf_value_clp;

    const activeUfDate =
      pricingConfig.uf_mode === 'official_auto' && officialUf?.date
        ? officialUf.date
        : pricingConfig.uf_last_updated;

    return NextResponse.json({
      ok: true,
      uf_mode: pricingConfig.uf_mode,
      active_uf_clp: activeUfValue,
      active_uf_date: activeUfDate,
      active_uf_source:
        pricingConfig.uf_mode === 'official_auto' && officialUf?.source
          ? officialUf.source
          : pricingConfig.uf_source_label,
      official_daily_uf: officialUf || {
        value: pricingConfig.uf_value_clp,
        date: pricingConfig.uf_last_updated,
        source: 'Último valor válido almacenado (Respaldo)',
      },
      configured_uf_clp: pricingConfig.uf_value_clp,
      iva_percentage: pricingConfig.iva_percentage,
    });
  } catch (err) {
    console.error('[API /api/uf GET] Error:', err);
    return NextResponse.json({
      ok: true,
      uf_mode: 'manual_reference',
      active_uf_clp: 41290,
      active_uf_date: new Date().toISOString().split('T')[0],
      active_uf_source: 'Respaldo Local Site On',
      official_daily_uf: {
        value: 41290,
        date: new Date().toISOString().split('T')[0],
        source: 'Respaldo Local Site On',
      },
      configured_uf_clp: 41290,
      iva_percentage: 19,
    });
  }
}

