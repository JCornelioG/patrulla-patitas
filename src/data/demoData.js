// ─── Datos de ejemplo para el MODO DEMO (sin Firebase configurado) ──────────
// En producción estos datos no existen: todo viene de Firestore.
//
// FUTURO (estructura preparada):
//  - Chapita QR del collar → perfil público de la mascota.
//  - Reputación e insignias para vecinos que ayudan seguido.
//  - Flyer imprimible autogenerado desde el perfil.
//  - Red de veterinarias asociadas que también reciben las alertas.

const MIN = 60_000;

// `uid` es el usuario local: Luna le pertenece para poder probar el flujo
// completo PERDIDO → ENCONTRADO.
export function demoPets(uid) {
  const now = Date.now();
  return [
    {
      id: 'luna',
      ownerId: uid,
      name: 'Luna',
      species: 'Gata',
      pronoun: 'a',
      breed: 'Común europea',
      color: 'Gris atigrada',
      size: 'Pequeña',
      description:
        'Tímida con desconocidos: no intentes agarrarla, solo avisa dónde está. Collar morado con cascabel.',
      bg: '#EAF2FF',
      photoUrl: null,
      ownerName: 'José (tú)',
      ownerPhone: '+51 999 123 456',
      status: 'home',
      lostAt: null,
      foundAt: null,
      lastKnown: null,
      sightings: [],
      createdAt: now,
    },
    {
      id: 'rocky',
      ownerId: 'demo-marina',
      name: 'Rocky',
      species: 'Perro',
      pronoun: 'o',
      breed: 'Border Collie',
      color: 'Negro y blanco',
      size: 'Grande',
      description:
        'Collar rojo con chapita. Muy amistoso pero está asustado; responde a su nombre y le encantan las galletas.',
      bg: '#FFF0D3',
      photoUrl: null,
      ownerName: 'Marina G.',
      ownerPhone: '+51 987 555 111',
      status: 'lost',
      lostAt: now - 47 * MIN,
      foundAt: null,
      lastKnown: { lat: -12.119, lng: -77.03 },
      sightings: [
        {
          id: 'r1',
          at: now - 35 * MIN,
          lat: -12.1215,
          lng: -77.0325,
          note: 'Corría por el malecón Cisneros hacia el sur, se veía asustado.',
          reporterId: 'demo-diego',
          reporterName: 'Diego P.',
        },
        {
          id: 'r2',
          at: now - 22 * MIN,
          lat: -12.124,
          lng: -77.034,
          note: 'Lo vi bajando por el malecón, olfateando unos arbustos.',
          reporterId: 'demo-camila',
          reporterName: 'Camila R.',
        },
        {
          id: 'r3',
          at: now - 8 * MIN,
          lat: -12.1265,
          lng: -77.036,
          note: 'Está cerca del Parque del Amor, un señor le dio agua. Sigue ahí.',
          reporterId: 'demo-fede',
          reporterName: 'Fede M.',
        },
      ],
      createdAt: now - 200 * MIN,
    },
    {
      id: 'simon',
      ownerId: 'demo-valentina',
      name: 'Simón',
      species: 'Gato',
      pronoun: 'o',
      breed: 'Siamés',
      color: 'Crema y marrón',
      size: 'Mediano',
      description:
        'Ojos celestes, sin collar (se lo quitó al escaparse). Suele subirse a los techos. No es agresivo.',
      bg: '#EAF2FF',
      photoUrl: null,
      ownerName: 'Valentina S.',
      ownerPhone: '+51 991 222 333',
      status: 'lost',
      lostAt: now - 180 * MIN,
      foundAt: null,
      lastKnown: { lat: -12.14, lng: -77.021 },
      sightings: [
        {
          id: 's1',
          at: now - 120 * MIN,
          lat: -12.1405,
          lng: -77.0225,
          note: 'Encima de un muro por la Av. Grau, en Barranco. No se dejó acercar.',
          reporterId: 'demo-bruno',
          reporterName: 'Bruno T.',
        },
        {
          id: 's2',
          at: now - 40 * MIN,
          lat: -12.1415,
          lng: -77.024,
          note: 'Metido debajo de un carro estacionado, maullando.',
          reporterId: 'demo-lucia',
          reporterName: 'Lucía A.',
        },
      ],
      createdAt: now - 300 * MIN,
    },
    {
      id: 'coco',
      ownerId: 'demo-ramiro',
      name: 'Coco',
      species: 'Perro',
      pronoun: 'o',
      breed: 'Poodle toy',
      color: 'Blanco',
      size: 'Pequeño',
      description:
        'Recién operado, necesita su medicación. Lleva una chompa azul. Se asusta con los ruidos fuertes.',
      bg: '#FFF0D3',
      photoUrl: null,
      ownerName: 'Ramiro D.',
      ownerPhone: '+51 982 444 777',
      status: 'lost',
      lostAt: now - 14 * MIN,
      foundAt: null,
      lastKnown: { lat: -12.103, lng: -77.036 },
      sightings: [],
      createdAt: now - 100 * MIN,
    },
  ];
}
