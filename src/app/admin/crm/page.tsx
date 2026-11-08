import React from 'react';
import type { Metadata } from 'next';
import { AdminCrmWorkspace } from '@/components/admin/AdminCrmWorkspace';

export const metadata: Metadata = {
  title: 'CRM Comercial & Pipeline Kanban | Site On Tecnología',
  robots: { index: false, follow: false },
};

export default function AdminCrmPage() {
  return <AdminCrmWorkspace initialTab="kanban" />;
}

