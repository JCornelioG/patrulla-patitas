import { Capacitor } from '@capacitor/core';

// Notificaciones locales para los recordatorios de la cartilla.
// Solo funcionan en la app instalada (iOS/Android); en web los recordatorios
// se guardan igual pero no suenan — la UI lo aclara.

// Id numérico estable a partir del id de texto del recordatorio.
function numericId(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h) % 2147483647;
}

export async function scheduleReminder(reminder, petName) {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    const perm = await LocalNotifications.requestPermissions();
    if (perm.display !== 'granted') return false;
    const schedule =
      reminder.repeat && reminder.repeat !== 'none'
        ? { at: new Date(reminder.at), repeats: true, every: reminder.repeat }
        : { at: new Date(reminder.at) };
    await LocalNotifications.schedule({
      notifications: [
        {
          id: numericId(reminder.id),
          title: `🐾 ${reminder.title}`,
          body: `Recordatorio de cuidado de ${petName}`,
          schedule,
        },
      ],
    });
    return true;
  } catch (err) {
    console.warn('No se pudo programar la notificación:', err);
    return false;
  }
}

export async function cancelReminder(reminderId) {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    await LocalNotifications.cancel({ notifications: [{ id: numericId(reminderId) }] });
  } catch (err) {
    console.warn('No se pudo cancelar la notificación:', err);
  }
}
