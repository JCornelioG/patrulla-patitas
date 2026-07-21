import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import Icon from './Icons';
import { fetchPetPlaces, directionsUrl, PLACE_CATEGORIES } from '../services/places';
import { distanceM, formatDistance } from '../utils/geo';

// Color e icono SVG (inline, para Leaflet) por categoría de lugar.
const CAT = {
  vet: { color: '#B3372D', svg: '<path d="M11 2h2a1 1 0 0 1 1 1v2h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-2H7a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h2V3a1 1 0 0 1 1-1Z"/><path d="M8 15c-2 1-3 3-3 5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2c0-2-1-4-3-5"/>' },
  shelter: { color: '#1F8A58', svg: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.51 4.04 3 5.5l7 7Z"/>' },
  boarding: { color: '#8A6100', svg: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1Z"/>' },
  shop: { color: '#2B5FAB', svg: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>' },
  grooming: { color: '#7A4FB0', svg: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.12 15.88"/><path d="M14.47 14.48 20 20"/><path d="M8.12 8.12 12 12"/>' },
};

const userIcon = L.divIcon({
  className: '',
  html: '<div class="pin-user"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const placeIcon = (place, active) =>
  L.divIcon({
    className: '',
    html: `<div class="pin-place${active ? ' active' : ''}" style="background:${CAT[place.category].color}" role="img" aria-label="${PLACE_CATEGORIES[place.category].label}: ${place.name}">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${CAT[place.category].svg}</svg>
    </div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });

// Mapa de servicios para mascotas (capa de OpenStreetMap). El rescate y los
// servicios comparten la pestaña Mapa mediante un toggle; esta es la capa
// "Servicios". Filtros por categoría, tarjeta inferior con Llamar y Cómo llegar.
export default function ServicesMap({ userLocation }) {
  const mapRef = useRef(null);
  const [places, setPlaces] = useState(null); // null = cargando
  const [error, setError] = useState(false);
  const [active, setActive] = useState(new Set(Object.keys(PLACE_CATEGORIES)));
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let alive = true;
    setPlaces(null);
    setError(false);
    fetchPetPlaces(userLocation)
      .then((res) => alive && setPlaces(res))
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, [userLocation]);

  function toggle(cat) {
    setActive((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  }

  const visible = (places ?? []).filter((p) => active.has(p.category));

  return (
    <div className="maptab">
      <div className="maptab-chips">
        {Object.entries(PLACE_CATEGORIES).map(([id, c]) => (
          <button
            key={id}
            className={`fchip${active.has(id) ? ' active' : ''}`}
            aria-pressed={active.has(id)}
            onClick={() => toggle(id)}
          >
            <Icon name={c.icon} size={16} />
            {c.label}
          </button>
        ))}
      </div>

      <div className="map-wrap">
        <MapContainer
          ref={mapRef}
          center={[userLocation.lat, userLocation.lng]}
          zoom={14}
          className="map"
          zoomControl={false}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon} />
          {visible.map((p) => (
            <Marker
              key={p.id}
              position={[p.lat, p.lng]}
              icon={placeIcon(p, selected?.id === p.id)}
              eventHandlers={{ click: () => setSelected(p) }}
            />
          ))}
        </MapContainer>

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

        {places === null && !error && (
          <div className="map-hint">
            <Icon name="pin" size={15} />
            Buscando servicios cerca…
          </div>
        )}

        {error && (
          <div className="map-card" role="status">
            <strong>No se pudo cargar</strong>
            <p className="meta" style={{ margin: '4px 0 0' }}>
              Revisa tu conexión e intenta de nuevo.
            </p>
          </div>
        )}

        {places !== null && !error && visible.length === 0 && (
          <div className="map-card" role="status">
            <strong>Sin servicios en esta zona</strong>
            <p className="meta" style={{ margin: '4px 0 0' }}>
              OpenStreetMap aún no tiene lugares registrados aquí con los filtros
              activos. Pronto podrás agregarlos tú.
            </p>
          </div>
        )}

        {selected && (
          <div className="map-card" role="dialog" aria-label={selected.name}>
            <div className="map-card-top">
              <span className="icon-chip" style={{ background: '#fff', color: CAT[selected.category].color, border: '1px solid var(--color-border)' }}>
                <Icon name={PLACE_CATEGORIES[selected.category].icon} size={22} />
              </span>
              <div className="map-card-body">
                <strong>{selected.name}</strong>
                <span className="meta-row">
                  {selected.name !== PLACE_CATEGORIES[selected.category].label && (
                    <span className="meta-item">{PLACE_CATEGORIES[selected.category].label}</span>
                  )}
                  <span className="meta-item">
                    <Icon name="pin" size={14} />A ~{formatDistance(distanceM(userLocation, selected))}
                  </span>
                </span>
                {selected.hours && <span className="meta">{selected.hours}</span>}
              </div>
              <button className="map-card-close" aria-label="Cerrar" onClick={() => setSelected(null)}>
                <Icon name="x" size={18} />
              </button>
            </div>
            <div className="map-card-actions">
              {selected.phone ? (
                <a className="btn btn-secondary" href={`tel:${selected.phone.replace(/\s/g, '')}`}>
                  <Icon name="phone" size={16} />
                  Llamar
                </a>
              ) : (
                <button className="btn btn-secondary" disabled>
                  Sin teléfono
                </button>
              )}
              <a
                className="btn btn-primary"
                href={directionsUrl(selected)}
                target="_blank"
                rel="noreferrer"
              >
                <Icon name="navigation" size={16} />
                Cómo llegar
              </a>
            </div>
          </div>
        )}
      </div>

      <p className="privacy-note center" style={{ margin: '0 var(--space-4) var(--space-3)' }}>
        Datos de lugares por OpenStreetMap. ¿Falta uno? Pronto podrás sugerirlo.
      </p>
    </div>
  );
}
