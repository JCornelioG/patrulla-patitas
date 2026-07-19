import { useState } from 'react';
import PetAvatar from './PetAvatar';
import Icon from './Icons';
import { MAX_ALERT_RADIUS_M } from '../config/constants';
import { distanceM, formatDistance, formatElapsed } from '../utils/geo';

const FILTERS = [
  { id: 'todos', label: 'Todos', icon: null },
  { id: 'perros', label: 'Perros', icon: 'dog' },
  { id: 'gatos', label: 'Gatos', icon: 'cat' },
  { id: 'avistados', label: 'Avistados', icon: 'eye' },
];

function sexLabel(pronoun) {
  return pronoun === 'a' ? 'Hembra' : 'Macho';
}

export default function AlertsFeed({ pets, now, userLocation, onOpen }) {
  const [filter, setFilter] = useState('todos');

  const sorted = [...pets].sort((a, b) => b.lostAt - a.lostAt);
  const filtered = sorted.filter((pet) => {
    if (filter === 'perros') return pet.species?.toLowerCase().startsWith('perr');
    if (filter === 'gatos') return pet.species?.toLowerCase().startsWith('gat');
    if (filter === 'avistados') return pet.sightings.length > 0;
    return true;
  });

  const radiusKm = (MAX_ALERT_RADIUS_M / 1000).toFixed(1);

  return (
    <div className="screen">
      <div className="screen-head">
        <h2>Mascotas cerca de ti</h2>
        <p className="screen-sub">
          {pets.length === 0
            ? 'Sin alertas activas en tu zona ahora mismo.'
            : `${pets.length} alerta${pets.length === 1 ? '' : 's'} activa${pets.length === 1 ? '' : 's'} hasta ${radiusKm} km a la redonda.`}
        </p>
      </div>

      <div className="filters" role="tablist" aria-label="Filtrar alertas">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            role="tab"
            aria-selected={filter === f.id}
            className={`fchip${filter === f.id ? ' active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.icon && <Icon name={f.icon} size={16} />}
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <span className="empty-illu">
            <Icon name="paw" size={36} />
          </span>
          <strong>
            {pets.length === 0 ? 'Buen día para el barrio' : 'Nada con este filtro'}
          </strong>
          <p>
            {pets.length === 0
              ? 'No hay mascotas perdidas cerca. Si ves una, usa el botón Reportar y ayúdala a volver a casa.'
              : 'Prueba con otro filtro o revisa el mapa.'}
          </p>
        </div>
      )}

      {filtered.map((pet) => {
        const trail = [...pet.sightings].sort((a, b) => a.at - b.at);
        const lastSeen = trail[trail.length - 1] ?? pet.lastKnown;
        const dist = lastSeen ? formatDistance(distanceM(userLocation, lastSeen)) : null;
        const n = pet.sightings.length;
        return (
          <button className="card alert-card" key={pet.id} onClick={() => onOpen(pet.id)}>
            <PetAvatar pet={pet} />
            <span className="alert-card-body">
              <span className="alert-card-top">
                <strong>{pet.name}</strong>
                <span className="status-chip st-lost">Perdid{pet.pronoun}</span>
              </span>
              <span className="meta">
                {pet.species} · {pet.breed} · {sexLabel(pet.pronoun)}
              </span>
              <span className="meta-row">
                {dist && (
                  <span className="meta-item">
                    <Icon name="zone" size={15} />A ~{dist} · zona aproximada
                  </span>
                )}
                <span className="meta-item">
                  <Icon name="eye" size={15} />
                  {n} avistamiento{n === 1 ? '' : 's'}
                </span>
              </span>
              <span className="alert-card-top">
                <span className="time-note">Hace {formatElapsed(now - pet.lostAt)}</span>
                <span className="card-action">
                  Ver alerta
                  <Icon name="chevronRight" size={16} />
                </span>
              </span>
            </span>
          </button>
        );
      })}

      {/* FUTURO: insignias de reputación para los vecinos que más ayudan. */}
    </div>
  );
}
