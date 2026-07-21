# 📖 Bitácora de decisiones · Patrulla Patitas

Registro cronológico de cómo se construyó el proyecto y **por qué** se tomó cada
decisión. Complementa a `HANDOFF.md` (que describe el estado actual): esto explica
el razonamiento detrás, que es lo que no se deduce leyendo solo el código.

> Cubre el desarrollo de julio de 2026. Agrega entradas nuevas arriba de la
> sección "Decisiones de fondo" a medida que el proyecto avance.

---

## Línea de tiempo

### Fase 1 — Prototipo jugable
- Se construyó la app como web React + Vite + Leaflet con datos en memoria.
- MVP completo: perfil de mascota, botón PERDIDO con cronómetro, feed + mapa de
  alertas, reporte de avistamientos con rastro cronológico, radio de alerta que
  se expande con el tiempo, y estado ENCONTRADO con "final feliz".

### Fase 2 — Localización a Perú
- Se cambió el español rioplatense (voseo) por español peruano/neutro (tuteo).
- La ubicación simulada pasó de Montevideo a **Lima** (Parque Kennedy, Miraflores).
  Los datos de ejemplo se ubicaron en Miraflores/Barranco/San Isidro.

### Fase 3 — Producto publicable
- **Capa de datos intercambiable:** `services/index.js` elige entre `firebaseStore`
  (producción) y `localStore` (demo) según si Firebase está configurado. Permite
  desarrollar sin backend y no acopla la UI a Firebase.
- Backend Firebase: Firestore (tiempo real), Storage (fotos), Auth anónima (sin
  cuentas), Cloud Messaging + una Cloud Function `notificarCambios` para el push.
- GPS real, fotos por cámara/galería con compresión, reglas de seguridad.
- Proyecto **iOS** generado con Capacitor; CI en **Codemagic** para compilar sin Mac.

### Fase 4 — Monetización "Patitas Plus"
- Suscripción con RevenueCat sobre StoreKit/Play Billing. Paquete: cartilla
  sanitaria, recordatorios, chapita QR, flyer con QR y mascotas ilimitadas.
- **Regla de oro:** el rescate (alertas, mapa, avistamientos, flyer básico) jamás
  se cobra. Plus solo vende prevención y conveniencia. Esto además protege de
  rechazos de tienda por poner funciones de emergencia tras un paywall.

### Fase 5 — Android
- Proyecto `android/` generado; workflow `android-playstore` en Codemagic.
- Keys de RevenueCat por plataforma (`appl_` / `goog_`), elegidas según el SO.

### Fase 6 — Firebase en producción
- El dueño creó el proyecto Firebase real, activó Blaze, Auth anónima, Firestore
  (región `southamerica-east1`) y Storage. Se pegó la config y se desplegaron
  reglas + Cloud Function. Sincronización en tiempo real verificada entre sesiones.

### Fase 7 — Publicación y CI real
- Repo subido a **GitHub** (`JCornelioG/patrulla-patitas`, privado).
- Cuenta de **Google Play** pagada (personal, país Canadá según perfil de pagos).
- Codemagic conectado; se generó el **keystore** y se compiló el **primer AAB
  firmado**. Los tropiezos del pipeline (instancia de pago, Node 20→22, permiso de
  gradlew, Java 17→21, parseo del versionCode) quedaron resueltos en el yaml.
- Web publicada en **Firebase Hosting** (patrulla-patitas.web.app) → link para
  compartir y política de privacidad en URL pública (requisito de tiendas).

### Fase 8 — Extras de producto
- Onboarding de primera apertura, vibración háptica nativa, y vinculación de la
  cuenta anónima con Apple/Google para recuperar mascotas al cambiar de teléfono.

### Fase 9 — Rediseño con sistema de diseño
- Se reemplazó el look "hecho por IA" por un sistema formal: tokens de color,
  tipografía **Manrope**, espaciado x4, radios diferenciados, una sola sombra.
- **Se eliminaron TODOS los emojis** como iconografía → sistema de iconos SVG
  propio (`components/Icons.jsx`).
- Navegación con **"Reportar"** como acción principal (FAB central + hoja de flujos).
- Se rediseñaron Alertas, Mapa (marcadores con miniatura + card inferior) y Mis
  mascotas (valor primero, monetización secundaria).

---

### Fase 10 — Mapa de servicios (v1.1)
- Se agregó una segunda capa a la pestaña Mapa (toggle "Alertas / Servicios")
  con lugares de servicio para mascotas: veterinarias, albergues, guarderías,
  pet shops y peluquerías.
- **Fuente de datos:** OpenStreetMap vía la **Overpass API** (gratis, sin API key),
  coherente con los tiles de OSM ya usados. Consulta por zona con caché de 7 días.
- Cada lugar: nombre, categoría, distancia, "Llamar" (si OSM tiene teléfono) y
  "Cómo llegar" (deep link a Google Maps). Verificado con ~80 lugares reales en Lima.
- **Encuadre de producto:** no es un directorio genérico (eso lo hace Google Maps);
  se ata a la misión (¿a dónde llevo un animal encontrado/herido?). Los albergues
  conectan con el flujo de "vi una mascota perdida".
- Limitación conocida: cobertura OSM irregular fuera de veterinarias → la capa
  comunitaria (que los usuarios agreguen lugares) es la fase 2.

## Decisiones de fondo (el "por qué")

- **¿Por qué Capacitor y no React Native?** Reutiliza el mismo código web para las
  tres plataformas con mínima fricción; la app no necesita rendimiento nativo extremo.
- **¿Por qué Firebase?** Datos en tiempo real + fotos + push + auth en un solo
  servicio con capa gratuita amplia; la seguridad la dan las reglas, no el cliente.
- **¿Por qué auth anónima y no registro?** La app debe usarse rápido y bajo estrés;
  pedir cuenta sería fricción. La vinculación Apple/Google es opcional y solo sirve
  para recuperar datos al cambiar de teléfono.
- **¿Por qué Codemagic?** El dueño no tiene Mac; Codemagic compila iOS y Android en
  la nube y publica a las tiendas. La capa gratuita alcanza de sobra.
- **¿Por qué los precios en soles no rompen a usuarios de otros países?** StoreKit y
  Play localizan el precio automáticamente por región; el código muestra el precio
  que da la tienda. Los "S/" fijos solo existen en el modo de prueba.
- **¿Por qué la cartilla sanitaria vive solo en el dispositivo?** Es información
  privada; a diferencia de las alertas (públicas por diseño), no se sube a Firestore.
- **Región `southamerica-east1` (São Paulo):** la más cercana a Perú; no se puede
  cambiar después de crear Firestore.

## Deliberadamente pospuesto (marcado como `FUTURO:` en el código)

- Chapita QR física grabada con envío (bien físico → se cobra fuera del IAP).
- Reputación e insignias para vecinos que ayudan seguido.
- Veterinarias asociadas que reciben alertas de su zona (tier B2B: insignia
  verificada + alertas de mascotas perdidas cercanas + destacado). El mapa de
  servicios de la Fase 10 es la base sobre la que se construye.
- Capa comunitaria del mapa de servicios: que los usuarios agreguen/reporten
  lugares (Firestore + moderación), para cubrir lo que falta en OpenStreetMap.
- Filtro "abierto ahora" en el mapa de servicios: requiere un parser de
  `opening_hours` de OSM (librería dedicada). Se pospuso para no mostrar horarios
  incorrectos en un contexto de emergencia; por ahora se muestra el horario tal cual.
- Agrupación de marcadores (clustering) en el mapa: hoy la densidad de alertas no
  lo justifica; agregaría una dependencia sin beneficio visible.
- Internacionalización (i18n): la app está solo en español peruano.
- Respaldo en la nube de la cartilla sanitaria (subcolección privada por dueño).

## Riesgos conocidos / puntos de atención

- **Keystore de Android = punto único de fallo.** Sin él (y su contraseña) no se
  puede actualizar la app en Play. Debe respaldarse fuera de la PC y de Codemagic.
- **Identidad anónima ligada al dispositivo:** si el usuario borra datos o reinstala
  sin haber vinculado Apple/Google, pierde acceso a sus mascotas (quedan huérfanas).
  Por eso existe la vinculación de cuenta; conviene promoverla.
- **Cuenta personal nueva de Play:** exige una prueba cerrada con 12+ testers durante
  14 días continuos antes de poder publicar en producción.
