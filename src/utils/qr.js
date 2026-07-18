import QRCode from 'qrcode';

// Generación de códigos QR (chapita del collar y flyer).

export function qrDataUrl(text, size = 512) {
  return QRCode.toDataURL(text, {
    width: size,
    margin: 1,
    color: { dark: '#3B2E28', light: '#FFFFFF' },
  });
}

// vCard offline: cualquier persona que escanee el QR con la cámara del
// celular ve el contacto del dueño — sin necesidad de tener la app.
export function petVCard(pet) {
  const phone = (pet.ownerPhone ?? '').replace(/\s/g, '');
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:Familia de ${pet.name} 🐾`,
    phone ? `TEL;TYPE=CELL:${phone}` : null,
    `NOTE:¡Hola! Soy ${pet.name} (${pet.species}). Si me encontraste, llama a mi familia. ${pet.description ?? ''} — Chapita de Patrulla Patitas`,
    'END:VCARD',
  ];
  return lines.filter(Boolean).join('\n');
}
