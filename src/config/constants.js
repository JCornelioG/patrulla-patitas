// Ubicación por defecto cuando el GPS no está disponible o el usuario
// no dio permiso: Parque Kennedy, Miraflores, Lima.
export const DEFAULT_LOCATION = { lat: -12.122, lng: -77.03 };

// Radio máximo (en metros) al que llegan las notificaciones push de una
// alerta nueva. Debe coincidir con MAX_ALERT_RADIUS_M en functions/index.js.
export const MAX_ALERT_RADIUS_M = 2500;

// Contacto para reportes de contenido inapropiado (requisito de revisión
// de Apple para apps con contenido generado por usuarios).
export const SUPPORT_EMAIL = 'patitaspatrulla736@gmail.com';

// Límite de mascotas del plan gratuito (Patitas Plus: ilimitadas).
// El rescate (alertas, mapa, avistamientos) NUNCA se limita.
export const FREE_PET_LIMIT = 2;
