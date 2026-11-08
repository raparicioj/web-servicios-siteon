import { NextResponse } from 'next/server';
import { getPlatformSettings } from '@/lib/supabase/crm-store';

export async function GET() {
  const settings = await getPlatformSettings();
  return NextResponse.json({
    company_name: settings.company_name,
    commercial_slogan: settings.commercial_slogan,
    whatsapp_number: settings.whatsapp_number,
    whatsapp_display: settings.whatsapp_display,
    whatsapp_tooltip: settings.whatsapp_tooltip,
    whatsapp_default_message: settings.whatsapp_default_message,
    contact_email: settings.contact_email,
    city: settings.city,
    region: settings.region,
    country: settings.country,
    linkedin_url: settings.linkedin_url,
    instagram_url: settings.instagram_url,
    facebook_url: settings.facebook_url,
  });
}

