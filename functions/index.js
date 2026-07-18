// ─── Cloud Functions de Patrulla Patitas ────────────────────────────────────
// Envío de notificaciones push. Desplegar con:
//
//   cd functions && npm install && cd ..
//   firebase deploy --only functions
//
// (Requiere el plan Blaze de Firebase — pago por uso, con capa gratuita
//  amplia; a volumen bajo el costo real es ~0.)

const { onDocumentWritten } = require('firebase-functions/v2/firestore');
const { logger } = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Debe coincidir con MAX_ALERT_RADIUS_M en src/config/constants.js.
const MAX_ALERT_RADIUS_M = 2500;

function distanceM(a, b) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

async function sendToTokens(tokens, notification) {
  if (tokens.length === 0) return;
  const messaging = admin.messaging();
  // FCM acepta hasta 500 tokens por lote.
  for (let i = 0; i < tokens.length; i += 500) {
    const batch = tokens.slice(i, i + 500);
    const res = await messaging.sendEachForMulticast({
      tokens: batch,
      notification,
      apns: { payload: { aps: { sound: 'default' } } },
    });
    // Limpieza: tokens vencidos se eliminan para no ensuciar la colección.
    await Promise.all(
      res.responses.map((r, idx) => {
        if (r.error?.code === 'messaging/registration-token-not-registered') {
          return admin.firestore().doc(`devices/${batch[idx]}`).delete();
        }
        return null;
      }),
    );
  }
}

// Un solo trigger sobre pets/{petId} cubre los dos eventos que nos importan:
//  1. La mascota pasa a "lost"  → alertar a los vecinos dentro del radio.
//  2. Se agrega un avistamiento → avisar al dueño.
exports.notificarCambios = onDocumentWritten('pets/{petId}', async (event) => {
  const before = event.data.before.exists ? event.data.before.data() : null;
  const after = event.data.after.exists ? event.data.after.data() : null;
  if (!after) return;

  const db = admin.firestore();

  // ── Caso 1: nueva alerta de mascota perdida ──
  if (after.status === 'lost' && before?.status !== 'lost' && after.lastKnown) {
    const devices = await db.collection('devices').get();
    const tokens = [];
    devices.forEach((doc) => {
      const d = doc.data();
      // No alertamos al propio dueño y filtramos por distancia a la zona.
      if (d.uid === after.ownerId) return;
      if (typeof d.lat !== 'number' || typeof d.lng !== 'number') return;
      if (distanceM({ lat: d.lat, lng: d.lng }, after.lastKnown) <= MAX_ALERT_RADIUS_M) {
        tokens.push(doc.id);
      }
    });
    logger.info(`Alerta de ${after.name}: notificando a ${tokens.length} dispositivos`);
    await sendToTokens(tokens, {
      title: `🚨 Mascota perdida cerca de ti`,
      body: `${after.name} (${after.species ?? 'mascota'}) se perdió en tu zona. ¡Tu ayuda puede encontrarl${after.pronoun ?? 'o'}!`,
    });
    // FUTURO: reenviar el aviso a veterinarias asociadas de la zona.
  }

  // ── Caso 2: avistamiento nuevo → avisar al dueño ──
  const beforeCount = before?.sightings?.length ?? 0;
  const afterCount = after.sightings?.length ?? 0;
  if (after.status === 'lost' && afterCount > beforeCount) {
    const last = after.sightings[afterCount - 1];
    const ownerDevices = await db.collection('devices').where('uid', '==', after.ownerId).get();
    const tokens = ownerDevices.docs.map((d) => d.id);
    logger.info(`Avistamiento de ${after.name}: avisando al dueño (${tokens.length} dispositivos)`);
    await sendToTokens(tokens, {
      title: `👀 ¡Vieron a ${after.name}!`,
      body: last?.note ? `"${last.note}" — mira el rastro en el mapa.` : 'Hay un avistamiento nuevo en el mapa.',
    });
  }

  // FUTURO: cuando status pasa a "found", otorgar insignias de reputación
  // a los vecinos que reportaron avistamientos en este episodio.
});
