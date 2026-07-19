import { Capacitor } from '@capacitor/core';

// Respuesta háptica en los momentos clave (solo app nativa; en web no hace
// nada). Falla en silencio: la vibración nunca debe romper una acción.

async function haptic(run) {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const mod = await import('@capacitor/haptics');
    await run(mod);
  } catch {
    /* sin haptics no pasa nada */
  }
}

// Golpe fuerte: activar la alerta de PERDIDO.
export const hapticAlert = () =>
  haptic(({ Haptics, ImpactStyle }) => Haptics.impact({ style: ImpactStyle.Heavy }));

// Éxito: mascota encontrada, cuenta protegida.
export const hapticSuccess = () =>
  haptic(({ Haptics, NotificationType }) => Haptics.notification({ type: NotificationType.Success }));

// Toque suave: confirmar un avistamiento.
export const hapticTap = () =>
  haptic(({ Haptics, ImpactStyle }) => Haptics.impact({ style: ImpactStyle.Light }));
