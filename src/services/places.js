// Lugares de servicio para mascotas (veterinarias, albergues, guarderías,
// pet shops, peluquerías) desde OpenStreetMap vía la Overpass API.
//
// Por qué OSM: es gratis, sin API key, y coherente con los tiles de OSM que
// el mapa ya usa. Los datos ya están etiquetados por la comunidad global.
// Limitación conocida: la cobertura en Lima es buena para veterinarias pero
// irregular para peluquerías/farmacias → la capa comunitaria (que los
// usuarios agreguen lugares) es el siguiente paso natural.
//
// FUTURO (monetización B2B): tier "asociado" con insignia verificada y que
// los negocios reciban las alertas de mascotas perdidas de su zona.

const OVERPASS = 'https://overpass-api.de/api/interpreter';

export const PLACE_CATEGORIES = {
  vet: { label: 'Veterinarias', icon: 'vet' },
  shelter: { label: 'Albergues', icon: 'heart' },
  boarding: { label: 'Guarderías', icon: 'home' },
  shop: { label: 'Pet shops', icon: 'bag' },
  grooming: { label: 'Peluquerías', icon: 'scissors' },
};

function categoryFromTags(tags) {
  if (tags.amenity === 'veterinary') return 'vet';
  if (tags.amenity === 'animal_shelter') return 'shelter';
  if (tags.amenity === 'animal_boarding') return 'boarding';
  if (tags.shop === 'pet_grooming') return 'grooming';
  if (tags.shop === 'pet') return 'shop';
  return null;
}

// Caja delimitadora (~km de radio) alrededor de un punto, en el formato que
// espera Overpass: sur,oeste,norte,este.
function bbox(center, km = 6) {
  const dLat = km / 111;
  const dLng = km / (111 * Math.cos((center.lat * Math.PI) / 180));
  return `${center.lat - dLat},${center.lng - dLng},${center.lat + dLat},${center.lng + dLng}`;
}

// Caché en memoria + localStorage por celda redondeada (~1 km) durante 7 días,
// para no abusar del servicio público de Overpass.
const memCache = new Map();
const TTL = 7 * 24 * 3600 * 1000;

export async function fetchPetPlaces(center) {
  const key = `${center.lat.toFixed(2)},${center.lng.toFixed(2)}`;
  if (memCache.has(key)) return memCache.get(key);
  try {
    const cached = JSON.parse(localStorage.getItem(`pp-places-${key}`) || 'null');
    if (cached && Date.now() - cached.at < TTL) {
      memCache.set(key, cached.places);
      return cached.places;
    }
  } catch {
    /* caché corrupto → consultar de nuevo */
  }

  const b = bbox(center);
  const q = `[out:json][timeout:25];(
    node["amenity"="veterinary"](${b});way["amenity"="veterinary"](${b});
    node["amenity"="animal_shelter"](${b});way["amenity"="animal_shelter"](${b});
    node["amenity"="animal_boarding"](${b});way["amenity"="animal_boarding"](${b});
    node["shop"="pet"](${b});way["shop"="pet"](${b});
    node["shop"="pet_grooming"](${b});way["shop"="pet_grooming"](${b});
  );out center 80;`;

  const res = await fetch(OVERPASS, { method: 'POST', body: q });
  if (!res.ok) throw new Error(`Overpass ${res.status}`);
  const data = await res.json();

  const places = [];
  const seen = new Set();
  for (const el of data.elements ?? []) {
    const tags = el.tags ?? {};
    const category = categoryFromTags(tags);
    if (!category) continue;
    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;
    if (lat == null || lng == null) continue;
    const id = `${el.type}-${el.id}`;
    if (seen.has(id)) continue;
    seen.add(id);
    places.push({
      id,
      category,
      name: tags.name || PLACE_CATEGORIES[category].label,
      lat,
      lng,
      phone: tags.phone || tags['contact:phone'] || null,
      hours: tags.opening_hours || null,
      address:
        [tags['addr:street'], tags['addr:housenumber']].filter(Boolean).join(' ') || null,
    });
  }

  memCache.set(key, places);
  try {
    localStorage.setItem(`pp-places-${key}`, JSON.stringify({ at: Date.now(), places }));
  } catch {
    /* sin persistencia igual devolvemos los resultados */
  }
  return places;
}

// Enlace de "cómo llegar": abre la navegación en Google Maps (app o web).
// Universal para web y nativo; no reinventamos la navegación.
export function directionsUrl(place) {
  return `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;
}
