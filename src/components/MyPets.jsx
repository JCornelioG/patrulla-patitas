import { useState } from 'react';
import PetAvatar from './PetAvatar';
import PetFormModal from './PetFormModal';
import AccountCard from './AccountCard';
import Icon from './Icons';
import { FREE_PET_LIMIT } from '../config/constants';
import { formatElapsed } from '../utils/geo';

// Mis mascotas: primero el valor de registrar (estado vacío con ilustración
// propia), después la lista; la protección de cuenta y Patitas Plus son
// secciones secundarias que no compiten con la acción principal.
export default function MyPets({
  pets,
  now,
  isPlus,
  canLink,
  onOpen,
  onRequestLost,
  onAddPet,
  onOpenPaywall,
  onToast,
}) {
  const [adding, setAdding] = useState(false);
  const own = pets.filter((p) => p.own);
  const atLimit = !isPlus && own.length >= FREE_PET_LIMIT;

  return (
    <div className="screen">
      <div className="screen-head">
        <h2>Mis mascotas</h2>
        <p className="screen-sub">
          Regístralas para crear alertas más rápido y ayudarlas a volver a casa.
        </p>
      </div>

      {own.length === 0 ? (
        <div className="value-hero">
          <div className="value-illu">
            <Icon name="paw" size={30} className="deco-paw" style={undefined} />
            <Icon name="dog" size={54} />
            <Icon name="cat" size={44} />
          </div>
          <h3>Su perfil es su boleto de vuelta</h3>
          <p>Un minuto hoy puede ahorrar horas de angustia mañana.</p>

          <div className="value-rows">
            <div className="value-row">
              <span className="icon-chip">
                <Icon name="camera" size={20} />
              </span>
              <div>
                <strong>Guarda su foto y sus señas</strong>
                <span>Así todos podrán reconocerla al instante.</span>
              </div>
            </div>
            <div className="value-row">
              <span className="icon-chip">
                <Icon name="bell" size={20} />
              </span>
              <div>
                <strong>Crea alertas en segundos</strong>
                <span>Si se pierde, publicas su desaparición con un toque.</span>
              </div>
            </div>
            <div className="value-row">
              <span className="icon-chip">
                <Icon name="eye" size={20} />
              </span>
              <div>
                <strong>Más ojos, más posibilidades</strong>
                <span>La comunidad cercana te ayuda a encontrarla.</span>
              </div>
            </div>
          </div>

          <button className="btn btn-primary btn-big" onClick={() => setAdding(true)}>
            <Icon name="plus" size={18} />
            Agregar mi primera mascota
          </button>
        </div>
      ) : (
        <>
          {own.map((pet) => (
            <div className="card mypet-card" key={pet.id}>
              <div className="mypet-top" onClick={() => onOpen(pet.id)}>
                <PetAvatar pet={pet} />
                <div className="mypet-info">
                  <strong>{pet.name}</strong>
                  <span className="meta">
                    {pet.species} · {pet.breed}
                  </span>
                  {pet.status === 'lost' ? (
                    <span className="status-chip st-lost">
                      Perdid{pet.pronoun} hace {formatElapsed(now - pet.lostAt)}
                    </span>
                  ) : (
                    <span className="status-chip st-home">
                      <Icon name="home" size={13} />
                      En casa
                    </span>
                  )}
                </div>
                <Icon name="chevronRight" size={18} />
              </div>

              {pet.status === 'lost' ? (
                <button className="btn btn-secondary btn-big" onClick={() => onOpen(pet.id)}>
                  <Icon name="map" size={17} />
                  Ver alerta y rastro
                </button>
              ) : (
                <button className="btn btn-primary btn-big" onClick={() => onRequestLost(pet.id)}>
                  <Icon name="alert" size={17} />
                  Se perdió
                </button>
              )}
            </div>
          ))}

          <button className="add-pet" onClick={() => (atLimit ? onOpenPaywall() : setAdding(true))}>
            <Icon name="plus" size={18} />
            Agregar mascota
            {atLimit && <span className="meta">· plan gratis: hasta {FREE_PET_LIMIT}</span>}
          </button>
        </>
      )}

      {/* Secundario: protección de cuenta (solo con mascotas registradas) */}
      {canLink && own.length > 0 && <AccountCard onToast={onToast} />}

      {/* Secundario: Patitas Plus, sin competir con la acción principal */}
      {isPlus ? (
        <div className="account-row">
          <span className="icon-chip" style={{ background: 'var(--color-success-soft)', color: 'var(--color-success-text)' }}>
            <Icon name="sparkle" size={20} />
          </span>
          <div className="account-row-body">
            <strong>Patitas Plus activo</strong>
            <span>Gracias por apoyar a la guardia.</span>
          </div>
        </div>
      ) : (
        <button className="plus-row" onClick={onOpenPaywall}>
          <span className="icon-chip">
            <Icon name="sparkle" size={20} />
          </span>
          <div className="account-row-body">
            <strong>Patitas Plus</strong>
            <span>Cartilla sanitaria, recordatorios, chapita QR y más.</span>
          </div>
          <Icon name="chevronRight" size={18} />
        </button>
      )}

      <p className="privacy-note center" style={{ marginTop: 24 }}>
        <a href="/privacidad.html" target="_blank" rel="noreferrer">
          Política de privacidad
        </a>
      </p>

      {adding && (
        <PetFormModal
          onCancel={() => setAdding(false)}
          onSave={(data) => {
            onAddPet(data);
            setAdding(false);
          }}
        />
      )}

      {/* FUTURO: pedir la chapita QR física grabada desde aquí. */}
    </div>
  );
}
