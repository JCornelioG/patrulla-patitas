// ─── Configuración de Firebase ──────────────────────────────────────────────
// PASO OBLIGATORIO ANTES DE PUBLICAR (ver APPSTORE.md, sección 1):
//
//   1. Crea un proyecto en https://console.firebase.google.com
//   2. Agrega una "app web" al proyecto y copia el objeto firebaseConfig
//      que te muestra la consola.
//   3. Pega los valores reales aquí abajo.
//   4. Habilita: Authentication → Anonymous, Firestore, Storage y Cloud Messaging.
//
// Mientras los valores empiecen con "PEGA_", la app corre en MODO DEMO
// (datos locales en el dispositivo, sin alertas comunitarias reales).
//
// Nota: estas claves son "client keys" pensadas para vivir en el código del
// cliente; la seguridad real la dan las reglas de Firestore/Storage.

export const firebaseConfig = {
  apiKey: 'AIzaSyCfDlJlS907aD4PQOLB07MiMEfv11tJ19s',
  authDomain: 'patrulla-patitas.firebaseapp.com',
  projectId: 'patrulla-patitas',
  storageBucket: 'patrulla-patitas.firebasestorage.app',
  messagingSenderId: '987047171459',
  appId: '1:987047171459:web:e53a85ddf27b8824d792b6',
};

export function isFirebaseConfigured() {
  return !Object.values(firebaseConfig).some((v) => String(v).startsWith('PEGA_'));
}
