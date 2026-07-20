# 🐾 Patrulla Patitas

**🌐 App en vivo: <https://patrulla-patitas.web.app>**

App de **guardia ciudadana de mascotas perdidas**: cuando se pierde una mascota, el dueño activa una alerta geolocalizada, los vecinos cercanos reciben una notificación y cualquiera puede reportar avistamientos que forman un rastro en tiempo real sobre el mapa.

**El botón de perdido, las alertas y el mapa son siempre gratis.**

- **Web app** (React + Vite + Leaflet) y **app iOS nativa** (Capacitor 8) desde el mismo código.
- **Backend**: Firebase — Firestore (tiempo real), Storage (fotos), Auth anónima (sin cuentas) y Cloud Messaging (push). Sin configurar Firebase, la app corre en **modo demo** con datos locales de ejemplo.
- **Patitas Plus** (suscripción vía Apple IAP + RevenueCat): cartilla sanitaria, recordatorios con notificaciones, chapita QR para el collar, flyer con QR y mascotas ilimitadas. Sin API key de RevenueCat, el paywall corre en **modo prueba** (compra simulada en el dispositivo). El rescate — alertas, mapa, avistamientos y flyer básico — es siempre gratis.
- **Publicación sin Mac** vía CI de Codemagic. Guías paso a paso: **[APPSTORE.md](APPSTORE.md)** (iOS) y **[PLAYSTORE.md](PLAYSTORE.md)** (Android).
- **¿Retomas el proyecto (o cambias de asistente/desarrollador)?** Empieza por **[HANDOFF.md](HANDOFF.md)**: arquitectura, cuentas, estado y pasos pendientes en un solo lugar.

## Correr en desarrollo

```bash
npm install
npm run dev        # http://localhost:5173 (modo demo, vista móvil recomendada)
```

Para conectar el backend real, pega tu configuración en [src/config/firebase.js](src/config/firebase.js) (ver APPSTORE.md, paso 1). La app cambia sola de modo demo a Firebase.

## Estructura

```
src/
  config/        firebase.js · revenuecat.js (claves) · constants.js (radio, límites, defaults)
  services/      index.js (elige backend) · firebaseStore.js · localStore.js · push.js ·
                 subscription.js (Patitas Plus) · health.js (cartilla) · notifications.js · profile.js
  hooks/         useUserLocation.js (GPS con fallback a Lima) · usePlus.js
  utils/         geo.js · photo.js · qr.js (chapita vCard) · flyer.js (canvas A4) · share.js
  components/    UI (feed, mapa, detalle, paywall, cartilla, chapita QR, flyer…)
  data/          demoData.js (solo modo demo)
functions/       Cloud Functions: push a vecinos cercanos y al dueño
firestore.rules  Seguridad: solo el dueño edita; terceros solo agregan avistamientos
storage.rules    Fotos: escribe el dueño, lectura pública, máx. 2 MB
ios/             Proyecto Xcode generado (permisos, push e íconos ya configurados)
android/         Proyecto Android generado (permisos, firma CI e íconos adaptativos)
codemagic.yaml   CI: iOS → TestFlight y Android → Play Console
public/privacidad.html  Política de privacidad (servida en la app; hospedarla también en URL pública)
```

## Privacidad

Ninguna ubicación se publica exacta: todas pasan por `approx()` ([src/utils/geo.js](src/utils/geo.js)), que redondea a ~100 m. Nunca se muestra el domicilio del dueño. Sin cuentas ni contraseñas (identidad anónima). Detalle completo en [public/privacidad.html](public/privacidad.html).

## Cómo funciona la alerta

1. **SE PERDIÓ** → se guarda la zona aproximada + hora; Firestore propaga la alerta en vivo.
2. La **Cloud Function** notifica por push a los dispositivos registrados dentro de 2,5 km.
3. Cualquiera toca **¡LO VI AQUÍ!** y marca un pin: el rastro se dibuja cronológicamente y el dueño recibe una push por cada avistamiento.
4. El **radio de alerta** mostrado crece 40 m/min (desde 300 m hasta 2,5 km) mientras no aparezca.
5. **¡APARECIÓ!** cierra el caso con agradecimiento a quienes ayudaron.

## Futuro (estructura preparada, no construido)

Busca los comentarios `FUTURO:` en el código: chapita QR física para el collar, reputación/insignias, veterinarias asociadas, internacionalización (i18n — hoy la app está solo en español peruano; los precios ya se localizan solos vía StoreKit), y Play Store (`npx cap add android`).
