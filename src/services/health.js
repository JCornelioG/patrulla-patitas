// Cartilla sanitaria y recordatorios (Patitas Plus).
//
// v1: los datos viven en el dispositivo (localStorage), en ambos modos
// (demo y Firebase): la cartilla es información sensible y NO se publica.
// FUTURO (Plus "respaldo en la nube"): sincronizar en una subcolección
// privada pets/{id}/private/cartilla con reglas de solo-dueño.

const KEY = 'pp-health-v1';

const EMPTY = { records: [], weights: [], reminders: [] };

function loadAll() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? {};
  } catch {
    return {};
  }
}

function saveAll(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('No se pudo guardar la cartilla:', err);
  }
}

export function getHealth(petId) {
  const h = loadAll()[petId];
  return { ...EMPTY, ...(h ?? {}) };
}

export function saveHealth(petId, health) {
  const all = loadAll();
  all[petId] = health;
  saveAll(all);
}

export const RECORD_TYPES = ['Vacuna', 'Antiparasitario', 'Consulta', 'Medicación', 'Otro'];

export const REPEAT_OPTIONS = [
  { id: 'none', label: 'Una sola vez' },
  { id: 'week', label: 'Cada semana' },
  { id: 'month', label: 'Cada mes' },
  { id: 'year', label: 'Cada año' },
];
