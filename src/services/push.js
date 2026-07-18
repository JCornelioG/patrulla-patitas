import { Capacitor } from '@capacitor/core';
import { approx } from '../utils/geo';

// Registro de notificaciones push. Solo aplica en la app nativa (iOS/Android)
// y con Firebase configurado; en web o modo demo no hace nada.
//
// iOS requiere además: GoogleService-Info.plist en ios/App/App/ y la
// capability de Push Notifications (ya configurada en App.entitlements).
export async function initPush(store, location) {
  if (!Capacitor.isNativePlatform() || store.mode !== 'firebase') return;
  try {
    const { FirebaseMessaging } = await import('@capacitor-firebase/messaging');
    const perm = await FirebaseMessaging.requestPermissions();
    if (perm.receive !== 'granted') return;
    const { token } = await FirebaseMessaging.getToken();
    // Privacidad: guardamos la zona aproximada (~100 m), nunca el punto exacto.
    const zone = approx(location.lat, location.lng);
    await store.saveDeviceToken(token, zone, Capacitor.getPlatform());
  } catch (err) {
    // La app funciona igual sin push; solo lo registramos para diagnóstico.
    console.warn('Push no disponible:', err);
  }
}
