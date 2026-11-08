import crypto from 'crypto';
import { cookies } from 'next/headers';
import { getServerSupabase } from '@/lib/supabase/crm-store';

const SESSION_COOKIE_NAME = 'siteon_admin_session';
const SECRET =
  process.env.SITEON_SESSION_SECRET ||
  'siteon_enterprise_hmac_secret_2026_vina_del_mar';

export interface AdminUserSession {
  email: string;
  name: string;
  role: 'admin';
  authMethod: 'supabase_auth' | 'server_master';
  exp: number;
}

function getAllowedAdminEmails(): Set<string> {
  const configured = (process.env.SITEON_ADMIN_EMAIL || 'contacto@siteon.cl')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return new Set([
    ...configured,
    'contacto@siteon.cl',
    'rodrigo@siteon.cl',
    'raparicio@siteon.cl',
  ]);
}

export function createSignedAdminToken(payload: Omit<AdminUserSession, 'exp'>): string {
  const session: AdminUserSession = {
    ...payload,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 días
  };
  const data = Buffer.from(JSON.stringify(session)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(data)
    .digest('base64url');
  return `${data}.${signature}`;
}

export function verifySignedAdminToken(token?: string | null): AdminUserSession | null {
  if (!token || !token.includes('.')) return null;
  const [data, signature] = token.split('.');
  if (!data || !signature) return null;

  const expectedSig = crypto
    .createHmac('sha256', SECRET)
    .update(data)
    .digest('base64url');

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(data, 'base64url').toString('utf-8')
    ) as AdminUserSession;
    if (!parsed.exp || parsed.exp < Date.now()) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function authenticateAdminCredentials(
  email: string,
  password: string
): Promise<{ ok: boolean; session?: AdminUserSession; token?: string; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const allowedEmails = getAllowedAdminEmails();

  if (!allowedEmails.has(cleanEmail)) {
    return {
      ok: false,
      error: 'Este correo no está autorizado como administrador de Site On Tecnología.',
    };
  }

  // 1. Intentar autenticación contra Supabase Auth primero
  try {
    const supabase = getServerSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (!error && data.user?.email) {
      const payload: Omit<AdminUserSession, 'exp'> = {
        email: data.user.email.toLowerCase(),
        name: 'Rodrigo Aparicio',
        role: 'admin',
        authMethod: 'supabase_auth',
      };
      const token = createSignedAdminToken(payload);
      return {
        ok: true,
        session: { ...payload, exp: Date.now() + 1000 * 60 * 60 * 24 * 7 },
        token,
      };
    }
  } catch {
    // Continúa a verificación de credencial maestra de servidor
  }

  // 2. Verificar contra credencial maestra configurada en variables de entorno de servidor
  const masterPassword = process.env.SITEON_ADMIN_PASSWORD || 'SiteOn2026!Viña';
  if (password === masterPassword) {
    const payload: Omit<AdminUserSession, 'exp'> = {
      email: cleanEmail,
      name: 'Rodrigo Aparicio',
      role: 'admin',
      authMethod: 'server_master',
    };
    const token = createSignedAdminToken(payload);
    return {
      ok: true,
      session: { ...payload, exp: Date.now() + 1000 * 60 * 60 * 24 * 7 },
      token,
    };
  }

  return {
    ok: false,
    error: 'Credenciales inválidas. Verifica tu correo y contraseña de administrador.',
  };
}

export async function getAdminSessionFromCookies(): Promise<AdminUserSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return verifySignedAdminToken(token);
}

export const ADMIN_COOKIE_NAME = SESSION_COOKIE_NAME;

