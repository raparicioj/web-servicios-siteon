import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  authenticateAdminCredentials,
  getAdminSessionFromCookies,
} from '@/lib/auth/admin-session';
import { recordAuditLog } from '@/lib/supabase/crm-store';

export async function GET() {
  const session = await getAdminSessionFromCookies();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, session });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || '');
    const password = String(body.password || '');

    const result = await authenticateAdminCredentials(email, password);
    if (!result.ok || !result.token || !result.session) {
      return NextResponse.json(
        { error: result.error || 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    await recordAuditLog(result.session.email, 'admin_login', 'session', result.session.email, {
      authMethod: result.session.authMethod,
    });

    const response = NextResponse.json({
      ok: true,
      session: result.session,
    });

    response.cookies.set(ADMIN_COOKIE_NAME, result.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Error al procesar el inicio de sesión.' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const session = await getAdminSessionFromCookies();
  if (session) {
    await recordAuditLog(session.email, 'admin_logout', 'session', session.email);
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(ADMIN_COOKIE_NAME);
  return response;
}

