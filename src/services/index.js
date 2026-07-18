import { isFirebaseConfigured } from '../config/firebase';

// Devuelve la capa de datos activa. Ambas implementaciones exponen la misma
// interfaz, así que el resto de la app no sabe (ni le importa) cuál corre:
//
//   - firebaseStore: Firestore + Storage + Auth anónima (producción).
//   - localStore:    localStorage con datos demo (desarrollo / sin config).
//
// El import dinámico hace que el SDK de Firebase ni siquiera se descargue
// cuando la app corre en modo demo.
export async function createStore() {
  if (isFirebaseConfigured()) {
    const { createFirebaseStore } = await import('./firebaseStore.js');
    return createFirebaseStore();
  }
  const { createLocalStore } = await import('./localStore.js');
  return createLocalStore();
}
