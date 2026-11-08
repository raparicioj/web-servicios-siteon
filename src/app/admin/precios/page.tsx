import React from 'react';
import { Metadata } from 'next';
import { AdminCrmWorkspace } from '@/components/admin/AdminCrmWorkspace';

export const metadata: Metadata = {
  title: 'Administración de Planes y Precios UF | Site On CRM',
  robots: { index: false, follow: false },
};

export default function AdminPricingPage() {
  return <AdminCrmWorkspace initialTab="planes_precios" />;
}

