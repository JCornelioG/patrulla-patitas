import { demoPets } from '../data/demoData';

// Modo demo: los datos viven en localStorage del dispositivo. Mismo contrato
// que firebaseStore, pero sin red — sirve para desarrollo y para probar la
// app antes de configurar Firebase.

const KEY = 'pp-data-v1';
const LOCAL_UID = 'local-user';

export function createLocalStore() {
  const subs = new Set();
  let pets = load();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      /* datos corruptos → re-sembrar */
    }
    return demoPets(LOCAL_UID);
  }

  function persist() {
    try {
      localStorage.setItem(KEY, JSON.stringify(pets));
    } catch (err) {
      console.warn('No se pudo persistir localmente:', err);
    }
    emit();
  }

  function emit() {
    const copy = pets.map((p) => ({ ...p }));
    subs.forEach((cb) => cb(copy));
  }

  function update(id, patch) {
    pets = pets.map((p) => (p.id === id ? { ...p, ...patch } : p));
    persist();
  }

  return {
    mode: 'local',
    uid: LOCAL_UID,

    async init() {},

    subscribePets(cb) {
      subs.add(cb);
      cb(pets.map((p) => ({ ...p })));
      return () => subs.delete(cb);
    },

    async addPet(data) {
      pets = [
        ...pets,
        {
          id: `pet-${Date.now()}`,
          ownerId: LOCAL_UID,
          status: 'home',
          lostAt: null,
          foundAt: null,
          lastKnown: null,
          sightings: [],
          createdAt: Date.now(),
          ...data,
        },
      ];
      persist();
    },

    async markLost(id, zone) {
      update(id, { status: 'lost', lostAt: Date.now(), foundAt: null, lastKnown: zone, sightings: [] });
    },

    async markFound(id) {
      update(id, { status: 'found', foundAt: Date.now() });
    },

    async closeCase(id) {
      // Producción (Firebase): el caso quedaría archivado como historial.
      update(id, { status: 'home', lostAt: null, foundAt: null, lastKnown: null, sightings: [] });
    },

    async addSighting(id, sighting) {
      const pet = pets.find((p) => p.id === id);
      if (!pet) return;
      update(id, {
        sightings: [...pet.sightings, { id: `s-${Date.now()}`, at: Date.now(), ...sighting }],
      });
    },

    // En modo demo la "URL" de la foto es el propio data URL comprimido.
    async uploadPhoto(dataUrl) {
      return dataUrl;
    },

    async saveDeviceToken() {},
  };
}
