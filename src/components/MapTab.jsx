import { useRef, useState } from 'react';
import AlertMap from './AlertMap';
import PetAvatar from './PetAvatar';
import Icon from './Icons';
import { distanceM, formatDistance, formatElapsed } from '../utils/geo';

// Mapa de alertas: seleccionar un marcador (o un chip) abre una tarjeta
// inferior con el resumen y las dos acciones. Los controles del mapa son
// botones flotantes propios (zoom y mi ubicación).
export default function MapTab({ pets, now, userLocation, onOpen, onReportSighting }) {
  const mapRef = useRef(null);
  const [selectedId, setSelectedId] = useState(null);
  const selected = pets.find((p) => p.id === selectedId) ?? null;

  function select(pet) {
    setSelectedId(pet.id);
    mapRef.current?.flyTo([pet.lastKnown.lat, pet.lastKnown.lng], 15, { duration: 0.6 });
  }

  const lastUpdate = (pet) => {
    const trail = [...pet.sightings].sort((a, b) => a.at - b.at);
    return trail[trail.length - 1]?.at ?? pet.lostAt;
  };

  return (
    <div className="maptab">
      <div className="maptab-chips">
        {pets.length === 0 && <span className="meta">Sin alertas activas en tu zona</span>}
        {pets.map((p) => (
          <button key={p.id} className={`fchip${selectedId === p.id ? ' active' : ''}`} onClick={() => select(p)}>
            <Icon name={p.species?.toLowerCase().startsWith('gat') ? 'cat' : 'dog'} size={16} />
            {p.name}
          </button>
        ))}
      </div>

      <AlertMap
        pets={pets}
        now={now}
        userLocation={userLocation}
        onPetClick={select}
        mapRef={mapRef}
      />

      <div className="map-fabs">
        <button className="fab-mini" aria-label="Acercar" onClick={() => mapRef.current?.zoomIn()}>
          <Icon name="plus" size={20} />
        </button>
        <button
          className="fab-mini"
          aria-label="Mi ubicación"
          onClick={() => mapRef.current?.flyTo([userLocation.lat, userLocation.lng], 15, { duration: 0.6 })}
        >
          <Icon name="locate" size={20} />
        </button>
      </div>

      {selected && (
        <div className="map-card" role="dialog" aria-label={`Alerta de ${selected.name}`}>
          <div className="map-card-top">
            <PetAvatar pet={selected} size="sm" />
            <div className="map-card-body">
              <div className="alert-card-top">
                <strong>{selected.name}</strong>
                <span className="status-chip st-lost">Perdid{selected.pronoun}</span>
              </div>
              <span className="meta-row">
                <span className="meta-item">
                  <Icon name="zone" size={14} />A ~
                  {formatDistance(distanceM(userLocation, selected.lastKnown))} de ti
                </span>
                <span className="meta-item">
                  <Icon name="clock" size={14} />
                  hace {formatElapsed(now - lastUpdate(selected))}
                </span>
              </span>
            </div>
            <button className="map-card-close" aria-label="Cerrar" onClick={() => setSelectedId(null)}>
              <Icon name="x" size={18} />
            </button>
          </div>
          <div className="map-card-actions">
            <button className="btn btn-secondary" onClick={() => onOpen(selected.id)}>
              Ver detalles
            </button>
            <button className="btn btn-primary" onClick={() => onReportSighting(selected.id)}>
              <Icon name="eye" size={16} />
              Reportar avistamiento
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
