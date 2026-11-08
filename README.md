# 🚀 Site On Tecnología — Plataforma Comercial, Web & CRM Enterprise

Plataforma digital corporativa de alta conversión, catálogo de servicios tecnológicos, blog SEO y sistema **CRM propio integrado** para **Site On Tecnología** (Viña del Mar, Región de Valparaíso, Chile — `https://www.siteon.cl`).

---

## 🏗️ Stack Tecnológico y Arquitectura

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend & Base de Datos:** Supabase (PostgreSQL, Row Level Security, Autenticación), Next.js Route Handlers.
- **Notificaciones & Automatización:** Resend API (correo transaccional) + Webhook de automatización (Make.com) con persistencia resiliente ante fallos.
- **Convivencia con Ecosistema Site On:**
  - Las subaplicaciones activas (`/calendario`, `/admin-calendario`, `/Gastos`, `/aniversario`) se sincronizan automáticamente mediante `scripts/sync-subapps.mjs` hacia `public/` en cada `npm run build` y mantienen sus reglas de *rewrite* y caché intactas.
  - El cron serverless `/api/cron-reminders` opera de forma nativa en `src/pages/api/cron-reminders.js`.

---

## ⚙️ Configuración de Variables de Entorno

Copia `.env.example` a `.env.local` (en desarrollo) o configúralas en **Vercel → Project Settings → Environment Variables**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://wlwadurbzzhlztxrvndp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_0m8kTrv2R9L1InKHTu05tA_7dyUnAzN
SUPABASE_SERVICE_ROLE_KEY=

SITEON_ADMIN_EMAIL=contacto@siteon.cl
SITEON_ADMIN_PASSWORD=SiteOn2026!Viña
SITEON_SESSION_SECRET=siteon_enterprise_hmac_secret_2026_vina_del_mar

RESEND_API_KEY=
SITEON_NOTIFY_EMAIL=contacto@siteon.cl
SITEON_MAKE_WEBHOOK_URL=https://hook.us2.make.com/8s77yqszg3dhcyr34iwu02xxwk3sxdtt
NEXT_PUBLIC_SITE_URL=https://www.siteon.cl
NEXT_PUBLIC_GA4_ID=
```

---

## 🗄️ Configuración de Base de Datos en Supabase

1. La plataforma cuenta con **persistencia Cloud inmediata** conectada a tu proyecto Supabase (`wlwadurbzzhlztxrvndp.supabase.co`).
2. Para crear las tablas relacionales dedicadas (`siteon_leads`, `siteon_lead_activities`, `siteon_services`, `siteon_posts`, `siteon_settings`, `siteon_analytics_events`, `siteon_audit_logs`) con sus políticas **Row Level Security (RLS)**:
   - Abre el **SQL Editor** en tu panel de Supabase.
   - Copia y ejecuta el contenido de [`supabase/migrations/20261107_siteon_crm_schema.sql`](./supabase/migrations/20261107_siteon_crm_schema.sql) (también accesible con un botón de copiado rápido desde `/admin` → pestaña **Configuración & WhatsApp**).

---

## ☁️ Despliegue en Vercel

El repositorio está vinculado al proyecto oficial de Vercel (`siteon.cl`).
Para compilar localmente y desplegar a producción:

```powershell
npm.cmd run build
git add .
git commit -m "feat: Rediseño integral Site On Tecnología + CRM integrado"
git push origin main
```
