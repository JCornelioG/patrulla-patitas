import { useState } from 'react';
import Icon from './Icons';
import PetAvatar from './PetAvatar';

// Hoja de la acción principal "Reportar": dos flujos que reutilizan la
// lógica existente de la app.
//   1. "Se perdió mi mascota"  → confirmación de alerta de una mascota propia.
//   2. "Vi una mascota perdida" → abre la alerta elegida con el modo de
//      marcado en el mapa ya activo.
export default function ReportSheet({ ownPets, lostPets, onLost, onSeen, onGoAddPet, onClose }) {
  const [mode, setMode] = useState(null); // null | 'lost' | 'seen'
  const homePets = ownPets.filter((p) => p.status !== 'lost');

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Reportar">
        <div className="sheet-grip" />

        {mode === null && (
          <>
            <h3>¿Qué quieres reportar?</h3>
            <p className="sheet-sub">La alerta llega al instante a los vecinos cercanos.</p>

            <button
              className="report-option"
              onClick={() => (homePets.length === 1 ? onLost(homePets[0].id) : setMode('lost'))}
            >
              <span className="report-option-icon warm">
                <Icon name="alert" size={22} />
              </span>
              <span className="report-option-body">
                <strong>Se perdió mi mascota</strong>
                <span>Publica la alerta con su zona aproximada</span>
              </span>
              <Icon name="chevronRight" size={18} />
            </button>

            <button
              className="report-option"
              onClick={() => (lostPets.length === 1 ? onSeen(lostPets[0].id) : setMode('seen'))}
            >
              <span className="report-option-icon cool">
                <Icon name="eye" size={22} />
              </span>
              <span className="report-option-body">
                <strong>Vi una mascota perdida</strong>
                <span>Marca el punto del avistamiento en el mapa</span>
              </span>
              <Icon name="chevronRight" size={18} />
            </button>
          </>
        )}

        {mode === 'lost' && (
          <>
            <h3>¿Cuál de tus mascotas se perdió?</h3>
            {homePets.length === 0 ? (
              <>
                <p className="sheet-sub">
                  Aún no registraste ninguna mascota. Crea su perfil primero: toma menos de un
                  minuto y deja la alerta a un toque de distancia.
                </p>
                <button className="btn btn-primary btn-big" onClick={onGoAddPet}>
                  <Icon name="plus" size={18} />
                  Registrar mi mascota
                </button>
              </>
            ) : (
              <div className="sheet-list">
                {homePets.map((pet) => (
                  <button key={pet.id} className="sheet-pet" onClick={() => onLost(pet.id)}>
                    <PetAvatar pet={pet} size="sm" />
                    <span className="report-option-body">
                      <strong>{pet.name}</strong>
                      <span>
                        {pet.species} · {pet.breed}
                      </span>
                    </span>
                    <Icon name="chevronRight" size={18} />
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {mode === 'seen' && (
          <>
            <h3>¿A cuál viste?</h3>
            {lostPets.length === 0 ? (
              <p className="sheet-sub">
                No hay alertas activas cerca en este momento. Si ves una mascota que parece
                perdida, revisa el mapa más tarde: las alertas nuevas aparecen al instante.
              </p>
            ) : (
              <div className="sheet-list">
                {lostPets.map((pet) => (
                  <button key={pet.id} className="sheet-pet" onClick={() => onSeen(pet.id)}>
                    <PetAvatar pet={pet} size="sm" />
                    <span className="report-option-body">
                      <strong>{pet.name}</strong>
                      <span>
                        {pet.species} · {pet.breed} · {pet.color}
                      </span>
                    </span>
                    <Icon name="chevronRight" size={18} />
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        <button className="btn btn-ghost btn-big" onClick={mode ? () => setMode(null) : onClose}>
          {mode ? 'Volver' : 'Cancelar'}
        </button>
      </div>
    </div>
  );
}
