/**
 * Direct Green-API WhatsApp Relay Endpoint for SiteON / Mi Calendario
 * POST /api/send-whatsapp
 *
 * Replaces Make.com webhook intermediary to eliminate free-tier credit limits
 * and deliver WhatsApp messages directly via Green-API (<300ms latency).
 * Keeps GREEN_API_TOKEN strictly server-side in Vercel Environment Variables.
 */

const ALLOWED_ORIGIN_PATTERNS = [
  /^https?:\/\/(www\.)?siteon\.cl$/i,
  /^https?:\/\/[a-z0-9-]+\.vercel\.app$/i,
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i,
];

function isAllowedOrigin(origin) {
  if (!origin) return true; // Same-origin requests or server-to-server calls
  return ALLOWED_ORIGIN_PATTERNS.some((pattern) => pattern.test(origin.trim()));
}

function normalizeToChatId(body) {
  const explicitChatId = String(body.chatId || body.greenApiChatId || '').trim();
  if (explicitChatId && /^\d{8,18}@(c|g)\.us$/i.test(explicitChatId)) {
    return explicitChatId.toLowerCase();
  }

  const rawPhone = String(
    body.to ||
      body.phone ||
      body.number ||
      body.phoneNumber ||
      body.plainPhone ||
      body.recipientPhone ||
      body.targetPhone ||
      ''
  ).trim();

  let digits = rawPhone.replace(/\D/g, '');
  if (!digits) return '';

  if (digits.startsWith('0')) {
    digits = digits.substring(1);
  }

  // Chilean mobile heuristic: 9 digits starting with 9 -> prepend 56
  if (digits.length === 9 && digits.startsWith('9')) {
    digits = `56${digits}`;
  }

  if (digits.length < 10 || digits.length > 15) {
    return '';
  }

  return `${digits}@c.us`;
}

export default async function handler(req, res) {
  const origin = req.headers.origin || '';

  if (origin && isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  } else if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', 'https://www.siteon.cl');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  if (origin && !isAllowedOrigin(origin)) {
    return res.status(403).json({ success: false, error: 'Origin not allowed.' });
  }

  const greenApiUrl = (process.env.GREEN_API_URL || 'https://7107.api.greenapi.com').trim().replace(/\/+$/, '');
  const greenApiId = (process.env.GREEN_API_ID || '').trim();
  const greenApiToken = (process.env.GREEN_API_TOKEN || '').trim();

  if (!greenApiId || !greenApiToken) {
    return res.status(503).json({
      success: false,
      error: 'Green-API credentials are not configured on the server (GREEN_API_ID / GREEN_API_TOKEN).',
    });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const chatId = normalizeToChatId(body);
  const message = String(body.message || body.text || body.body || body.content || '').trim();

  if (!chatId) {
    return res.status(400).json({
      success: false,
      error: 'Número de destino o chatId inválido.',
    });
  }

  if (!message) {
    return res.status(400).json({
      success: false,
      error: 'El mensaje no puede estar vacío.',
    });
  }

  const safeMessage = message.slice(0, 4000);
  const endpoint = `${greenApiUrl}/waInstance${greenApiId}/sendMessage/${greenApiToken}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatId,
        message: safeMessage,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const rawText = await upstream.text();
    let parsed = null;
    try {
      parsed = rawText ? JSON.parse(rawText) : null;
    } catch {
      parsed = { raw: rawText.slice(0, 200) };
    }

    if (!upstream.ok) {
      return res.status(502).json({
        success: false,
        provider: 'green-api',
        upstreamStatus: upstream.status,
        error: parsed?.message || parsed?.error || `Green-API devolvió HTTP ${upstream.status}`,
      });
    }

    return res.status(200).json({
      success: true,
      ok: true,
      provider: 'green-api',
      chatId,
      idMessage: parsed?.idMessage || null,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    clearTimeout(timeout);
    const isTimeout = err?.name === 'AbortError';
    return res.status(isTimeout ? 504 : 502).json({
      success: false,
      provider: 'green-api',
      error: isTimeout ? 'Timeout al conectar con Green-API (10s)' : (err?.message || 'Error de red al conectar con Green-API'),
    });
  }
}
