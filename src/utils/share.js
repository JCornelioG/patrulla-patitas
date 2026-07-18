import { Capacitor } from '@capacitor/core';

// Guarda o comparte una imagen generada (flyer, chapita QR).
//  - Nativo: hoja de compartir de iOS (AirDrop, WhatsApp, imprimir, guardar).
//  - Web: descarga directa.
export async function saveOrShareImage(dataUrl, fileName, title) {
  if (Capacitor.isNativePlatform()) {
    try {
      const { Filesystem, Directory } = await import('@capacitor/filesystem');
      const { Share } = await import('@capacitor/share');
      const file = await Filesystem.writeFile({
        path: fileName,
        data: dataUrl.split(',')[1],
        directory: Directory.Cache,
      });
      await Share.share({ title, files: [file.uri] });
      return true;
    } catch (err) {
      console.warn('No se pudo compartir:', err);
      return false;
    }
  }
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = fileName;
  a.click();
  return true;
}
