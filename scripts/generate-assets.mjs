// Genera assets/icon.png (1024×1024) y assets/splash*.png (2732×2732) a
// partir de arte SVG (huellita de la marca). Luego @capacitor/assets los
// convierte en todos los tamaños que iOS necesita:
//
//   node scripts/generate-assets.mjs
//   npx capacitor-assets generate --ios
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const CORAL = '#FF6B4A';
const CREAM = '#FFF9F2';

// Huella centrada en un lienzo 1024×1024.
const paw = (fill) => `
  <g fill="${fill}">
    <ellipse cx="320" cy="400" rx="80" ry="106" transform="rotate(-20 320 400)"/>
    <ellipse cx="445" cy="322" rx="80" ry="108"/>
    <ellipse cx="579" cy="322" rx="80" ry="108"/>
    <ellipse cx="704" cy="400" rx="80" ry="106" transform="rotate(20 704 400)"/>
    <path d="M512 500 C 380 500 288 606 288 706 C 288 806 380 846 447 834 C 482 828 495 812 512 812 C 529 812 542 828 577 834 C 644 846 736 806 736 706 C 736 606 644 500 512 500 Z"/>
  </g>`;

const icon = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" fill="${CORAL}"/>
  ${paw('#FFFFFF')}
</svg>`;

const splash = (bg, fg) => `<svg width="2732" height="2732" viewBox="0 0 2732 2732" xmlns="http://www.w3.org/2000/svg">
  <rect width="2732" height="2732" fill="${bg}"/>
  <g transform="translate(1094,1094) scale(0.53125)">${paw(fg)}</g>
</svg>`;

mkdirSync('assets', { recursive: true });
await sharp(Buffer.from(icon)).png().toFile('assets/icon.png');
await sharp(Buffer.from(splash(CREAM, CORAL))).png().toFile('assets/splash.png');
await sharp(Buffer.from(splash('#2A1F1A', CORAL))).png().toFile('assets/splash-dark.png');
console.log('Assets generados en assets/');
