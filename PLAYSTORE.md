# 🤖 Runbook: publicar Patrulla Patitas en Google Play

El proyecto Android ya está generado y configurado en el repo: permisos declarados, íconos adaptativos y splash, firma para CI, `versionCode` automático y workflow `android-playstore` en `codemagic.yaml`. Android es **más simple que iOS**: no necesitas Mac para nada y el push no requiere APNs.

Este documento cubre lo que solo tú puedes hacer (cuentas y claves). Los pasos de Firebase y RevenueCat asumen que ya hiciste (o harás) los de [APPSTORE.md](APPSTORE.md) — ambas plataformas comparten proyecto Firebase y proyecto RevenueCat.

## Resumen de cuentas y costos

| Servicio | Costo | Para qué |
|---|---|---|
| Google Play Console | **US$ 25 una sola vez** | Publicar en Play Store |
| Firebase / Codemagic / GitHub | Ya cubiertos por el plan de iOS | Compartidos entre plataformas |

## Valores a reemplazar (además de los de APPSTORE.md)

| Dónde | Qué va ahí |
|---|---|
| `src/config/revenuecat.js` → `REVENUECAT_ANDROID_KEY` | API key pública Android de RevenueCat (`goog_...`) |
| Variable `GOOGLE_SERVICES_JSON` en Codemagic | `google-services.json` real en base64 (paso 1) |
| Keystore `patrulla_keystore` en Codemagic | Clave de firma Android (paso 4) |

---

## Paso 1 — Firebase: agregar la app Android (~10 min)

1. En tu proyecto Firebase (el mismo de iOS) → **Agregar app → Android**, package name exacto: `com.patrullapatitas.app`.
2. Descarga **google-services.json**. No hace falta tocar gradle: el proyecto ya detecta el archivo automáticamente si está en `android/app/`, y en CI se inyecta desde la variable segura.
3. Push en Android: no requiere nada más — FCM funciona directo (sin APNs ni claves extra). Las Cloud Functions que ya escribimos notifican a iOS y Android por igual.

## Paso 2 — Cuenta de Google Play Console (~1–2 días por verificación)

1. Entra a <https://play.google.com/console> y paga la inscripción (US$ 25 único).
2. Verifica tu identidad (DNI/pasaporte). Google puede tardar un par de días.
3. **Importante si es cuenta personal nueva**: Google exige que la app pase una **prueba cerrada con al menos 12 testers durante 14 días continuos** antes de poder publicar en producción. Planifícalo: recluta 12+ amigos/familiares con Android desde el inicio.
4. Crea la app: nombre **Patrulla Patitas**, idioma español (Latinoamérica), tipo App, gratis.

## Paso 3 — Suscripción Patitas Plus en Play (~30 min)

1. Play Console → tu app → **Productos → Suscripciones** → crea la suscripción `pp_plus` con dos **base plans**: `monthly` (S/ 9.90) y `yearly` (S/ 79.90). Igual que Apple, Google convierte el precio a la moneda de cada país automáticamente (y puedes ajustar por país).
2. En **RevenueCat** (mismo proyecto del paso iOS): agrega la app **Play Store** con el package `com.patrullapatitas.app`. Te pedirá una **cuenta de servicio de Google Cloud** con acceso a la API de Play (RevenueCat tiene guía paso a paso en su consola; es un JSON que subes una vez).
3. Vincula los productos de Play al entitlement `plus` (el mismo) y agrégalos a la Offering default.
4. Copia la API key pública Android (`goog_...`) → pégala en `src/config/revenuecat.js`. El paywall detecta la plataforma solo.
5. Comisión de Google: 15 % en el primer US$ 1M/año (automático, no hay que inscribirse como con Apple).

## Paso 4 — Codemagic: compilar y subir (~20 min)

1. **Keystore de firma**: Codemagic → Teams → **Code signing identities → Android keystores** → "Generate new keystore" (o sube uno propio) y nómbralo exactamente **`patrulla_keystore`**. ⚠️ Descarga una copia y guárdala con sus contraseñas: con Play App Signing, Google custodia la clave final, pero esta clave de subida es tuya.
2. ~~Variable `GOOGLE_SERVICES_JSON`~~ — **ya no es necesaria**: el `google-services.json` real está commiteado en `android/app/`. (Sigue soportada como override opcional.)
3. **Cuenta de servicio para publicar**: Play Console → Setup → **API access** → crea/vincula una cuenta de servicio de Google Cloud con rol "Release manager". Descarga su JSON y guárdalo como variable segura **`GCLOUD_SERVICE_ACCOUNT_CREDENTIALS`** (grupo `google_play`). *(La primera subida de AAB debe ser manual en la consola para "estrenar" la app; desde la segunda, publica el CI.)*
4. **Start new build** → workflow `android-playstore`: compila el AAB firmado y lo sube al track **internal**.

## Paso 5 — Completar la ficha (~1 h)

1. **Capturas**: desde cualquier teléfono Android con la build interna instalada (o un emulador de Android Studio). Mínimo 2 de teléfono; recomendado: feed, detalle con mapa, final feliz, paywall.
2. **Ficha**: usa los mismos textos del paso 6 de APPSTORE.md (descripción, subtítulo). Ícono 512×512 (exporta de `assets/icon.png`) y banner 1024×500 (puedo generarlo si quieres).
3. **Data Safety** (Play Console → App content → Data safety) — declara exactamente:
   - **Ubicación → Aproximada**: recolectada, NO compartida, con fines de "Funcionalidad de la app". Efímera: no. Requerida: sí.
   - **Fotos**: recolectadas (fotos de mascotas), no compartidas, funcionalidad.
   - **Información personal → Nombre y teléfono**: opcionales, ingresados por el usuario, visibles en sus propias alertas, funcionalidad.
   - **Historial de compras**: recolectado (suscripción), funcionalidad.
   - Datos cifrados en tránsito: sí. Se pueden solicitar borrados: sí (correo de soporte).
4. **Clasificación de contenido** (cuestionario IARC): app utilitaria, sin violencia/apuestas → apto para todos.
5. **Política de privacidad**: la misma URL pública del paso iOS.
6. Declaraciones restantes: sin anuncios; público objetivo 13+; no es app de noticias ni COVID.

## Paso 6 — Testing y producción

1. **Internal testing** (hasta 100 testers por correo): valida push, GPS, cámara y la compra sandbox con "testers de licencia" (Play Console → Setup → License testing — las compras no se cobran).
2. **Closed testing**: promociona la build e invita a tus 12+ testers → deja correr los **14 días** (requisito de cuentas personales nuevas).
3. Solicita acceso a **producción**, completa el cuestionario y publica. La revisión de Google suele tardar de horas a ~2 días.

## Diferencias clave vs. App Store (para tu tranquilidad)

- **No necesitas Mac ni TestFlight**: el AAB se compila en Linux (Codemagic) o incluso en esta PC si instalas Android Studio.
- **Sin APNs**: el push ya funciona con solo el `google-services.json`.
- **La espera grande es la prueba cerrada de 14 días**, no la revisión. Empieza a reclutar testers hoy.
- **Guarda el keystore**: perderlo es recuperable con Play App Signing, pero es trámite. Cópialo en un lugar seguro.

## Después del lanzamiento

- Los comentarios `FUTURO:` del código aplican igual en Android (chapita física, insignias, i18n, veterinarias).
- Monitoreo: Play Console (ANRs/crashes, reseñas) + Firebase + RevenueCat (ingresos de ambas tiendas unificados).
