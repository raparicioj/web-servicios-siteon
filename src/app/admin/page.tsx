import React from 'react';
import type { Metadata } from 'next';
import { AdminCrmWorkspace } from '@/components/admin/AdminCrmWorkspace';

export const metadata: Metadata = {
  title: 'Panel de Administración Centralizado | Site On Tecnología',
  robots: { index: false, follow: false },
};

export default function AdminDashboardPage() {
  return <AdminCrmWorkspace initialTab="dashboard" />;
}

