import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  query,
  where,
  onSnapshot,
  setDoc,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { firebaseConfig } from '../config/firebase';

// Capa de datos de producción: Firestore (datos en tiempo real), Storage
// (fotos) y Auth anónima (identidad sin registro — no pedimos cuentas).
// La seguridad la imponen firestore.rules / storage.rules (raíz del repo).

export function createFirebaseStore() {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);
  let uid = null;

  return {
    mode: 'firebase',
    get uid() {
      return uid;
    },

    async init() {
      const cred = await signInAnonymously(auth);
      uid = cred.user.uid;
    },

    // Emite la unión en vivo de dos consultas: todas las alertas activas
    // (públicas) + todas mis mascotas. Cada snapshot reconstruye su mapa
    // completo, así las bajas (p. ej. un caso cerrado) desaparecen solas.
    subscribePets(cb) {
      const maps = { lost: new Map(), mine: new Map() };
      const emit = () => {
        const merged = new Map();
        for (const m of Object.values(maps)) {
          for (const [id, pet] of m) merged.set(id, pet);
        }
        cb([...merged.values()]);
      };
      const listen = (q, key) =>
        onSnapshot(
          q,
          (snap) => {
            maps[key] = new Map(snap.docs.map((d) => [d.id, { id: d.id, ...d.data() }]));
            emit();
          },
          (err) => console.error(`Error en consulta ${key}:`, err),
        );
      const unsubLost = listen(query(collection(db, 'pets'), where('status', '==', 'lost')), 'lost');
      const unsubMine = listen(query(collection(db, 'pets'), where('ownerId', '==', uid)), 'mine');
      return () => {
        unsubLost();
        unsubMine();
      };
    },

    async addPet(data) {
      const petRef = doc(collection(db, 'pets'));
      await setDoc(petRef, {
        ownerId: uid,
        status: 'home',
        lostAt: null,
        foundAt: null,
        lastKnown: null,
        sightings: [],
        createdAt: Date.now(),
        ...data,
      });
    },

    async markLost(id, zone) {
      await updateDoc(doc(db, 'pets', id), {
        status: 'lost',
        lostAt: Date.now(),
        foundAt: null,
        lastKnown: zone,
        sightings: [],
      });
    },

    async markFound(id) {
      await updateDoc(doc(db, 'pets', id), { status: 'found', foundAt: Date.now() });
    },

    async closeCase(id) {
      // FUTURO: archivar el episodio en una subcolección "historial" antes de
      // limpiar, para reputación/insignias de quienes ayudaron.
      await updateDoc(doc(db, 'pets', id), {
        status: 'home',
        lostAt: null,
        foundAt: null,
        lastKnown: null,
        sightings: [],
      });
    },

    async addSighting(id, sighting) {
      // Las reglas de Firestore solo permiten a terceros AGREGAR un
      // avistamiento (nunca tocar otros campos ni borrar).
      await updateDoc(doc(db, 'pets', id), {
        sightings: arrayUnion({ id: `s-${Date.now()}-${uid.slice(0, 6)}`, at: Date.now(), ...sighting }),
      });
    },

    async uploadPhoto(dataUrl) {
      const photoRef = ref(storage, `pets/${uid}/${Date.now()}.jpg`);
      await uploadString(photoRef, dataUrl, 'data_url');
      return getDownloadURL(photoRef);
    },

    // El token del dispositivo + su zona aproximada permiten a la Cloud
    // Function decidir a quién notificar cuando hay una alerta cerca.
    async saveDeviceToken(token, location, platform) {
      await setDoc(doc(db, 'devices', token), {
        uid,
        lat: location.lat,
        lng: location.lng,
        platform,
        updatedAt: Date.now(),
      });
    },
  };
}
