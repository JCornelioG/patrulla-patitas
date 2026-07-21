# 📦 Documento de traspaso · Patrulla Patitas

**Propósito:** que cualquier persona o asistente de IA (Claude, ChatGPT, Gemini, etc.)
pueda continuar este proyecto sin depender de ninguna conversación previa. Todo lo
esencial está aquí o en el repositorio.

> Última actualización: julio de 2026.

---

## 1. Qué es el proyecto

**Patrulla Patitas** es una app comunitaria gratuita para encontrar mascotas
perdidas mediante alertas geolocalizadas entre vecinos y un rastro de
avistamientos en tiempo real sobre un mapa. Pensada para Perú (español), lista
para web, iOS y Android desde una sola base de código.

- **Web en vivo:** <https://patrulla-patitas.web.app>
- **Repositorio (privado):** <https://github.com/JCornelioG/patrulla-patitas>
- **Correo de soporte / contacto público:** patitaspatrulla736@gmail.com

### Reglas de producto que NO se deben romper

1. **El rescate es siempre gratis:** botón de perdido, alertas, mapa, avistamientos
   y flyer básico nunca van detrás de un pago. La suscripción "Patitas Plus" solo
   vende prevención y conveniencia (cartilla, recordatorios, QR, mascotas ilimitadas).
2. **Privacidad:** nunca se publica la dirección exacta. Toda coordenada se redondea
   a ~100 m (`approx()` en `src/utils/geo.js`). Sin cuentas ni contraseñas
   (autenticación anónima).
3. **Diseño:** sin emojis como iconografía (sistema de iconos SVG propio), sin
   gradientes decorativos genéricos. Tokens y guía en `src/styles.css`.

---

## 2. Stack técnico

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite 5 |
| Mapa | Leaflet + react-leaflet (tiles de OpenStreetMap, sin API key) |
| Móvil | Capacitor 8 (proyectos `ios/` y `android/` generados) |
| Backend | Firebase: Firestore, Storage, Auth anónima, Cloud Messaging, Cloud Functions |
| Suscripción | RevenueCat (`@revenuecat/purchases-capacitor`) sobre StoreKit / Play Billing |
| CI/CD | Codemagic (`codemagic.yaml`) → TestFlight y Play Console, sin Mac |
| Hosting web | Firebase Hosting |

Requisitos de build: **Node 22+** y **JDK 21** (Capacitor 8 los exige; ya están
fijados en `codemagic.yaml`).

---

## 3. Mapa de la arquitectura (archivos clave)

```
src/
  config/
    firebase.js        Config de Firebase (client keys; ya pegadas y funcionando)
    revenuecat.js      Keys de RevenueCat (PENDIENTE pegar appl_/goog_)
    constants.js       Radio de alerta, límite de mascotas gratis, correo soporte
  services/
    index.js           Elige backend: Firebase si está configurado, si no localStore.
                       Override de desarrollo: ?demo=1 fuerza datos de prueba.
    firebaseStore.js   Capa de datos de producción (Firestore/Storage/Auth)
    localStore.js      Modo demo en localStorage (datos de ejemplo)
    account.js         Vinculación de cuenta anónima con Apple/Google
    subscription.js    Estado de Patitas Plus (RevenueCat o modo prueba)
    health.js          Cartilla sanitaria (datos locales, privados)
    notifications.js   Recordatorios (notificaciones locales)
    push.js / profile.js
  hooks/               useUserLocation (GPS con fallback a Lima), usePlus
  utils/               geo, photo, qr (vCard), flyer (canvas A4), share, haptics
  components/          UI: Icons (SVG propios), TabBar, ReportSheet, AlertsFeed,
                       AlertMap, MapTab, MyPets, PetDetail, PetFormModal, Paywall,
                       HealthPanel, QrPanel, FlyerModal, Onboarding, AccountCard…
  data/demoData.js     Datos de ejemplo (solo modo demo)
functions/index.js     Cloud Function notificarCambios: push a vecinos y al dueño
firestore.rules        Seguridad Firestore    storage.rules  Seguridad Storage
ios/  android/         Proyectos nativos generados por Capacitor
codemagic.yaml         Workflows ios-appstore y android-playstore
public/privacidad.html Política de privacidad (servida en la web)
README.md              Cómo correr    APPSTORE.md / PLAYSTORE.md  Runbooks de tiendas
```

---

## 4. Cómo correrlo (desde cero en cualquier máquina)

```bash
git clone https://github.com/JCornelioG/patrulla-patitas.git
cd patrulla-patitas
npm install
npm run dev            # http://localhost:5173  (usa Firebase real)
# http://localhost:5173/?demo=1  → datos de prueba sin tocar producción
npm run build          # genera dist/
```

Móvil / tiendas: ver `APPSTORE.md` (iOS) y `PLAYSTORE.md` (Android). Ambos builds
se hacen en la nube con Codemagic (no requieren Mac).

---

## 5. Cuentas y credenciales (dónde vive cada cosa)

> ⚠️ **Ningún secreto crítico está en el repositorio.** Esta tabla dice DÓNDE
> está cada llave, no cuál es. Guarda las contraseñas en un gestor seguro.

| Servicio | Cuenta / ubicación | Estado |
|---|---|---|
| Firebase | proyecto `patrulla-patitas` (cuenta Google del dueño) | ✅ activo, en producción |
| Config web de Firebase | `src/config/firebase.js` (client keys, ok que estén en el repo) | ✅ |
| GoogleService-Info.plist / google-services.json | en `ios/` y `android/` (config de cliente) | ✅ |
| Keystore de firma Android | `C:\Users\Mulde\Documents\patrulla-keystore\` + subido a Codemagic como `patrulla_keystore`. Contraseñas en `LEEME-IMPORTANTE.txt` de esa carpeta. **NO está en el repo.** | ✅ |
| Google Play Console | cuenta personal (país Canadá), pagada (US$ 25) | ⏳ verificación de identidad |
| Codemagic | conectado al repo de GitHub | ✅ compila AAB |
| Correo soporte | patitaspatrulla736@gmail.com | ✅ |
| Apple Developer | — | ❌ pendiente (US$ 99/año) |
| RevenueCat | — | ❌ pendiente (keys en `src/config/revenuecat.js`) |

---

## 6. Estado actual: hecho vs. pendiente

**Hecho ✅**
- App completa (web + iOS + Android) con rediseño y sistema de diseño.
- Backend Firebase en producción (reglas + Cloud Function de push desplegadas).
- Suscripción Patitas Plus integrada (en "modo prueba" hasta pegar keys reales).
- Vinculación de cuenta Google/Apple, onboarding, haptics.
- Repo en GitHub, web desplegada, Codemagic compilando AAB firmado.
- Cuenta de Play pagada; ficha (gráficos en `store/` + textos en `PLAYSTORE.md`) lista.

**Pendiente ⏳ (solo trámites del dueño)**
1. Verificación de identidad de Google Play (~2 días).
2. Crear la app en Play Console → subir el AAB → prueba interna → **prueba cerrada
   con 12+ testers durante 14 días** → producción.
3. RevenueCat: crear cuenta, crear productos `pp_plus` (mensual/anual), vincular
   entitlement `plus`, pegar keys `appl_`/`goog_` en `src/config/revenuecat.js`.
4. iOS: cuenta Apple Developer + clave APNs (subir a Firebase) → build en Codemagic
   → TestFlight → revisión.
5. Android Google Sign-In: agregar huellas SHA-1/SHA-256 del keystore a Firebase y
   re-descargar `google-services.json`.

---

## 7. Cómo continuar con OTRO asistente de IA (ChatGPT, Gemini, etc.)

1. Sube el repositorio (o dale acceso). La mayoría de asistentes pueden leer un
   repo de GitHub o archivos que subas.
2. Pega este **prompt inicial** para darle todo el contexto:

   > Voy a continuar el desarrollo de "Patrulla Patitas", una app comunitaria de
   > mascotas perdidas (React + Vite + Capacitor 8, backend Firebase, suscripción
   > con RevenueCat, CI en Codemagic). El código está en este repositorio y hay un
   > documento `HANDOFF.md` en la raíz con la arquitectura, el estado y los pasos
   > pendientes. Léelo primero. Reglas que no se pueden romper: el rescate siempre
   > es gratis, nunca se publican direcciones exactas, y no se usan emojis como
   > iconografía. Actúa como Senior Frontend/Mobile Engineer y ayúdame con: [tu tarea].

3. Apúntalo siempre a `HANDOFF.md`, `BITACORA.md`, `README.md`, `APPSTORE.md` y
   `PLAYSTORE.md`: son la fuente de verdad del proyecto, independiente de cualquier
   chat. (`BITACORA.md` explica el *porqué* de cada decisión; este archivo, el
   *qué* y el *dónde*.)

**Lo esencial:** el proyecto es portable por diseño. Nada depende de un asistente
concreto. Mantén este archivo actualizado cuando cambien cuentas, keys o el estado,
y cualquier LLM podrá retomar donde quedaste.
