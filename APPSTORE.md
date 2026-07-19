# 🚀 Runbook: publicar Patrulla Patitas en el App Store (sin Mac)

El código ya está listo: app React empaquetada con Capacitor, proyecto iOS generado con permisos/íconos/push configurados, backend Firebase integrado y CI de Codemagic definido. Este documento cubre **lo que solo tú puedes hacer** porque requiere tus cuentas.

## Resumen de cuentas y costos

| Servicio | Costo | Para qué |
|---|---|---|
| Firebase (Google) | Gratis (plan Blaze: pago por uso, ~US$ 0 a bajo volumen) | Base de datos, fotos, notificaciones push |
| Apple Developer Program | US$ 99/año | Publicar en App Store |
| Codemagic | Capa gratuita (500 min/mes de macOS) | Compilar iOS sin Mac |
| GitHub (u otro Git) | Gratis | Codemagic necesita leer el repo |
| Hosting política de privacidad | Gratis (GitHub Pages / Netlify) | URL pública obligatoria |

## Valores a reemplazar en el repo (búscalos con "REEMPLAZAR" o "PEGA_")

| Archivo | Qué va ahí |
|---|---|
| `src/config/firebase.js` | Config web de tu proyecto Firebase (paso 1) |
| `ios/App/App/GoogleService-Info.plist` | Archivo real de Firebase iOS (paso 1); en CI lo inyecta la variable segura |
| `codemagic.yaml` → `APP_STORE_APPLE_ID` | Apple ID numérico de tu app (paso 3) |
| `src/config/constants.js` → `SUPPORT_EMAIL` y `public/privacidad.html` | Tu correo real de soporte |
| `src/config/revenuecat.js` | API key de RevenueCat para cobrar Patitas Plus (paso 3.5) — sin ella el paywall corre en modo prueba |

---

## Paso 1 — Firebase (~45 min)

1. Entra a <https://console.firebase.google.com> → **Agregar proyecto** (ej. `patrulla-patitas`). Analytics es opcional.
2. **Authentication** → Método de acceso → habilita **Anónimo**.
3. **Firestore Database** → Crear base de datos → modo producción → región `southamerica-east1` (São Paulo, la más cercana a Lima).
4. **Storage** → Comenzar (misma región).
5. **App web**: en la portada del proyecto, ícono `</>` → registra la app → copia el objeto `firebaseConfig` y pégalo en `src/config/firebase.js`. Con esto la app sale del modo demo automáticamente.
6. **App iOS**: agrega una app iOS con bundle ID exacto `com.patrullapatitas.app` → descarga `GoogleService-Info.plist`. Guárdalo: lo usarás en el paso 4 (no hace falta Mac).
7. **Push (APNs ↔ Firebase)** — hazlo después del paso 2:
   - En Apple Developer → Certificates, Identifiers & Profiles → **Keys** → crea una clave con "Apple Push Notifications service (APNs)" y descarga el `.p8` (guárdalo bien, solo se descarga una vez). Anota Key ID y Team ID.
   - En Firebase → Configuración del proyecto → **Cloud Messaging** → apps de Apple → sube el `.p8` con Key ID y Team ID.
7.5 **Vinculación de cuenta (recuperar mascotas al cambiar de teléfono)** — la app ofrece "Continuar con Google/Apple" en Mis mascotas:
   - **Google**: ✅ ya habilitado; el `GoogleService-Info.plist` con OAuth está en el repo y el `REVERSED_CLIENT_ID` registrado como URL Scheme en `Info.plist`.
   - **Apple**: Authentication → Sign-in method → habilita **Apple** (requiere la cuenta de Apple Developer). La capability "Sign in with Apple" ya está en `App.entitlements`; actívala también en el App ID del portal de Apple (Identifiers → tu App ID → Sign in with Apple).
   - Sin habilitarlos, los botones muestran un aviso amable y no rompen nada.

8. **Reglas y Cloud Functions** (desde esta PC, requiere el plan **Blaze**: Configuración → Uso y facturación → cambiar plan):
   ```bash
   npm install -g firebase-tools
   firebase login
   cd patrulla-patitas
   firebase use TU_PROJECT_ID
   firebase deploy --only firestore:rules,storage
   cd functions && npm install && cd ..
   firebase deploy --only functions
   ```
   Esto activa: alerta push a vecinos en un radio de 2,5 km cuando una mascota pasa a "perdida", y aviso al dueño con cada avistamiento.

**Prueba inmediata sin compilar nada**: con el paso 5 hecho, corre `npm run dev` — la app web ya usa Firestore real (sin banner de demo). Ábrela en dos navegadores distintos y verás las alertas sincronizarse en vivo.

## Paso 2 — Apple Developer Program (~1 día por la verificación)

1. Crea/usa un Apple ID y entra a <https://developer.apple.com/programs/enroll/>.
2. Inscríbete (US$ 99/año). Como individuo es más rápido; como empresa necesitas D-U-N-S.
3. Espera el correo de aprobación (horas a ~2 días).

## Paso 3 — App Store Connect: crear la ficha (~30 min)

1. Entra a <https://appstoreconnect.apple.com> → Mis apps → **+** → Nueva app.
2. Plataforma iOS · Nombre **Patrulla Patitas** (si está tomado: "Patrulla Patitas — Mascotas") · Idioma principal Español (Latinoamérica) · Bundle ID `com.patrullapatitas.app` (créalo ahí mismo si te lo pide) · SKU `patrulla-patitas-001`.
3. En **App Information** copia el **Apple ID numérico** → pégalo en `codemagic.yaml` (`APP_STORE_APPLE_ID`).
4. **Claves de API** (para que Codemagic firme y suba por ti): Users and Access → **Integrations** → App Store Connect API → genera una clave con rol **App Manager** → descarga el `.p8` y anota Key ID e Issuer ID.
5. **Suscripción Patitas Plus** (la app ya trae el paywall; sin esto corre en "modo prueba"):
   - En App Store Connect → tu app → **Suscripciones** → crea el grupo "Patitas Plus" con dos productos auto-renovables: `pp_plus_monthly` (S/ 9.90/mes) y `pp_plus_yearly` (S/ 79.90/año). Completa nombre, precio por territorio y descripción.
   - Crea cuenta gratis en <https://www.revenuecat.com> → agrega un proyecto con la app iOS (bundle `com.patrullapatitas.app`, conecta con tu App Store Connect API key) → en **Entitlements** crea uno llamado exactamente `plus` y vincúlale ambos productos → crea una **Offering** default con los dos paquetes (mensual y anual).
   - Copia la API key pública de iOS (empieza con `appl_`) y pégala en `src/config/revenuecat.js`. Listo: el paywall pasa de modo prueba a compras reales.
   - **Inscríbete en el App Store Small Business Program** (Users and Access → Agreements): baja la comisión de Apple del 30 % al 15 %.
   - Prueba con un **Sandbox tester** (Users and Access → Sandbox) antes de publicar.

## Paso 4 — Codemagic: compilar sin Mac (~30 min la primera vez)

1. Sube el repo a GitHub (privado está bien):
   ```bash
   cd patrulla-patitas
   git init
   git add .
   git commit -m "Patrulla Patitas v1.0"
   # crea el repo vacío en github.com y luego:
   git remote add origin https://github.com/TU_USUARIO/patrulla-patitas.git
   git push -u origin main
   ```
2. Crea cuenta en <https://codemagic.io> → Add application → conecta el repo. Codemagic detecta `codemagic.yaml` solo.
3. Teams → Personal Account → **Integrations** → Developer Portal / App Store Connect → sube la clave API del paso 3.4 y **nómbrala exactamente `patrulla-asc`** (o cambia ese nombre en `codemagic.yaml`).
4. ~~Variable `GOOGLE_SERVICE_INFO_PLIST`~~ — **ya no es necesaria**: el `GoogleService-Info.plist` real está commiteado en `ios/App/App/`. (La variable sigue soportada como override opcional si algún día prefieres sacarlo del repo.)
5. **Start new build** → workflow `ios-appstore`. El build compila, firma automáticamente (crea certificados y perfiles por ti) y sube el `.ipa` a TestFlight (~15–25 min).

## Paso 5 — TestFlight: probarla en tu iPhone (~1 día)

1. En App Store Connect → TestFlight, el build aparece "Processing" (10–60 min).
2. Responde la pregunta de cifrado si aparece (ya declaramos `ITSAppUsesNonExemptEncryption = false`, normalmente no pregunta).
3. Agrega tu correo como tester interno → instala la app **TestFlight** en tu iPhone → instala Patrulla Patitas.
4. Prueba el ciclo completo con dos celulares (o celular + web): crear mascota con foto → SE PERDIÓ → el otro dispositivo recibe la push y reporta avistamiento → el dueño recibe la push del avistamiento → APARECIÓ.
5. **Toma capturas aquí** para la ficha (se necesitan de 6.7" — iPhone 15 Pro Max o similar; si no tienes, la de 6.1" + escalado sirve para empezar).

## Paso 6 — Completar la ficha y enviar a revisión (~1 h + 1–3 días de espera)

1. **Capturas**: mínimo 3 (recomendado: feed de alertas, detalle con mapa y rastro, pantalla de final feliz).
2. **Textos sugeridos** (edítalos a gusto):
   - Subtítulo: "Guardia ciudadana de mascotas"
   - Descripción: "¿Se perdió tu mascota? Activa la alerta y los vecinos cercanos la reciben al instante. Cada avistamiento se marca en el mapa creando un rastro en tiempo real hasta encontrarla. Gratis, siempre. • Alerta con un botón: tu zona aproximada, nunca tu dirección exacta • Radio de búsqueda que se expande solo • Rastro de avistamientos en el mapa • Notificaciones de mascotas perdidas cerca de ti • Final feliz: cierra el caso y agradece a tu guardia"
   - Keywords: `mascotas,perdida,perro,gato,alerta,vecinos,rescate,encontrar,mapa,peru`
3. **App Privacy** (declara exactamente esto):
   - Ubicación → Ubicación aproximada → Funcionalidad de la app → NO vinculada a la identidad → NO usada para tracking.
   - Fotos o videos → Funcionalidad de la app → NO vinculada → NO tracking.
   - Información de contacto (nombre, teléfono — los ingresa el usuario voluntariamente) → Funcionalidad de la app → NO vinculada → NO tracking.
   - Historial de compras (suscripción Patitas Plus vía StoreKit/RevenueCat) → Funcionalidad de la app → NO vinculada → NO tracking.
   - "¿Usas datos para tracking?" → **No**.
4. **URL de política de privacidad**: publica `public/privacidad.html` en una URL pública. Lo más rápido: GitHub Pages del mismo repo (Settings → Pages → deploy from branch → la URL será `https://TU_USUARIO.github.io/patrulla-patitas/privacidad.html` sirviendo la carpeta `public/`… o crea un repo aparte solo con ese archivo). Netlify Drop también sirve (arrastras el archivo y listo).
5. **Age rating**: 4+. Categoría: Estilo de vida (secundaria: Utilidades).
6. **Notas para el revisor** (campo App Review Information — pega esto):
   > La app no requiere cuenta (usa autenticación anónima de Firebase). Para probarla: 1) pestaña "Mis mascotas" → "Agregar mascota" → crear un perfil, 2) pulsar "SE PERDIÓ" → se publica una alerta comunitaria con zona aproximada, 3) en la alerta, "¡LO VI AQUÍ!" permite marcar avistamientos en el mapa, 4) "¡APARECIÓ!" cierra el caso. El feed de alertas puede verse vacío si no hay mascotas perdidas reportadas cerca de la ubicación del revisor; es el estado esperado. El contenido generado por usuarios puede reportarse desde cada alerta ("Reportar contenido inapropiado").
7. Selecciona el build de TestFlight → **Submit for Review**. Apple suele responder en 24–72 h.

### Riesgos de revisión conocidos (ya mitigados, por si preguntan)

- **4.2 Funcionalidad mínima**: la app usa push nativo, GPS y cámara — no es "solo una web".
- **1.2 Contenido de usuarios**: hay canal de reporte por alerta (mailto) y las reglas impiden editar contenido ajeno. Si Apple exige más, la v1.1 puede agregar bloqueo de usuarios.
- **5.1.1 Privacidad**: los textos de permisos explican el uso; la política está en URL pública y dentro de la app (Mis mascotas → Política de privacidad).
- **Eliminación de cuenta**: no aplica — no hay cuentas; la política ofrece borrado de datos por correo.

## Paso 7 — Después del lanzamiento

- **Monitoreo**: consola de Firebase (uso de Firestore/errores de Functions) y App Store Connect (crashes, reseñas).
- **Play Store**: el proyecto Android ya está generado y el CI configurado — guía completa en [PLAYSTORE.md](PLAYSTORE.md).
- **Roadmap preparado en el código** (comentarios `FUTURO:`): chapita QR, insignias de reputación, flyer imprimible, veterinarias asociadas.
