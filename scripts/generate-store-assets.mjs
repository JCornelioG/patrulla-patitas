// Genera los recursos gráficos que exige la ficha de Google Play:
//   store/icon-512.png              (ícono de la ficha, 512×512)
//   store/feature-graphic.png       (banner destacado, 1024×500)
//
//   node scripts/generate-store-assets.mjs
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const CORAL = '#FF6B4A';
const CORAL_DARK = '#F1502F';

// La misma huella de la marca (ver generate-assets.mjs), en un lienzo 1024.
const paw = (fill) => `
  <g fill="${fill}">
    <ellipse cx="320" cy="400" rx="80" ry="106" transform="rotate(-20 320 400)"/>
    <ellipse cx="445" cy="322" rx="80" ry="108"/>
    <ellipse cx="579" cy="322" rx="80" ry="108"/>
    <ellipse cx="704" cy="400" rx="80" ry="106" transform="rotate(20 704 400)"/>
    <path d="M512 500 C 380 500 288 606 288 706 C 288 806 380 846 447 834 C 482 828 495 812 512 812 C 529 812 542 828 577 834 C 644 846 736 806 736 706 C 736 606 644 500 512 500 Z"/>
  </g>`;

const banner = `<svg width="1024" height="500" viewBox="0 0 1024 500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${CORAL}"/>
      <stop offset="1" stop-color="${CORAL_DARK}"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="500" fill="url(#bg)"/>
  <g opacity="0.16" transform="translate(700,40) scale(0.55)">${paw('#FFFFFF')}</g>
  <g opacity="0.1" transform="translate(-60,240) scale(0.4) rotate(-15)">${paw('#FFFFFF')}</g>
  <g transform="translate(60,110) scale(0.27)">${paw('#FFFFFF')}</g>
  <text x="360" y="230" font-family="Arial, Helvetica, sans-serif" font-size="76" font-weight="bold" fill="#FFFFFF">Patrulla Patitas</text>
  <text x="362" y="295" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="bold" fill="#FFE3DC">La guardia ciudadana de mascotas</text>
  <text x="362" y="348" font-family="Arial, Helvetica, sans-serif" font-size="25" fill="#FFE3DC">Alertas entre vecinos · Rastro en vivo · Siempre gratis</text>
</svg>`;

mkdirSync('store', { recursive: true });
await sharp('assets/icon.png').resize(512, 512).png().toFile('store/icon-512.png');
await sharp(Buffer.from(banner)).png().toFile('store/feature-graphic.png');
console.log('Recursos de la ficha generados en store/');
