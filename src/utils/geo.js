// Utilidades de geolocalización y tiempo.
//
// PRIVACIDAD: nunca guardamos ni mostramos direcciones exactas. Toda
// ubicación que entra al sistema pasa por approx(), que redondea las
// coordenadas a ~100 m para proteger el domicilio de los dueños.

export function approx(lat, lng) {
  return {
    lat: Math.round(lat * 1000) / 1000,
    lng: Math.round(lng * 1000) / 1000,
  };
}

// Distancia en metros entre dos puntos {lat, lng} (fórmula de Haversine).
export function distanceM(a, b) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function formatDistance(m) {
  if (m < 950) return `${Math.max(50, Math.round(m / 50) * 50)} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

export function formatElapsed(ms) {
  const m = Math.floor(ms / 60000);
  if (m < 1) return 'menos de 1 min';
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h ${m % 60} min`;
  const d = Math.floor(h / 24);
  return `${d} d ${h % 24} h`;
}

export function formatClock(ts) {
  return new Date(ts).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(ts) {
  return new Date(ts).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
}

// El radio de alerta arranca chico (vecinos inmediatos) y se expande solo
// mientras la mascota siga perdida: 300 m + 40 m por minuto, tope 2,5 km.
export function alertRadius(elapsedMs) {
  const minutes = Math.max(0, elapsedMs) / 60000;
  return Math.min(2500, Math.round(300 + minutes * 40));
}

// Estimación simulada de vecinos que recibieron la alerta según el área
// cubierta (densidad ficticia de ~55 usuarios activos por km²).
export function neighborsAlerted(radiusM) {
  const km2 = Math.PI * (radiusM / 1000) ** 2;
  return Math.max(6, Math.round(km2 * 55));
}
