import { useState } from 'react';
import PetAvatar from './PetAvatar';
import AlertMap from './AlertMap';
import SightingModal from './SightingModal';
import HealthPanel from './HealthPanel';
import QrPanel from './QrPanel';
import FlyerModal from './FlyerModal';
import { SUPPORT_EMAIL } from '../config/constants';
import { alertRadius, neighborsAlerted, formatDistance, formatElapsed, formatClock } from '../utils/geo';

export default function PetDetail({
  pet,
  now,
  userLocation,
  isPlus,
  onClose,
  onAddSighting,
  onRequestLost,
  onMarkFound,
  onOpenPaywall,
}) {
  const [placing, setPlacing] = useState(false);
  const [pending, setPending] = useState(null); // punto elegido en el mapa
  const [panel, setPanel] = useState(null); // {type:'salud',tab} | {type:'qr'}
  const [showFlyer, setShowFlyer] = useState(false);

  // Las funciones Plus abren el paywall si no hay suscripción activa.
  const plusOr = (fn) => (isPlus ? fn() : onOpenPaywall());

  const lost = pet.status === 'lost';
  const elapsed = lost ? now - pet.lostAt : 0;
  const radius = alertRadius(elapsed);
  const trail = [...pet.sightings].sort((a, b) => a.at - b.at);

  return (
    <div className="detail">
      <div className="detail-top">
        <button className="btn-back" onClick={onClose} aria-label="Volver">
          ←
        </button>
        <span className="detail-title">{lost ? '🚨 Alerta activa' : 'Perfil'}</span>
      </div>

      <div className="detail-scroll">
        <div className="detail-hero">
          <PetAvatar pet={pet} size={92} />
          <div>
            <h2>{pet.name}</h2>
            <p className="muted" style={{ margin: '0 0 6px' }}>
              {pet.species} · {pet.breed}
            </p>
            {lost ? (
              <span className="chip chip-lost">
                Perdid{pet.pronoun} hace {formatElapsed(elapsed)}
              </span>
            ) : (
              <span className="chip chip-home">😊 En casa</span>
            )}
          </div>
        </div>

        <div className="info-grid">
          <div>
            <span className="label">Color</span>
            {pet.color}
          </div>
          <div>
            <span className="label">Tamaño</span>
            {pet.size}
          </div>
          <div>
            <span className="label">Especie</span>
            {pet.species}
          </div>
        </div>

        <p className="desc">{pet.description}</p>

        <div className="card contact-card">
          <div>
            <span className="label">Contacto</span>
            <strong>{pet.ownerName}</strong>
          </div>
          {pet.ownerPhone && (
            <a className="btn btn-ghost" href={`tel:${pet.ownerPhone.replace(/\s/g, '')}`}>
              📞 Llamar
            </a>
          )}
        </div>

        {lost && (
          <>
            <div className="card radius-card">
              <strong>📡 Radio de alerta: {formatDistance(radius)}</strong>
              <span className="muted small">
                ~{neighborsAlerted(radius)} vecinos alertados · el radio se expande solo mientras no aparezca
              </span>
            </div>

            <AlertMap
              key={pet.id}
              pets={[pet]}
              focus={pet}
              now={now}
              userLocation={userLocation}
              placing={placing}
              onPlace={(latlng) => setPending(latlng)}
              height={300}
            />
            <p className="privacy-note">🔒 Por privacidad mostramos zonas aproximadas, nunca direcciones exactas.</p>

            {placing ? (
              <button
                className="btn btn-ghost btn-big"
                onClick={() => {
                  setPlacing(false);
                  setPending(null);
                }}
              >
                Cancelar reporte
              </button>
            ) : (
              <button className="btn btn-primary btn-big" onClick={() => setPlacing(true)}>
                👀 ¡LO VI AQUÍ!
              </button>
            )}

            <section className="sightings">
              <h3>Rastro de avistamientos</h3>
              {trail.length === 0 && (
                <p className="muted">Todavía no hay avistamientos. Comparte la alerta con el barrio 🙏</p>
              )}
              {[...trail].reverse().map((s, i) => (
                <div className="sight-row" key={s.id}>
                  <span className={`sight-num${i === 0 ? ' latest' : ''}`}>{trail.length - i}</span>
                  <div>
                    <strong>{formatClock(s.at)}</strong> · hace {formatElapsed(now - s.at)}
                    {s.note && <p>{s.note}</p>}
                    <span className="muted small">Reportado por {s.reporterDisplay}</span>
                  </div>
                </div>
              ))}
            </section>

            {/* El flyer es GRATIS para toda mascota perdida: es rescate.
                Con Plus incluye además el QR de contacto. */}
            <button className="btn btn-ghost btn-big" onClick={() => setShowFlyer(true)}>
              📄 Generar flyer de búsqueda
            </button>

            {pet.own && (
              <button className="btn btn-green btn-big" onClick={() => onMarkFound(pet.id)}>
                🏠 ¡APARECIÓ!
              </button>
            )}

            {/* FUTURO: reenviar la alerta a veterinarias asociadas de la zona. */}
          </>
        )}

        {!lost && pet.own && (
          <button className="btn btn-danger btn-big" onClick={() => onRequestLost(pet.id)}>
            🚨 SE PERDIÓ
          </button>
        )}

        {pet.own && (
          <section className="care">
            <h3>
              Cuidados <span className="plus-badge">PLUS</span>
            </h3>
            <div className="care-grid">
              <button
                className="care-tile"
                onClick={() => plusOr(() => setPanel({ type: 'salud', tab: 'registros' }))}
              >
                <span className="care-icon">🩺</span>
                Cartilla sanitaria
                {!isPlus && <span className="lock">🔒</span>}
              </button>
              <button
                className="care-tile"
                onClick={() => plusOr(() => setPanel({ type: 'salud', tab: 'recordatorios' }))}
              >
                <span className="care-icon">⏰</span>
                Recordatorios
                {!isPlus && <span className="lock">🔒</span>}
              </button>
              <button className="care-tile" onClick={() => plusOr(() => setPanel({ type: 'qr' }))}>
                <span className="care-icon">🔖</span>
                Chapita QR
                {!isPlus && <span className="lock">🔒</span>}
              </button>
            </div>
          </section>
        )}

        {/* Requisito de contenido generado por usuarios (App Store 1.2):
            canal simple para reportar contenido inapropiado. */}
        {!pet.own && (
          <p className="privacy-note center">
            <a href={`mailto:${SUPPORT_EMAIL}?subject=Reporte de contenido: ${pet.id}`}>
              📣 Reportar contenido inapropiado
            </a>
          </p>
        )}

        {/* FUTURO: chapita QR — quien escanee el collar llega a este perfil. */}
      </div>

      {pending && (
        <SightingModal
          pet={pet}
          onCancel={() => setPending(null)}
          onConfirm={(note) => {
            onAddSighting(pet.id, { ...pending, note });
            setPending(null);
            setPlacing(false);
          }}
        />
      )}

      {panel?.type === 'salud' && (
        <HealthPanel pet={pet} initialTab={panel.tab} onClose={() => setPanel(null)} />
      )}
      {panel?.type === 'qr' && <QrPanel pet={pet} onClose={() => setPanel(null)} />}
      {showFlyer && (
        <FlyerModal
          pet={pet}
          isPlus={isPlus}
          onOpenPaywall={onOpenPaywall}
          onClose={() => setShowFlyer(false)}
        />
      )}
    </div>
  );
}
