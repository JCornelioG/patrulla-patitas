import { Capacitor } from '@capacitor/core';

// Selección de foto de la mascota.
//  - Nativo (iOS/Android): plugin Camera de Capacitor (cámara o galería).
//  - Web: <input type="file"> clásico.
// En ambos casos la imagen se comprime a máx. 900 px / JPEG antes de subirse.

const MAX_SIDE = 900;

export async function pickPhoto() {
  if (Capacitor.isNativePlatform()) {
    const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
    const photo = await Camera.getPhoto({
      quality: 80,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt, // el usuario elige cámara o galería
      width: MAX_SIDE,
    });
    return compressDataUrl(photo.dataUrl);
  }
  const file = await pickFileWeb();
  if (!file) return null;
  const dataUrl = await readAsDataUrl(file);
  return compressDataUrl(dataUrl);
}

function pickFileWeb() {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => resolve(input.files?.[0] ?? null);
    // Si el usuario cierra el diálogo sin elegir, no llega evento en todos los
    // navegadores; el caller tolera una promesa que nunca resuelve porque el
    // modal sigue usable.
    input.click();
  });
}

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function compressDataUrl(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => resolve(dataUrl); // si no se puede decodificar, va tal cual
    img.src = dataUrl;
  });
}
