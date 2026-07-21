// Herramienta de mantenimiento: lista todas las mascotas en Firestore de
// producción (lectura pública vía auth anónima). Sirve para identificar
// datos de prueba que deban limpiarse.
//   node scripts/list-pets.mjs
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { firebaseConfig } from '../src/config/firebase.js';

const app = initializeApp(firebaseConfig);
await signInAnonymously(getAuth(app));
const db = getFirestore(app);
const snap = await getDocs(collection(db, 'pets'));

console.log(`Total: ${snap.size} mascota(s)\n`);
snap.forEach((d) => {
  const p = d.data();
  console.log(
    `${d.id}\t| ${p.name ?? '(sin nombre)'}\t| ${p.status}\t| owner=${p.ownerId?.slice(0, 8)}\t| created=${p.createdAt ? new Date(p.createdAt).toISOString().slice(0, 10) : '?'}`,
  );
});
process.exit(0);
