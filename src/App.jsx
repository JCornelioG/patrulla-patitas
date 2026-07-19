// FUTURO: internacionalización (i18n). Los textos de la UI están en español
// (Perú). Para abrir la app a otros mercados: extraer las cadenas a un
// diccionario por idioma (ej. react-i18next), detectar el locale del
// dispositivo y localizar también la ficha del App Store por país.
// Los precios NO necesitan i18n: StoreKit/RevenueCat ya los localizan.
import { useEffect, useState } from 'react';
import { createStore } from './services';
import { initPush } from './services/push';
import { getProfile } from './services/profile';
import { initSubscription } from './services/subscription';
import { usePlus } from './hooks/usePlus';
import { useUserLocation } from './hooks/useUserLocation';
import { approx } from './utils/geo';
import { hapticAlert, hapticSuccess, hapticTap } from './utils/haptics';
import PaywallModal from './components/PaywallModal';
import Onboarding from './components/Onboarding';
import TabBar from './components/TabBar';
import AlertsFeed from './components/AlertsFeed';
import MapTab from './components/MapTab';
import MyPets from './components/MyPets';
import PetDetail from './components/PetDetail';
import LostConfirmModal from './components/LostConfirmModal';
import FoundCelebration from './components/FoundCelebration';

export default function App() {
  const [store, setStore] = useState(null);
  const [pets, setPets] = useState([]);
  const [uid, setUid] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [tab, setTab] = useState('alertas');
  const [selectedId, setSelectedId] = useState(null);
  const [confirmLostId, setConfirmLostId] = useState(null);
  const [celebratingId, setCelebratingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try {
      return !localStorage.getItem('pp-onboarded');
    } catch {
      return false;
    }
  });
  const { location: userLocation } = useUserLocation();
  const isPlus = usePlus();

  function finishOnboarding() {
    try {
      localStorage.setItem('pp-onboarded', '1');
    } catch {
      /* sin persistencia igual seguimos */
    }
    setShowOnboarding(false);
  }

  // Arranque: capa de datos (Firebase o demo local) + suscripción en vivo.
  useEffect(() => {
    let unsub = null;
    let alive = true;
    (async () => {
      const s = await createStore();
      await s.init();
      if (!alive) return;
      setUid(s.uid);
      setStore(s);
      unsub = s.subscribePets(setPets);
    })();
    return () => {
      alive = false;
      unsub?.();
    };
  }, []);

  // Registro de push (solo app nativa + Firebase; en web no hace nada).
  useEffect(() => {
    if (store) initPush(store, userLocation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store]);

  // Estado de la suscripción Patitas Plus (RevenueCat o modo prueba).
  useEffect(() => {
    initSubscription();
  }, []);

  // Reloj global: alimenta cronómetros y el radio de alerta en expansión.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  // Toda operación de datos pasa por acá: éxito → toast, fallo → aviso.
  async function run(action, okMsg) {
    try {
      await action();
      if (okMsg) setToast(okMsg);
    } catch (err) {
      console.error(err);
      setToast('⚠️ No se pudo completar. Revisa tu conexión.');
    }
  }

  // Enriquecemos los datos crudos con lo que la UI necesita saber:
  // propiedad (own) y cómo mostrar a quien reportó cada avistamiento.
  const enriched = pets.map((p) => ({
    ...p,
    own: p.ownerId === uid,
    sightings: (p.sightings ?? []).map((s) => ({
      ...s,
      reporterDisplay: s.reporterId === uid ? 'ti' : s.reporterName || 'un vecino',
    })),
  }));
  const lostPets = enriched.filter((p) => p.status === 'lost');
  const selected = enriched.find((p) => p.id === selectedId);
  const confirming = enriched.find((p) => p.id === confirmLostId);
  const celebrating = enriched.find((p) => p.id === celebratingId);

  function markLost(id) {
    // Privacidad: se publica la zona aproximada (~100 m), nunca el punto exacto.
    const zone = approx(userLocation.lat, userLocation.lng);
    hapticAlert();
    setConfirmLostId(null);
    setSelectedId(id);
    run(() => store.markLost(id, zone), '🚨 Alerta enviada a los vecinos más cercanos');
  }

  function addSighting(id, { lat, lng, note }) {
    const zone = approx(lat, lng);
    const reporterName = getProfile().name || 'Un vecino';
    hapticTap();
    run(
      () => store.addSighting(id, { ...zone, note, reporterId: uid, reporterName }),
      '💛 ¡Gracias! Tu avistamiento ya está en el rastro',
    );
  }

  function markFound(id) {
    hapticSuccess();
    setCelebratingId(id);
    run(() => store.markFound(id));
  }

  function closeCase(id) {
    setCelebratingId(null);
    setSelectedId(null);
    run(() => store.closeCase(id));
  }

  function addPet({ photoDataUrl, ...data }) {
    run(async () => {
      const photoUrl = photoDataUrl ? await store.uploadPhoto(photoDataUrl) : null;
      await store.addPet({ ...data, photoUrl });
    }, `🐾 ${data.name} ya tiene su perfil en la guardia`);
  }

  if (!store) {
    return (
      <div className="app">
        <div className="boot">
          <span className="boot-paw">🐾</span>
          Cargando la guardia…
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <span className="brand-logo">🐾</span>
          <span>
            Patrulla <em>Patitas</em>
          </span>
        </div>
        <span className="tagline">La guardia ciudadana de mascotas · siempre gratis 💛</span>
      </header>

      {store.mode === 'local' && (
        <div className="demo-banner">
          Modo demo con datos locales de ejemplo · configura Firebase para activar las alertas reales
        </div>
      )}

      <main>
        {tab === 'alertas' && (
          <AlertsFeed pets={lostPets} now={now} userLocation={userLocation} onOpen={setSelectedId} />
        )}
        {tab === 'mapa' && (
          <MapTab pets={lostPets} now={now} userLocation={userLocation} onOpen={setSelectedId} />
        )}
        {tab === 'mis' && (
          <MyPets
            pets={enriched}
            now={now}
            isPlus={isPlus}
            canLink={store.mode === 'firebase'}
            onOpen={setSelectedId}
            onRequestLost={setConfirmLostId}
            onAddPet={addPet}
            onOpenPaywall={() => setShowPaywall(true)}
            onToast={setToast}
          />
        )}
      </main>

      <TabBar tab={tab} onTab={setTab} alertCount={lostPets.length} />

      {selected && (
        <PetDetail
          pet={selected}
          now={now}
          userLocation={userLocation}
          isPlus={isPlus}
          onClose={() => setSelectedId(null)}
          onAddSighting={addSighting}
          onRequestLost={setConfirmLostId}
          onMarkFound={markFound}
          onOpenPaywall={() => setShowPaywall(true)}
        />
      )}

      {showPaywall && (
        <PaywallModal
          onClose={() => setShowPaywall(false)}
          onPurchased={() => setToast('✨ ¡Bienvenido a Patitas Plus!')}
        />
      )}

      {confirming && (
        <LostConfirmModal
          pet={confirming}
          onCancel={() => setConfirmLostId(null)}
          onConfirm={() => markLost(confirming.id)}
        />
      )}

      {celebrating && <FoundCelebration pet={celebrating} onClose={() => closeCase(celebrating.id)} />}

      {showOnboarding && <Onboarding onDone={finishOnboarding} />}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
