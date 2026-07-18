import { Capacitor } from '@capacitor/core';

// ─── Configuración de RevenueCat (suscripción Patitas Plus) ─────────────────
// PASOS ANTES DE COBRAR DE VERDAD (ver APPSTORE.md y PLAYSTORE.md):
//
//   1. Crea los productos de suscripción en cada tienda:
//      - App Store Connect: pp_plus_monthly / pp_plus_yearly (grupo "Patitas Plus")
//      - Play Console: suscripción pp_plus con base plans mensual y anual
//   2. Crea una cuenta en https://www.revenuecat.com (gratis hasta
//      US$ 2 500/mes de ingresos) y agrega ambas apps al mismo proyecto.
//   3. Vincula los productos a un entitlement llamado exactamente "plus".
//   4. Copia las API keys públicas aquí abajo:
//      - iOS: empieza con "appl_"
//      - Android (Play Store): empieza con "goog_"
//
// Mientras la key de la plataforma actual empiece con "PEGA_", el paywall
// corre en MODO PRUEBA: la "compra" se simula y se guarda solo en este
// dispositivo. Ideal para desarrollo.

export const REVENUECAT_IOS_KEY = 'PEGA_TU_API_KEY_APPL';
export const REVENUECAT_ANDROID_KEY = 'PEGA_TU_API_KEY_GOOG';

// Identificador del entitlement en RevenueCat.
export const PLUS_ENTITLEMENT = 'plus';

export function revenueCatKey() {
  return Capacitor.getPlatform() === 'android' ? REVENUECAT_ANDROID_KEY : REVENUECAT_IOS_KEY;
}

export function isRevenueCatConfigured() {
  return !revenueCatKey().startsWith('PEGA_');
}
