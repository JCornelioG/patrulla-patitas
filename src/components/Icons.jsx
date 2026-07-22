// Sistema de iconos propio: SVG inline de trazo redondeado (estilo Lucide,
// grosor 1.8), sin dependencias externas. Un único componente <Icon/>
// garantiza tamaño y grosor consistentes en toda la app.
//
// Iconos custom del dominio: paw (huella de la marca), dog, cat,
// sighting (avistamiento), zone (ubicación aproximada) y report.

const STROKE_PATHS = {
  bell: (
    <>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </>
  ),
  bellRing: (
    <>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      <path d="M22 8c0-2.3-.8-4.3-2-6" />
      <path d="M4 2C2.8 3.7 2 5.7 2 8" />
    </>
  ),
  map: (
    <>
      <path d="M9 3.6 3.6 5.4a1 1 0 0 0-.6.9v13l6-2 6 2 5.4-1.8a1 1 0 0 0 .6-.9v-13l-6 2Z" />
      <path d="M9 3.6v13.7" />
      <path d="M15 5.6v13.7" />
    </>
  ),
  pin: (
    <>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  zone: (
    <>
      <circle cx="12" cy="12" r="9" strokeDasharray="3.5 3.5" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  phone: (
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
  ),
  camera: (
    <>
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" />
      <circle cx="12" cy="13" r="3" />
    </>
  ),
  chevronRight: <path d="m9 18 6-6-6-6" />,
  back: <path d="m15 18-6-6 6-6" />,
  x: (
    <>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
  edit: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </>
  ),
  trash: (
    <>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="m19 6-1 15H6L5 6" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </>
  ),
  shield: (
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z" />
  ),
  alert: (
    <>
      <path d="M21.73 18 13.7 4a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </>
  ),
  report: (
    <>
      <path d="M4 21V5a1 1 0 0 1 1-1c4.5-2 7.5 2 12 0v10c-4.5 2-7.5-2-11-.5" />
    </>
  ),
  share: (
    <>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 13.5 6.8 4" />
      <path d="m15.4 6.5-6.8 4" />
    </>
  ),
  file: (
    <>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </>
  ),
  heart: (
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.51 4.04 3 5.5l7 7Z" />
  ),
  home: (
    <>
      <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1Z" />
    </>
  ),
  locate: (
    <>
      <path d="M2 12h3" />
      <path d="M19 12h3" />
      <path d="M12 2v3" />
      <path d="M12 19v3" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="1.5" />
    </>
  ),
  qr: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <path d="M14 14h3v3" />
      <path d="M21 14v7h-4" />
      <path d="M14 21h.01" />
    </>
  ),
  health: (
    <>
      <path d="M12 4a8 8 0 0 0-8 8c0 4.4 3.6 8 8 8s8-3.6 8-8a8 8 0 0 0-8-8Z" />
      <path d="M12 9v6" />
      <path d="M9 12h6" />
    </>
  ),
  vet: (
    <>
      <path d="M11 2h2a1 1 0 0 1 1 1v2h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-2H7a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h2V3a1 1 0 0 1 1-1Z" />
      <path d="M8 15c-2 1-3 3-3 5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2c0-2-1-4-3-5" />
    </>
  ),
  scissors: (
    <>
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M20 4 8.12 15.88" />
      <path d="M14.47 14.48 20 20" />
      <path d="M8.12 8.12 12 12" />
    </>
  ),
  bag: (
    <>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </>
  ),
  navigation: <path d="M3 11 22 2l-9 19-2-8-8-2Z" />,
  layers: (
    <>
      <path d="m12 2 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12 9 5 9-5" />
      <path d="m3 17 9 5 9-5" />
    </>
  ),
  pill: (
    <>
      <rect x="3.5" y="8.5" width="17" height="7" rx="3.5" transform="rotate(-30 12 12)" />
      <path d="m9 8 6 8" transform="rotate(-30 12 12)" />
    </>
  ),
  clipboard: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4a2 2 0 0 1 6 0" />
      <path d="M9 11h6" />
      <path d="M9 15h6" />
    </>
  ),
  scale: (
    <>
      <path d="M12 3v18" />
      <path d="M5 7h14" />
      <path d="M5 7 2.5 13a2.5 2.5 0 0 0 5 0Z" />
      <path d="M19 7l-2.5 6a2.5 2.5 0 0 0 5 0Z" />
    </>
  ),
  sparkle: (
    <path d="M12 3.5 13.8 9 19.5 11 13.8 13 12 18.5 10.2 13 4.5 11 10.2 9Z" />
  ),
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </>
  ),
  dog: (
    <>
      <path d="M8.5 4.5C6 4.5 4.6 6.6 5.2 9l.4 1.6c-.7 1.1-1.1 2.3-1.1 3.6 0 3.9 3.4 6.3 7.5 6.3s7.5-2.4 7.5-6.3c0-1.3-.4-2.5-1.1-3.6l.4-1.6c.6-2.4-.8-4.5-3.3-4.5l-1.6 1.6a8.6 8.6 0 0 0-4 0Z" />
      <path d="M9.5 12.5h.01" />
      <path d="M14.5 12.5h.01" />
      <path d="M12 15.5v.01" />
    </>
  ),
  cat: (
    <>
      <path d="M6.7 8.2C6 6.6 5.9 4.8 6.4 3c1.9-.1 3.7.8 5.1 2.3h1c1.4-1.5 3.2-2.4 5.1-2.3.5 1.8.4 3.6-.3 5.2.9 1.2 1.5 2.6 1.5 4.1 0 4.1-3 7.2-6.8 7.2s-6.8-3.1-6.8-7.2c0-1.5.6-2.9 1.5-4.1Z" />
      <path d="M9.5 12.5h.01" />
      <path d="M14.5 12.5h.01" />
      <path d="M12 15v.01" />
    </>
  ),
};

const FILL_PATHS = {
  paw: (
    <g fill="currentColor" stroke="none">
      <ellipse cx="6.4" cy="9.6" rx="1.9" ry="2.5" transform="rotate(-22 6.4 9.6)" />
      <ellipse cx="10.1" cy="7.2" rx="1.9" ry="2.6" />
      <ellipse cx="13.9" cy="7.2" rx="1.9" ry="2.6" />
      <ellipse cx="17.6" cy="9.6" rx="1.9" ry="2.5" transform="rotate(22 17.6 9.6)" />
      <path d="M12 11.4c-3.4 0-5.8 2.7-5.8 5.3 0 2.6 2.4 3.6 3.8 3.3.9-.2 1.4-.6 2-.6s1.1.4 2 .6c1.4.3 3.8-.7 3.8-3.3 0-2.6-2.4-5.3-5.8-5.3Z" />
    </g>
  ),
};

export default function Icon({ name, size = 20, strokeWidth = 1.8, className = '', label }) {
  const fill = FILL_PATHS[name];
  const stroke = STROKE_PATHS[name];
  if (!fill && !stroke) return null;
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={fill ? 'none' : 'currentColor'}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : 'presentation'}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {fill ?? stroke}
    </svg>
  );
}

// Icono de especie para avatares y marcadores.
export function speciesIcon(species) {
  const s = (species ?? '').toLowerCase();
  if (s.startsWith('gat')) return 'cat';
  if (s.startsWith('perr')) return 'dog';
  return 'paw';
}
