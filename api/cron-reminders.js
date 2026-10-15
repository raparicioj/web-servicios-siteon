import mqtt from 'mqtt';

const SUPABASE_URL = 'https://wlwadurbzzhlztxrvndp.supabase.co';
const SUPABASE_KEY = 'sb_publishable_0m8kTrv2R9L1InKHTu05tA_7dyUnAzN';
const WEBHOOK_URL = 'https://hook.us2.make.com/8s77yqszg3dhcyr34iwu02xxwk3sxdtt';
const TOPIC = 'siteon/mi_calendario/carmen_rodrigo/v16_sync';
const BROKER = 'mqtt://broker.emqx.io:1883';
const BACKUP_BROKER = 'mqtt://broker.hivemq.com:1883';

const CARMEN_PHONE = '+56930970033';
const RODRIGO_PHONE = '+56942362353';

/**
 * Obtiene la hora oficial en Chile (Santiago - UTC-3/UTC-4 con cambio de horario automático)
 */
function getChileTime() {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-CA', { timeZone: 'America/Santiago' });
  const timeStr = now.toLocaleTimeString('en-GB', { timeZone: 'America/Santiago', hour12: false });
  const [hStr, mStr, sStr] = timeStr.split(':');
  const hour = parseInt(hStr, 10);
  const minute = parseInt(mStr, 10);
  const second = parseInt(sStr || '0', 10);
  return { dateStr, timeStr, hour, minute, second, totalMinutes: hour * 60 + minute };
}

/**
 * Envío individual por webhook a Make.com (canal WhatsApp)
 */
async function sendWebhook(to, recipientName, message) {
  const cleanPhone = to.replace(/\D/g, '');
  const e164 = cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`;
  const plain = cleanPhone.replace(/^\+/, '');

  const payload = {
    channel: 'whatsapp',
    to: e164,
    phone: e164,
    number: e164,
    phoneNumber: e164,
    plainPhone: plain,
    recipientName,
    senderName: 'Mi Calendario Cloud ☁️',
    message,
    text: message,
    timestamp: new Date().toISOString(),
  };

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return { ok: res.ok, status: res.status };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Despacha el mensaje de WhatsApp a los destinatarios correspondientes
 */
async function dispatchWhatsAppToTargets(target, ownerId, message) {
  const dispatches = [];

  if (target === 'owner_only') {
    const isRodrigo = ownerId === 'user_rodrigo';
    const targetPhone = isRodrigo ? RODRIGO_PHONE : CARMEN_PHONE;
    const targetName = isRodrigo ? 'Rodrigo' : 'Carmen Gloria';
    const res = await sendWebhook(targetPhone, targetName, message);
    dispatches.push({ to: targetName, phone: targetPhone, result: res });
  } else {
    // Para ambos: Rodrigo y Carmen Gloria
    const resR = await sendWebhook(RODRIGO_PHONE, 'Rodrigo', message);
    dispatches.push({ to: 'Rodrigo', phone: RODRIGO_PHONE, result: resR });
    const resC = await sendWebhook(CARMEN_PHONE, 'Carmen Gloria', message);
    dispatches.push({ to: 'Carmen Gloria', phone: CARMEN_PHONE, result: resC });
  }

  return dispatches;
}

/**
 * Consulta eventos activos para hoy directamente desde Supabase (alta disponibilidad y persistencia)
 */
async function fetchSupabaseEvents(dateStr) {
  try {
    const url = `${SUPABASE_URL}/rest/v1/events?date=eq.${dateStr}&completed=eq.false`;
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data : null;
  } catch (err) {
    console.warn('[Cron] Error al consultar Supabase events:', err.message);
    return null;
  }
}

/**
 * Consulta el historial de recordatorios ya despachados desde Supabase activity_logs
 */
async function fetchSentReminderKeys() {
  try {
    const url = `${SUPABASE_URL}/rest/v1/activity_logs?action=eq.reminder_dispatched&select=entity_id,id`;
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });
    if (!res.ok) return new Set();
    const data = await res.json();
    const set = new Set();
    if (Array.isArray(data)) {
      data.forEach((item) => {
        if (item.entity_id) set.add(item.entity_id);
        if (item.id) {
          set.add(item.id);
          if (item.id.startsWith('log_')) {
            set.add(item.id.replace(/^log_/, ''));
          }
        }
      });
    }
    return set;
  } catch (err) {
    console.warn('[Cron] Error al consultar activity_logs en Supabase:', err.message);
    return new Set();
  }
}

/**
 * Registra un recordatorio como despachado en Supabase activity_logs para persistencia indestructible
 */
async function recordReminderSentInSupabase(reminderKey, eventTitle, reminderType) {
  try {
    const logRow = {
      id: `log_${reminderKey}`,
      couple_id: 'c_carmen_rodrigo',
      user_id: 'system_cloud',
      user_name: 'Mi Calendario Cloud ☁️',
      action: 'reminder_dispatched',
      entity_id: reminderKey,
      entity_title: eventTitle || 'Recordatorio',
      description: reminderType || 'Recordatorio automático',
      timestamp: new Date().toISOString(),
    };

    await fetch(`${SUPABASE_URL}/rest/v1/activity_logs`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify(logRow),
    });
  } catch (err) {
    console.warn('[Cron] Error guardando log en Supabase:', err.message);
  }
}

/**
 * Consulta de respaldo vía MQTT
 */
function fetchMqttSnapshot(brokerUrl) {
  return new Promise((resolve) => {
    let resolved = false;
    const client = mqtt.connect(brokerUrl, {
      clientId: 'cron_reader_' + Math.random().toString(16).substring(2, 8),
      clean: true,
      connectTimeout: 3500,
    });

    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        try { client.end(true); } catch (_) {}
        resolve(null);
      }
    }, 4000);

    client.on('connect', () => {
      client.subscribe(TOPIC, { qos: 1 });
    });

    client.on('message', (topic, message) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        try {
          const data = JSON.parse(message.toString());
          try { client.end(true); } catch (_) {}
          resolve({ data, brokerUrl });
        } catch (_) {
          try { client.end(true); } catch (_) {}
          resolve(null);
        }
      }
    });

    client.on('error', () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        try { client.end(true); } catch (_) {}
        resolve(null);
      }
    });
  });
}

export default async function handler(req, res) {
  const chile = getChileTime();
  const startTime = Date.now();
  const logEntries = [];

  logEntries.push(`[${chile.timeStr}] Invocación del Motor de Recordatorios Cloud (Chile: ${chile.dateStr} ${chile.timeStr})`);

  // 1. Obtener eventos de hoy: Primero Supabase (autoritativo), con respaldo MQTT
  let todayEvents = [];
  let source = 'none';

  const supabaseEvents = await fetchSupabaseEvents(chile.dateStr);
  if (supabaseEvents && supabaseEvents.length > 0) {
    todayEvents = supabaseEvents;
    source = 'supabase';
    logEntries.push(`[Supabase] Cargados ${todayEvents.length} eventos para hoy.`);
  }

  // Respaldo MQTT para complementar eventos locales recién creados si los hubiera
  const mqttResult = await fetchMqttSnapshot(BROKER) || await fetchMqttSnapshot(BACKUP_BROKER);
  if (mqttResult && mqttResult.data) {
    const rawWrapper = mqttResult.data;
    const snapshot = rawWrapper.payload || rawWrapper;
    const mqttEvents = snapshot.events || [];
    const mqttToday = mqttEvents.filter(
      (e) => e.hasDate && e.date === chile.dateStr && !e.completed
    );

    if (source === 'none') {
      todayEvents = mqttToday;
      source = 'mqtt';
      logEntries.push(`[MQTT] Cargados ${todayEvents.length} eventos para hoy desde ${mqttResult.brokerUrl}.`);
    } else {
      // Fusionar si hay algún evento en MQTT que no esté en Supabase
      const existingIds = new Set(todayEvents.map((e) => e.id));
      for (const me of mqttToday) {
        if (!existingIds.has(me.id)) {
          todayEvents.push(me);
          existingIds.add(me.id);
          logEntries.push(`[Merge] Incorporado evento de MQTT no presente en Supabase: "${me.title}"`);
        }
      }
    }
  }

  if (todayEvents.length === 0) {
    return res.status(200).json({
      success: true,
      chileTime: chile,
      message: 'No hay actividades ni tareas pendientes para hoy en Chile.',
      dispatchedCount: 0,
      dispatched: [],
      logs: logEntries,
      durationMs: Date.now() - startTime,
    });
  }

  // 2. Obtener lista de recordatorios ya enviados para evitar duplicados
  const alreadySentSet = await fetchSentReminderKeys();

  const dispatchedReminders = [];

  for (const event of todayEvents) {
    const isPrivate = event.visibility === 'private' || event.visibility === 'personal';
    const target = isPrivate ? 'owner_only' : 'both';
    const ownerId = event.created_by || event.createdBy;
    const eventTime = event.time;

    // -------------------------------------------------------------
    // 1. REGLA: Notificación Matutina de las 09:00 AM
    // -------------------------------------------------------------
    // Ventana estricta: entre las 09:00 y las 09:08 AM en punto.
    // Nunca se enviará tarde (ej. 09:32) si se abre la app después.
    const key9am = `remind_9am_${event.id}_${chile.dateStr}`;
    const is9amSent = alreadySentSet.has(key9am);

    if (chile.hour === 9 && chile.minute <= 8 && !is9amSent) {
      const typeLabel = event.type === 'task' ? 'Tarea de hoy' : event.type === 'reminder' ? 'Recordatorio de hoy' : 'Actividad de hoy';
      const timeTxt = eventTime ? `⏰ *Hora:* ${eventTime}${event.end_time || event.endTime ? ` - ${event.end_time || event.endTime}` : ''} hrs\n` : '⏰ *Horario:* Todo el día\n';
      const locTxt = event.location ? `📍 *Lugar:* ${event.location}\n` : '';
      const notesTxt = event.notes ? `💡 *Nota:* ${event.notes}\n` : (event.description ? `📝 *Detalle:* ${event.description}\n` : '');

      const waMsg = `🌅 *${typeLabel} (09:00 hrs)* 🗓️\n` +
        `📌 *${event.title}*${isPrivate ? ' 🔒 (Privado)' : ''}\n` +
        timeTxt +
        locTxt +
        notesTxt +
        (isPrivate ? `\n_Aviso personal privado para ti_ ✨` : `\n_¡Que tengan un maravilloso día!_ ✨💕`);

      const dispatches = await dispatchWhatsAppToTargets(target, ownerId, waMsg);
      await recordReminderSentInSupabase(key9am, event.title, 'Matutino 09:00 AM');
      alreadySentSet.add(key9am);

      dispatchedReminders.push({ type: '09:00_morning', eventId: event.id, title: event.title, dispatches });
      logEntries.push(`[09:00 AM] Enviado recordatorio matutino para: "${event.title}"`);
    }

    // -------------------------------------------------------------
    // 2 y 3. REGLAS: 30 minutos antes y 10 minutos antes del evento
    // -------------------------------------------------------------
    if (eventTime && eventTime.includes(':')) {
      const [hStr, mStr] = eventTime.split(':');
      const eh = parseInt(hStr, 10);
      const em = parseInt(mStr, 10);

      if (!isNaN(eh) && !isNaN(em)) {
        const eventTotalMinutes = eh * 60 + em;
        const diffMinutes = eventTotalMinutes - chile.totalMinutes;

        // 2. Media hora antes (ventana de evaluación: entre 16 y 32 minutos antes)
        const key30m = `remind_30m_${event.id}_${chile.dateStr}_${eventTime}`;
        const is30mSent = alreadySentSet.has(key30m);

        if (diffMinutes <= 32 && diffMinutes >= 16 && !is30mSent) {
          const locTxt = event.location ? `📍 *Lugar:* ${event.location}\n` : '';
          const notesTxt = event.notes ? `💡 *Nota:* ${event.notes}\n` : (event.description ? `📝 *Detalle:* ${event.description}\n` : '');
          const waMsg = `⏳ *Recordatorio: En 30 minutos* ⏰\n` +
            `📌 *${event.title}*${isPrivate ? ' 🔒 (Privado)' : ''}\n` +
            `⏰ *Hora programada:* ${eventTime} hrs\n` +
            locTxt +
            notesTxt +
            (isPrivate ? `\n_Aviso personal privado para ti_ ✨` : `\n_¡Comienza en media hora!_ 💕✨`);

          const dispatches = await dispatchWhatsAppToTargets(target, ownerId, waMsg);
          await recordReminderSentInSupabase(key30m, event.title, 'Recordatorio 30 min antes');
          alreadySentSet.add(key30m);

          dispatchedReminders.push({ type: '30m_before', eventId: event.id, title: event.title, dispatches });
          logEntries.push(`[30 MIN] Enviado recordatorio de 30 min para: "${event.title}" (${eventTime} hrs)`);
        }

        // 3. 10 minutos antes (ventana de evaluación: entre -2 y 12 minutos antes)
        const key10m = `remind_10m_${event.id}_${chile.dateStr}_${eventTime}`;
        const is10mSent = alreadySentSet.has(key10m);

        if (diffMinutes <= 12 && diffMinutes >= -2 && !is10mSent) {
          const locTxt = event.location ? `📍 *Lugar:* ${event.location}\n` : '';
          const notesTxt = event.notes ? `💡 *Nota:* ${event.notes}\n` : (event.description ? `📝 *Detalle:* ${event.description}\n` : '');
          const waMsg = `🚨 *¡Aviso urgente! En 10 minutos* ⏰\n` +
            `📌 *${event.title}*${isPrivate ? ' 🔒 (Privado)' : ''}\n` +
            `⏰ *Hora:* ${eventTime} hrs\n` +
            locTxt +
            notesTxt +
            (isPrivate ? `\n_Aviso personal privado para ti_ ✨` : `\n_¡Prepárate! Comienza muy pronto_ 🏃‍♂️💨💕`);

          const dispatches = await dispatchWhatsAppToTargets(target, ownerId, waMsg);
          await recordReminderSentInSupabase(key10m, event.title, 'Recordatorio 10 min antes');
          alreadySentSet.add(key10m);

          dispatchedReminders.push({ type: '10m_before', eventId: event.id, title: event.title, dispatches });
          logEntries.push(`[10 MIN] Enviado recordatorio de 10 min para: "${event.title}" (${eventTime} hrs)`);
        }
      }
    }
  }

  const durationMs = Date.now() - startTime;
  return res.status(200).json({
    success: true,
    chileTime: chile,
    source,
    eventsCount: todayEvents.length,
    dispatchedCount: dispatchedReminders.length,
    dispatched: dispatchedReminders,
    durationMs,
    logs: logEntries,
  });
}
