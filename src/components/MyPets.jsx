import { useState } from 'react';
import PetAvatar from './PetAvatar';
import PetFormModal from './PetFormModal';
import AccountCard from './AccountCard';
import { FREE_PET_LIMIT } from '../config/constants';
import { formatElapsed } from '../utils/geo';

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
  // El plan gratis incluye FREE_PET_LIMIT mascotas; el rescate nunca se limita.
  const atLimit = !isPlus && own.length >= FREE_PET_LIMIT;

  return (
    <div className="mypets">
      <h2 className="section-title">Mis mascotas</h2>
      <p className="privacy-note">🔒 Tu dirección nunca se comparte: las alertas usan zonas aproximadas.</p>

      {canLink && <AccountCard onToast={onToast} />}

      {isPlus ? (
        <div className="card plus-active">✨ Patitas Plus activo. ¡Gracias por apoyar la guardia! 💛</div>
      ) : (
        <button className="card plus-promo" onClick={onOpenPaywall}>
          <strong>🐾 Patitas Plus</strong>
          <span className="small">
            Cartilla sanitaria, recordatorios, chapita QR, flyer con QR y mascotas ilimitadas.
          </span>
          <span className="plus-cta">Conocer Plus ✨</span>
        </button>
      )}

      {own.map((pet) => (
        <div className="card mypet-card" key={pet.id}>
          <div className="mypet-top" onClick={() => onOpen(pet.id)}>
            <PetAvatar pet={pet} size={64} />
            <div className="mypet-info">
              <strong>{pet.name}</strong>
              <span className="muted small">
                {pet.species} · {pet.breed}
              </span>
              {pet.status === 'lost' ? (
                <span className="chip chip-lost">
                  🚨 Perdid{pet.pronoun} hace {formatElapsed(now - pet.lostAt)}
                </span>
              ) : (
                <span className="chip chip-home">😊 En casa</span>
              )}
            </div>
          </div>

          {pet.status === 'lost' ? (
            <button className="btn btn-primary btn-big" onClick={() => onOpen(pet.id)}>
              Ver alerta y rastro 🗺️
            </button>
          ) : (
            <button className="btn btn-danger btn-big" onClick={() => onRequestLost(pet.id)}>
              🚨 SE PERDIÓ
            </button>
          )}

          {/* FUTURO: pedir la chapita QR física grabada desde aquí. */}
        </div>
      ))}

      <button className="add-pet" onClick={() => (atLimit ? onOpenPaywall() : setAdding(true))}>
        ＋ Agregar mascota
        {atLimit && <span className="small"> · plan gratis: hasta {FREE_PET_LIMIT} 🔒</span>}
      </button>

      {adding && (
        <PetFormModal
          onCancel={() => setAdding(false)}
          onSave={(data) => {
            onAddPet(data);
            setAdding(false);
          }}
        />
      )}

      <p className="privacy-note center" style={{ marginTop: 18 }}>
        <a href="/privacidad.html" target="_blank" rel="noreferrer">
          Política de privacidad
        </a>
      </p>
    </div>
  );
}
