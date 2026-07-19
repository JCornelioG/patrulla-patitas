import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from '../config/firebase';

// Instancia única de Firebase compartida por firebaseStore (datos) y
// account (vinculación de cuenta). Solo se importa dinámicamente para que
// el SDK de Firebase viva en su propio chunk lazy.

let app = null;

export function firebaseApp() {
  if (!app) app = initializeApp(firebaseConfig);
  return app;
}

export function firebaseAuth() {
  return getAuth(firebaseApp());
}
