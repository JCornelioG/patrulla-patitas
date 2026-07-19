import { formatClock } from './geo';

// Flyer de búsqueda imprimible (A4 a 150 dpi), dibujado en canvas.
// El flyer es GRATIS para toda mascota perdida (es herramienta de rescate);
// con Patitas Plus incluye además el QR de contacto escaneable.
//
// Layout de zonas fijas (nada se superpone):
//   0–240     cabecera coral: SE PERDIÓ + mensaje
//   240–1000  nombre + tarjeta de foto
//   1000–1290 chips de datos + caja de descripción
//   1290–1370 línea "perdido desde"
//   1390–1640 banda de contacto (teléfono a la izquierda, QR a la derecha)
//   1670–1754 pie de marca

const W = 1240;
const H = 1754;
const CORAL = '#FF6258';
const CORAL_SOFT = '#FFE3DC';
const INK = '#262129';
const MUTED = '#746A70';
const CREAM = '#FFF9F4';
const LINE = '#EDE4DC';

const font = (px, weight = 700) => `${weight} ${px}px Manrope, 'Segoe UI', sans-serif`;

// Dibuja la huella de la marca (misma forma que el icono SVG) centrada en
// (cx, cy) a la escala dada, sin depender de emojis del sistema.
function drawPaw(ctx, cx, cy, scale, color) {
  ctx.save();
  ctx.translate(cx - 12 * scale, cy - 12 * scale);
  ctx.scale(scale, scale);
  ctx.fillStyle = color;
  const ellipse = (x, y, rx, ry, rot) => {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, (rot * Math.PI) / 180, 0, Math.PI * 2);
    ctx.fill();
  };
  ellipse(6.4, 9.6, 1.9, 2.5, -22);
  ellipse(10.1, 7.2, 1.9, 2.6, 0);
  ellipse(13.9, 7.2, 1.9, 2.6, 0);
  ellipse(17.6, 9.6, 1.9, 2.5, 22);
  ctx.beginPath();
  ctx.moveTo(12, 11.4);
  ctx.bezierCurveTo(8.6, 11.4, 6.2, 14.1, 6.2, 16.7);
  ctx.bezierCurveTo(6.2, 19.3, 8.6, 20.3, 10, 20);
  ctx.bezierCurveTo(10.9, 19.8, 11.4, 19.4, 12, 19.4);
  ctx.bezierCurveTo(12.6, 19.4, 13.1, 19.8, 14, 20);
  ctx.bezierCurveTo(15.4, 20.3, 17.8, 19.3, 17.8, 16.7);
  ctx.bezierCurveTo(17.8, 14.1, 15.4, 11.4, 12, 11.4);
  ctx.fill();
  ctx.restore();
}

function wrapText(ctx, text, maxWidth) {
  const words = String(text ?? '').split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // fotos de Firebase Storage
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function withShadow(ctx, draw) {
  ctx.save();
  ctx.shadowColor = 'rgba(59, 46, 40, 0.18)';
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 10;
  draw();
  ctx.restore();
}

// Texto centrado que se encoge hasta caber en maxWidth.
function fitText(ctx, text, x, y, basePx, weight, maxWidth, color) {
  let px = basePx;
  ctx.font = font(px, weight);
  while (ctx.measureText(text).width > maxWidth && px > 22) {
    px -= 2;
    ctx.font = font(px, weight);
  }
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.fillText(text, x, y);
}

// Fila(s) de chips centradas; devuelve la altura usada.
function pillRows(ctx, items, y) {
  const pad = 46;
  const gap = 18;
  const h = 60;
  const maxW = W - 150;
  ctx.font = font(33, 800);
  const widths = items.map((t) => ctx.measureText(t).width + pad);

  const rows = [[]];
  let rowW = 0;
  items.forEach((t, i) => {
    const extra = widths[i] + (rows[rows.length - 1].length ? gap : 0);
    if (rowW + extra > maxW && rows[rows.length - 1].length) {
      rows.push([]);
      rowW = 0;
    }
    rows[rows.length - 1].push(i);
    rowW += widths[i] + (rows[rows.length - 1].length > 1 ? gap : 0);
  });

  rows.forEach((row, r) => {
    const total = row.reduce((a, i) => a + widths[i], 0) + gap * (row.length - 1);
    let x = (W - total) / 2;
    const ry = y + r * (h + 14);
    for (const i of row) {
      ctx.fillStyle = '#FFEFE4';
      ctx.beginPath();
      ctx.roundRect(x, ry, widths[i], h, h / 2);
      ctx.fill();
      ctx.fillStyle = INK;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = font(33, 800);
      ctx.fillText(items[i], x + widths[i] / 2, ry + h / 2 + 2);
      x += widths[i] + gap;
    }
  });
  ctx.textBaseline = 'alphabetic';
  return rows.length * h + (rows.length - 1) * 14;
}

export async function generateFlyer(pet, { qr = null } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // ── Fondo y cabecera ──
  ctx.fillStyle = CREAM;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = CORAL;
  ctx.fillRect(0, 0, W, 240);

  ctx.globalAlpha = 0.4;
  drawPaw(ctx, 100, 100, 3.6, '#FFFFFF');
  drawPaw(ctx, W - 100, 100, 3.6, '#FFFFFF');
  ctx.globalAlpha = 1;

  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = font(112, 800);
  ctx.fillText('SE PERDIÓ', W / 2, 148);
  ctx.fillStyle = CORAL_SOFT;
  ctx.font = font(36, 700);
  ctx.fillText('Ayúdanos a volver a casa', W / 2, 208);

  // ── Nombre ──
  fitText(ctx, pet.name.toUpperCase(), W / 2, 348, 92, 900, W - 160, INK);

  // ── Tarjeta de foto ──
  const photoSize = 560;
  const cardPad = 18;
  const px = (W - photoSize) / 2;
  const py = 392;
  withShadow(ctx, () => {
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(px - cardPad, py - cardPad, photoSize + cardPad * 2, photoSize + cardPad * 2, 40);
    ctx.fill();
  });
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(px, py, photoSize, photoSize, 28);
  ctx.clip();
  const img = pet.photoUrl ? await loadImage(pet.photoUrl) : null;
  if (img) {
    const scale = Math.max(photoSize / img.width, photoSize / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    ctx.drawImage(img, px + (photoSize - dw) / 2, py + (photoSize - dh) / 2, dw, dh);
  } else {
    ctx.fillStyle = pet.bg ?? '#FFF0D3';
    ctx.fillRect(px, py, photoSize, photoSize);
    drawPaw(ctx, W / 2, py + photoSize / 2, 13, CORAL);
  }
  ctx.restore();

  // ── Chips de datos ──
  pillRows(ctx, [pet.species, pet.breed, pet.color, pet.size].filter(Boolean), 1006);

  // ── Descripción ──
  ctx.font = font(37, 600);
  const descLines = wrapText(ctx, pet.description, W - 330).slice(0, 3);
  if (descLines.length > 0) {
    const boxH = descLines.length * 52 + 42;
    const boxY = 1098;
    ctx.fillStyle = '#FFF3E6';
    ctx.beginPath();
    ctx.roundRect(90, boxY, W - 180, boxH, 26);
    ctx.fill();
    ctx.fillStyle = '#6B5A50';
    ctx.textAlign = 'center';
    ctx.font = font(37, 600);
    descLines.forEach((line, i) => {
      ctx.fillText(line, W / 2, boxY + 58 + i * 52);
    });
  }

  // ── Perdido desde ──
  if (pet.status === 'lost' && pet.lostAt) {
    const when = `Perdid${pet.pronoun ?? 'o'} desde el ${new Date(pet.lostAt).toLocaleDateString('es-PE')} a las ${formatClock(pet.lostAt)}`;
    fitText(ctx, when, W / 2, 1352, 37, 800, W - 180, CORAL);
  }

  // ── Banda de contacto ──
  const bandY = 1390;
  const bandH = 250;
  withShadow(ctx, () => {
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(80, bandY, W - 160, bandH, 28);
    ctx.fill();
  });

  const qrImg = qr ? await loadImage(qr) : null;
  // Con QR, el contacto se centra en la mitad izquierda; sin QR, al centro.
  const leftCx = qrImg ? 485 : W / 2;

  ctx.fillStyle = CORAL;
  ctx.textAlign = 'center';
  ctx.font = font(42, 800);
  ctx.fillText('¿Lo viste? Llama ya', leftCx, bandY + 76);
  fitText(ctx, pet.ownerPhone || 'Contacto en la app', leftCx, bandY + 152, 58, 800, qrImg ? 740 : W - 260, INK);
  ctx.fillStyle = MUTED;
  ctx.font = font(33, 600);
  ctx.fillText(pet.ownerName ?? '', leftCx, bandY + 206);

  if (qrImg) {
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(890, bandY + 10, 230, 230, 20);
    ctx.stroke();
    ctx.drawImage(qrImg, 915, bandY + 28, 180, 180);
    ctx.fillStyle = INK;
    ctx.font = font(24, 700);
    ctx.textAlign = 'center';
    ctx.fillText('Escanéame', 1005, bandY + 228);
  }

  // ── Pie de marca ──
  ctx.fillStyle = CORAL;
  ctx.fillRect(0, H - 84, W, 84);
  drawPaw(ctx, 300, H - 42, 2.1, '#FFFFFF');
  ctx.fillStyle = '#FFFFFF';
  ctx.font = font(33, 700);
  ctx.textAlign = 'center';
  ctx.fillText('Patrulla Patitas · La guardia ciudadana de mascotas', W / 2 + 24, H - 31);

  return canvas.toDataURL('image/png');
}
