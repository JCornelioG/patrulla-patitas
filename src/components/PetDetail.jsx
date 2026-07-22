import { useState } from 'react';
import PetAvatar from './PetAvatar';
import AlertMap from './AlertMap';
import SightingModal from './SightingModal';
import HealthPanel from './HealthPanel';
import QrPanel from './QrPanel';
import FlyerModal from './FlyerModal';
import PetFormModal from './PetFormModal';
import Icon from './Icons';
import { SUPPORT_EMAIL } from '../config/constants';
import { alertRadius, neighborsAlerted, formatDistance, formatElapsed, formatClock } from '../utils/geo';

export default function PetDetail({
  pet,
  now,
  userLocation,
  userAccuracy,
  isPlus,
  initialPlacing = false,
  onClose,
  onAddSighting,
  onRequestLost,
  onMarkFound,
  onUpdatePet,
  onDeletePet,
  onOpenPaywall,
}) {
  const [placing, setPlacing] = useState(initialPlacing && pet.status === 'lost');
  const [pending, setPending] = useState(null); // punto elegido en el mapa
  const [panel, setPanel] = useState(null); // {type:'salud',tab} | {type:'qr'}
  const [showFlyer, setShowFlyer] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const lost = pet.status === 'lost';
  const elapsed = lost ? now - pet.lostAt : 0;
  const radius = alertRadius(elapsed);
  const trail = [...pet.sightings].sort((a, b) => a.at - b.at);

  const plusOr = (fn) => (isPlus ? fn() : onOpenPaywall());

  return (
    <div className="detail">
      <div className="detail-top">
        <button className="btn-back" onClick={onClose} aria-label="Volver">
          <Icon name="back" size={20} />
        </button>
        <span className="detail-title">
          {lost && <Icon name="alert" size={17} />}
          {lost ? 'Alerta activa' : 'Perfil'}
        </span>
      </div>

      <div className="detail-scroll">
        <div className="detail-hero">
          <PetAvatar pet={pet} size="lg" />
          <div>
            <h2>{pet.name}</h2>
            <p className="meta" style={{ margin: '0 0 8px' }}>
              {pet.species} · {pet.breed}
            </p>
            {lost ? (
              <span className="status-chip st-lost">
                Perdid{pet.pronoun} hace {formatElapsed(elapsed)}
              </span>
            ) : (
              <span className="status-chip st-home">
                <Icon name="home" size={13} />
                En casa
              </span>
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
            <a className="btn btn-secondary" href={`tel:${pet.ownerPhone.replace(/\s/g, '')}`}>
              <Icon name="phone" size={16} />
              Llamar
            </a>
          )}
        </div>

        {lost && (
          <>
            <div className="card radius-card">
              <span className="icon-chip">
                <Icon name="zone" size={22} />
              </span>
              <div>
                <strong>Radio de alerta: {formatDistance(radius)}</strong>
                <span>
                  ~{neighborsAlerted(radius)} vecinos alertados · se expande solo mientras no
                  aparezca
                </span>
              </div>
            </div>

            <AlertMap
              key={pet.id}
              pets={[pet]}
              focus={pet}
              now={now}
              userLocation={userLocation}
              userAccuracy={userAccuracy}
              placing={placing}
              onPlace={(latlng) => setPending(latlng)}
              height={300}
            />
            <p className="privacy-note">
              <Icon name="shield" size={15} />
              Por privacidad mostramos zonas aproximadas, nunca direcciones exactas.
            </p>

            {placing ? (
              <button
                className="btn btn-secondary btn-big"
                onClick={() => {
                  setPlacing(false);
                  setPending(null);
                }}
              >
                Cancelar reporte
              </button>
            ) : (
              <button className="btn btn-primary btn-big" onClick={() => setPlacing(true)}>
                <Icon name="eye" size={18} />
                Lo vi aquí
              </button>
            )}

            <section className="sightings">
              <h3>Rastro de avistamientos</h3>
              {trail.length === 0 && (
                <p className="meta">Todavía no hay avistamientos. Comparte la alerta con el barrio.</p>
              )}
              {[...trail].reverse().map((s, i) => (
                <div className="sight-row" key={s.id}>
                  <span className={`sight-num${i === 0 ? ' latest' : ''}`}>{trail.length - i}</span>
                  <div>
                    <strong>{formatClock(s.at)}</strong>{' '}
                    <span className="time-note">· hace {formatElapsed(now - s.at)}</span>
                    {s.note && <p>{s.note}</p>}
                    <span className="meta">Reportado por {s.reporterDisplay}</span>
                  </div>
                </div>
              ))}
            </section>

            {/* El flyer es GRATIS para toda mascota perdida: es rescate.
                Con Plus incluye además el QR de contacto. */}
            <button className="btn btn-secondary btn-big" onClick={() => setShowFlyer(true)}>
              <Icon name="file" size={17} />
              Generar flyer de búsqueda
            </button>

            {pet.own && (
              <button className="btn btn-success btn-big" onClick={() => onMarkFound(pet.id)}>
                <Icon name="home" size={18} />
                Ya apareció
              </button>
            )}

            {/* FUTURO: reenviar la alerta a veterinarias asociadas de la zona. */}
          </>
        )}

        {!lost && pet.own && (
          <button className="btn btn-primary btn-big" onClick={() => onRequestLost(pet.id)}>
            <Icon name="alert" size={18} />
            Se perdió
          </button>
        )}

        {pet.own && (
          <section className="pet-management">
            <h3>Administrar mascota</h3>
            <button className="btn btn-secondary btn-big" onClick={() => setEditing(true)}>
              <Icon name="edit" size={17} />
              Editar información
            </button>
            <button className="btn btn-danger-ghost btn-big" onClick={() => setConfirmDelete(true)}>
              <Icon name="trash" size={17} />
              Eliminar mascota
            </button>
          </section>
        )}

        {pet.own && (
          <section className="care">
            <h3>
              Cuidados
              <span className="status-chip st-seen">Plus</span>
            </h3>
            <div className="care-grid">
              <button
                className="care-tile"
                onClick={() => plusOr(() => setPanel({ type: 'salud', tab: 'registros' }))}
              >
                <Icon name="health" size={24} />
                Cartilla sanitaria
                {!isPlus && (
                  <span className="lock">
                    <Icon name="sparkle" size={13} />
                  </span>
                )}
              </button>
              <button
                className="care-tile"
                onClick={() => plusOr(() => setPanel({ type: 'salud', tab: 'recordatorios' }))}
              >
                <Icon name="bellRing" size={24} />
                Recordatorios
                {!isPlus && (
                  <span className="lock">
                    <Icon name="sparkle" size={13} />
                  </span>
                )}
              </button>
              <button className="care-tile" onClick={() => plusOr(() => setPanel({ type: 'qr' }))}>
                <Icon name="qr" size={24} />
                Chapita QR
                {!isPlus && (
                  <span className="lock">
                    <Icon name="sparkle" size={13} />
                  </span>
                )}
              </button>
            </div>
          </section>
        )}

        {/* Requisito de contenido generado por usuarios (App Store 1.2). */}
        {!pet.own && (
          <p className="privacy-note center" style={{ marginTop: 24 }}>
            <a href={`mailto:${SUPPORT_EMAIL}?subject=Reporte de contenido: ${pet.id}`}>
              Reportar contenido inapropiado
            </a>
          </p>
        )}

        {/* FUTURO: chapita QR: quien escanee el collar llega a este perfil. */}
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
      {editing && (
        <PetFormModal
          pet={pet}
          onCancel={() => setEditing(false)}
          onSave={async (data) => {
            const saved = await onUpdatePet(pet.id, data);
            if (saved) setEditing(false);
            return saved;
          }}
        />
      )}
      {confirmDelete && (
        <div className="overlay" onClick={() => !deleting && setConfirmDelete(false)}>
          <div
            className="modal confirm-modal"
            onClick={(event) => event.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-pet-title"
          >
            <div className="sheet-grip" />
            <span className="confirm-icon danger">
              <Icon name="trash" size={24} />
            </span>
            <h3 id="delete-pet-title">¿Eliminar a {pet.name}?</h3>
            <p>
              Esta acción elimina su perfil, foto y datos guardados, y no se puede deshacer.
              {lost && ' Su alerta activa también dejará de mostrarse a la comunidad.'}
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                className="btn btn-danger"
                disabled={deleting}
                onClick={async () => {
                  setDeleting(true);
                  const deleted = await onDeletePet(pet);
                  if (!deleted) setDeleting(false);
                }}
              >
                {deleting ? 'Eliminando…' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
