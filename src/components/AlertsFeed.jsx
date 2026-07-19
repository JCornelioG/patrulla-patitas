import PetAvatar from './PetAvatar';
import { distanceM, formatDistance, formatElapsed } from '../utils/geo';

export default function AlertsFeed({ pets, now, userLocation, onOpen }) {
  const sorted = [...pets].sort((a, b) => b.lostAt - a.lostAt);

  return (
    <div className="feed">
      <h2 className="section-title">Alertas activas cerca de ti</h2>
      <p className="privacy-note">🔒 Mostramos zonas aproximadas, nunca direcciones exactas.</p>

      {sorted.length === 0 && (
        <div className="empty">🎉 No hay mascotas perdidas cerca. ¡Buen día para el barrio!</div>
      )}

      {sorted.map((pet) => {
        const trail = [...pet.sightings].sort((a, b) => a.at - b.at);
        const lastSeen = trail[trail.length - 1] ?? pet.lastKnown;
        const dist = lastSeen ? formatDistance(distanceM(userLocation, lastSeen)) : '...';
        const n = pet.sightings.length;
        return (
          <button className="card alert-card" key={pet.id} onClick={() => onOpen(pet.id)}>
            <PetAvatar pet={pet} size={64} />
            <div className="alert-card-body">
              <div className="alert-card-top">
                <strong>{pet.name}</strong>
                <span className="chip chip-lost">hace {formatElapsed(now - pet.lostAt)}</span>
              </div>
              <span className="muted small">
                {pet.species} · {pet.breed} · {pet.color}
              </span>
              <span className="small">
                📍 A ~{dist} de ti · 👀 {n} avistamiento{n === 1 ? '' : 's'}
              </span>
            </div>
            <span className="chev">›</span>
          </button>
        );
      })}

      {/* FUTURO: filtros por especie/zona e insignias de reputación para
          los vecinos que más ayudan. */}
    </div>
  );
}
