import mqtt from 'mqtt';

const WEBHOOK_URL = 'https://hook.us2.make.com/8s77yqszg3dhcyr34iwu02xxwk3sxdtt';
const TOPIC = 'siteon/mi_calendario/carmen_rodrigo/v16_sync';
const BROKER = 'mqtt://broker.emqx.io:1883';
const BACKUP_BROKER = 'mqtt://broker.hivemq.com:1883';

const CARMEN_PHONE = '+56930970033';
const RODRIGO_PHONE = '+56942362353';

function getChileTime() {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-CA', { timeZone: 'America/Santiago' });
  const timeStr = now.toLocaleTimeString('en-GB', { timeZone: 'America/Santiago', hour12: false });
  const [hStr, mStr] = timeStr.split(':');
  const hour = parseInt(hStr, 10);
  const minute = parseInt(mStr, 10);
  return { dateStr, timeStr, hour, minute, totalMinutes: hour * 60 + minute };
}

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

async function dispatchWhatsAppToTargets(target, ownerId, message) {
  const dispatches = [];

  if (target === 'owner_only') {
    const isRodrigo = ownerId === 'user_rodrigo';
    const targetPhone = isRodrigo ? RODRIGO_PHONE : CARMEN_PHONE;
    const targetName = isRodrigo ? 'Rodrigo' : 'Carmen Gloria';
    const res = await sendWebhook(targetPhone, targetName, message);
    dispatches.push({ to: targetName, phone: targetPhone, result: res });
  } else {
    // Send to Rodrigo
    const resR = await sendWebhook(RODRIGO_PHONE, 'Rodrigo', message);
    dispatches.push({ to: 'Rodrigo', phone: RODRIGO_PHONE, result: resR });
    // Send to Carmen Gloria
    const resC = await sendWebhook(CARMEN_PHONE, 'Carmen Gloria', message);
    dispatches.push({ to: 'Carmen Gloria', phone: CARMEN_PHONE, result: resC });
  }

  return dispatches;
}

export default async function handler(req, res) {
  const chile = getChileTime();
  const startTime = Date.now();
  const logEntries = [];

  logEntries.push(`[${chile.timeStr}] Invocación de Cron de Recordatorios (Chile: ${chile.dateStr} ${chile.timeStr})`);

  let snapshot = null;
  let rawWrapper = null;
  let usedBroker = BROKER;

  // 1. Fetch current snapshot from MQTT
  const getSnapshot = (brokerUrl) => {
    return new Promise((resolve) => {
      let resolved = false;
      const client = mqtt.connect(brokerUrl, {
        clientId: 'cron_worker_' + Math.random().toString(16).substring(2, 8),
        clean: true,
        connectTimeout: 4000,
      });

      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          try { client.end(true); } catch (_) {}
          resolve(null);
        }
      }, 5000);

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
          } catch (e) {
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
  };

  const snapshotResult = await getSnapshot(BROKER) || await getSnapshot(BACKUP_BROKER);

  if (!snapshotResult || !snapshotResult.data) {
    return res.status(200).json({
      success: false,
      error: 'No se pudo obtener el estado desde el broker MQTT',
      chileTime: chile,
    });
  }

  rawWrapper = snapshotResult.data;
  snapshot = rawWrapper.payload || rawWrapper;
  usedBroker = snapshotResult.brokerUrl;

  const events = snapshot.events || [];
  let eventsModified = false;
  const dispatchedReminders = [];

  for (const event of events) {
    if (!event.hasDate || event.date !== chile.dateStr || event.completed) {
      continue;
    }

    const isPrivate = event.visibility === 'private' || event.visibility === 'personal';
    const target = isPrivate ? 'owner_only' : 'both';
    const ownerId = event.createdBy;
    const alreadySent = event.remindersSent || [];

    // 1. Matutino de las 09:00 AM (disparado entre 09:00 y 09:59 si aún no se envió)
    const key9am = `remind_9am_${event.id}_${chile.dateStr}`;
    const is9amSent = alreadySent.includes(key9am);

    if (chile.hour === 9 && !is9amSent) {
      const typeLabel = event.type === 'task' ? 'Tarea de hoy' : event.type === 'reminder' ? 'Recordatorio de hoy' : 'Actividad de hoy';
      const timeTxt = event.time ? `⏰ *Hora:* ${event.time}${event.endTime ? ` - ${event.endTime}` : ''} hrs\n` : '⏰ *Horario:* Todo el día\n';
      const locTxt = event.location ? `📍 *Lugar:* ${event.location}\n` : '';
      const notesTxt = event.notes ? `💡 *Nota:* ${event.notes}\n` : (event.description ? `📝 *Detalle:* ${event.description}\n` : '');

      const waMsg = `🌅 *${typeLabel} (09:00 hrs)* 🗓️\n` +
        `📌 *${event.title}*${isPrivate ? ' 🔒 (Privado)' : ''}\n` +
        timeTxt +
        locTxt +
        notesTxt +
        (isPrivate ? `\n_Aviso personal privado para ti_ ✨` : `\n_¡Que tengan un maravilloso día!_ ✨💕`);

      const dispatches = await dispatchWhatsAppToTargets(target, ownerId, waMsg);
      event.remindersSent = [...alreadySent, key9am];
      eventsModified = true;
      dispatchedReminders.push({ type: '09:00_morning', eventId: event.id, title: event.title, dispatches });
      logEntries.push(`[09:00 AM] Enviado recordatorio matutino para: "${event.title}"`);
    }

    // Recordatorios 30 min y 10 min antes
    if (event.time && event.time.includes(':')) {
      const [hStr, mStr] = event.time.split(':');
      const eh = parseInt(hStr, 10);
      const em = parseInt(mStr, 10);

      if (!isNaN(eh) && !isNaN(em)) {
        const eventTotalMinutes = eh * 60 + em;
        const diffMinutes = eventTotalMinutes - chile.totalMinutes;

        // 2. Media hora antes (30 min)
        const key30m = `remind_30m_${event.id}_${chile.dateStr}_${event.time}`;
        const is30mSent = (event.remindersSent || []).includes(key30m);

        if (diffMinutes <= 30 && diffMinutes > 10 && !is30mSent) {
          const locTxt = event.location ? `📍 *Lugar:* ${event.location}\n` : '';
          const notesTxt = event.notes ? `💡 *Nota:* ${event.notes}\n` : '';
          const waMsg = `⏳ *Recordatorio: En 30 minutos* ⏰\n` +
            `📌 *${event.title}*${isPrivate ? ' 🔒 (Privado)' : ''}\n` +
            `⏰ *Hora programada:* ${event.time} hrs\n` +
            locTxt +
            notesTxt +
            (isPrivate ? `\n_Aviso personal privado para ti_ ✨` : `\n_¡Comienza en media hora!_ 💕✨`);

          const dispatches = await dispatchWhatsAppToTargets(target, ownerId, waMsg);
          event.remindersSent = [...(event.remindersSent || []), key30m];
          eventsModified = true;
          dispatchedReminders.push({ type: '30m_before', eventId: event.id, title: event.title, dispatches });
          logEntries.push(`[30 MIN] Enviado recordatorio de 30 min para: "${event.title}" (${event.time} hrs)`);
        }

        // 3. 10 minutos antes (urgente)
        const key10m = `remind_10m_${event.id}_${chile.dateStr}_${event.time}`;
        const is10mSent = (event.remindersSent || []).includes(key10m);

        if (diffMinutes <= 10 && diffMinutes >= -2 && !is10mSent) {
          const locTxt = event.location ? `📍 *Lugar:* ${event.location}\n` : '';
          const notesTxt = event.notes ? `💡 *Nota:* ${event.notes}\n` : '';
          const waMsg = `🚨 *¡Aviso urgente! En 10 minutos* ⏰\n` +
            `📌 *${event.title}*${isPrivate ? ' 🔒 (Privado)' : ''}\n` +
            `⏰ *Hora:* ${event.time} hrs\n` +
            locTxt +
            notesTxt +
            (isPrivate ? `\n_Aviso personal privado para ti_ ✨` : `\n_¡Prepárate! Comienza muy pronto_ 🏃‍♂️💨💕`);

          const dispatches = await dispatchWhatsAppToTargets(target, ownerId, waMsg);
          event.remindersSent = [...(event.remindersSent || []), key10m];
          eventsModified = true;
          dispatchedReminders.push({ type: '10m_before', eventId: event.id, title: event.title, dispatches });
          logEntries.push(`[10 MIN] Enviado recordatorio de 10 min para: "${event.title}" (${event.time} hrs)`);
        }
      }
    }
  }

  // 2. If events were modified, publish updated snapshot back to MQTT
  if (eventsModified) {
    snapshot.events = events;
    snapshot.timestamp = Date.now();

    const updatedPayload = rawWrapper.payload ? { ...rawWrapper, payload: snapshot } : snapshot;
    const str = JSON.stringify(updatedPayload);

    await new Promise((resolve) => {
      const pubClient = mqtt.connect(usedBroker, {
        clientId: 'cron_publisher_' + Math.random().toString(16).substring(2, 8),
        clean: true,
      });
      pubClient.on('connect', () => {
        pubClient.publish(TOPIC, str, { retain: true, qos: 1 }, () => {
          pubClient.end(true);
          resolve(true);
        });
      });
      setTimeout(() => {
        try { pubClient.end(true); } catch (_) {}
        resolve(false);
      }, 3000);
    });
  }

  const durationMs = Date.now() - startTime;
  return res.status(200).json({
    success: true,
    chileTime: chile,
    dispatchedCount: dispatchedReminders.length,
    dispatched: dispatchedReminders,
    eventsModified,
    durationMs,
    logs: logEntries,
  });
}
