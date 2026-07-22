// FUTURO: internacionalización (i18n). Los textos de la UI están en español
// (Perú). Para abrir la app a otros mercados: extraer las cadenas a un
// diccionario por idioma (ej. react-i18next), detectar el locale del
// dispositivo y localizar también la ficha del App Store por país.
// Los precios NO necesitan i18n: StoreKit/RevenueCat ya los localizan.
import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { createStore } from './services';
import { initPush } from './services/push';
import { getProfile } from './services/profile';
import { initSubscription } from './services/subscription';
import { usePlus } from './hooks/usePlus';
import { useUserLocation } from './hooks/useUserLocation';
import { approx } from './utils/geo';
import { hapticAlert, hapticSuccess, hapticTap } from './utils/haptics';
import Icon from './components/Icons';
import PaywallModal from './components/PaywallModal';
import Onboarding from './components/Onboarding';
import ReportSheet from './components/ReportSheet';
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
  const [autoPlace, setAutoPlace] = useState(false);
  const [confirmLostId, setConfirmLostId] = useState(null);
  const [celebratingId, setCelebratingId] = useState(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try {
      return !localStorage.getItem('pp-onboarded');
    } catch {
      return false;
    }
  });
  const { location: userLocation, accuracy: userAccuracy } = useUserLocation();
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

  // Barra de estado (solo app nativa): transparente + iconos oscuros, para
  // que el fondo crema del header se vea detrás y todo combine. En web no hace
  // nada. Style.Light = texto/iconos oscuros sobre fondo claro.
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    (async () => {
      try {
        const { StatusBar, Style } = await import('@capacitor/status-bar');
        await StatusBar.setOverlaysWebView({ overlays: true });
        await StatusBar.setStyle({ style: Style.Light });
      } catch (err) {
        console.warn('StatusBar no disponible:', err);
      }
    })();
  }, []);

  // Reloj global: cronómetros y radio de alerta en expansión.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  async function run(action, okMsg) {
    try {
      await action();
      if (okMsg) setToast(okMsg);
    } catch (err) {
      console.error(err);
      setToast('No se pudo completar. Revisa tu conexión.');
    }
  }

  const enriched = pets.map((p) => ({
    ...p,
    own: p.ownerId === uid,
    sightings: (p.sightings ?? []).map((s) => ({
      ...s,
      reporterDisplay: s.reporterId === uid ? 'ti' : s.reporterName || 'un vecino',
    })),
  }));
  const lostPets = enriched.filter((p) => p.status === 'lost');
  const ownPets = enriched.filter((p) => p.own);
  const selected = enriched.find((p) => p.id === selectedId);
  const confirming = enriched.find((p) => p.id === confirmLostId);
  const celebrating = enriched.find((p) => p.id === celebratingId);

  function openDetail(id, { placing = false } = {}) {
    setAutoPlace(placing);
    setSelectedId(id);
  }

  function markLost(id) {
    // Privacidad: se publica la zona aproximada (~100 m), nunca el punto exacto.
    const zone = approx(userLocation.lat, userLocation.lng);
    hapticAlert();
    setConfirmLostId(null);
    openDetail(id);
    run(() => store.markLost(id, zone), 'Alerta enviada a los vecinos más cercanos.');
  }

  function addSighting(id, { lat, lng, note }) {
    const zone = approx(lat, lng);
    const reporterName = getProfile().name || 'Un vecino';
    hapticTap();
    run(
      () => store.addSighting(id, { ...zone, note, reporterId: uid, reporterName }),
      'Gracias, tu avistamiento ya está en el rastro.',
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
    }, `${data.name} ya tiene su perfil en la guardia.`);
  }

  // Flujos de la acción principal "Reportar".
  function reportLost(petId) {
    setReportOpen(false);
    setConfirmLostId(petId);
  }

  function reportSeen(petId) {
    setReportOpen(false);
    openDetail(petId, { placing: true });
  }

  function reportGoAddPet() {
    setReportOpen(false);
    setTab('mis');
  }

  if (!store) {
    return (
      <div className="app">
        <div className="boot">
          <Icon name="paw" size={52} />
          Cargando la guardia…
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <span className="brand-logo">
          <Icon name="paw" size={24} />
        </span>
        <div className="brand">
          <span className="brand-name">
            Patrulla <em>Patitas</em>
          </span>
          <span className="tagline">La comunidad que cuida a quienes no tienen voz</span>
        </div>
      </header>

      {store.mode === 'local' && (
        <div className="demo-banner">Modo demo con datos locales de ejemplo</div>
      )}

      <main>
        {tab === 'alertas' && (
          <AlertsFeed pets={lostPets} now={now} userLocation={userLocation} onOpen={openDetail} />
        )}
        {tab === 'mapa' && (
          <MapTab
            pets={lostPets}
            now={now}
            userLocation={userLocation}
            userAccuracy={userAccuracy}
            onOpen={openDetail}
            onReportSighting={(id) => openDetail(id, { placing: true })}
          />
        )}
        {tab === 'mis' && (
          <MyPets
            pets={enriched}
            now={now}
            isPlus={isPlus}
            canLink={store.mode === 'firebase'}
            onOpen={openDetail}
            onRequestLost={setConfirmLostId}
            onAddPet={addPet}
            onOpenPaywall={() => setShowPaywall(true)}
            onToast={setToast}
          />
        )}
      </main>

      <TabBar tab={tab} onTab={setTab} onReport={() => setReportOpen(true)} alertCount={lostPets.length} />

      {selected && (
        <PetDetail
          pet={selected}
          now={now}
          userLocation={userLocation}
          userAccuracy={userAccuracy}
          isPlus={isPlus}
          initialPlacing={autoPlace}
          onClose={() => {
            setSelectedId(null);
            setAutoPlace(false);
          }}
          onAddSighting={addSighting}
          onRequestLost={setConfirmLostId}
          onMarkFound={markFound}
          onOpenPaywall={() => setShowPaywall(true)}
        />
      )}

      {reportOpen && (
        <ReportSheet
          ownPets={ownPets}
          lostPets={lostPets}
          onLost={reportLost}
          onSeen={reportSeen}
          onGoAddPet={reportGoAddPet}
          onClose={() => setReportOpen(false)}
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

      {showPaywall && (
        <PaywallModal
          onClose={() => setShowPaywall(false)}
          onPurchased={() => setToast('Bienvenido a Patitas Plus.')}
        />
      )}

      {showOnboarding && <Onboarding onDone={finishOnboarding} />}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
