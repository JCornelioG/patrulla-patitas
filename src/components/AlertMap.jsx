import { Fragment } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Circle, Polyline, Marker, Popup, useMapEvents } from 'react-leaflet';
import { alertRadius, formatClock } from '../utils/geo';

const userIcon = L.divIcon({
  className: '',
  html: '<div class="pin-user"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const petIcon = (pet) =>
  L.divIcon({
    className: '',
    html: `<div class="pin-pet" style="background:${pet.bg}">${pet.emoji}</div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });

const sightIcon = (n, latest) =>
  L.divIcon({
    className: '',
    html: `<div class="pin-sight${latest ? ' latest' : ''}">${n}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });

function ClickCapture({ onPlace }) {
  useMapEvents({
    click(e) {
      onPlace({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

// Mapa reutilizable: dibuja por cada mascota perdida su zona aproximada,
// el radio de alerta en expansión y el rastro cronológico de avistamientos.
export default function AlertMap({
  pets,
  focus = null,
  now,
  userLocation,
  placing = false,
  onPlace,
  onPetClick,
  height,
}) {
  const center = focus?.lastKnown ?? userLocation;

  return (
    <div className={`map-wrap${placing ? ' placing' : ''}`} style={height ? { height } : undefined}>
      {placing && <div className="map-hint">👆 Toca el mapa donde lo viste</div>}
      <MapContainer center={[center.lat, center.lng]} zoom={focus ? 15 : 14} className="map" scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {placing && onPlace && <ClickCapture onPlace={onPlace} />}

        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
          <Popup>Estás por aquí</Popup>
        </Marker>

        {pets
          .filter((p) => p.lastKnown)
          .map((pet) => {
            const trail = [...pet.sightings].sort((a, b) => a.at - b.at);
            const line = [pet.lastKnown, ...trail].map((pt) => [pt.lat, pt.lng]);
            return (
              <Fragment key={pet.id}>
                {/* Radio de alerta que se expande automáticamente con el tiempo */}
                <Circle
                  center={[pet.lastKnown.lat, pet.lastKnown.lng]}
                  radius={alertRadius(now - pet.lostAt)}
                  pathOptions={{
                    color: '#FF6B4A',
                    weight: 1.5,
                    dashArray: '6 6',
                    fillColor: '#FF6B4A',
                    fillOpacity: 0.07,
                  }}
                />

                {/* Rastro: última zona conocida + avistamientos en orden cronológico */}
                <Polyline
                  positions={line}
                  pathOptions={{ color: '#FF9F1C', weight: 3, opacity: 0.85, dashArray: '1 9', lineCap: 'round' }}
                />

                <Marker
                  position={[pet.lastKnown.lat, pet.lastKnown.lng]}
                  icon={petIcon(pet)}
                  eventHandlers={onPetClick ? { click: () => onPetClick(pet) } : undefined}
                >
                  {!onPetClick && (
                    <Popup>
                      <strong>{pet.name}</strong> — visto por última vez en esta zona (aproximada)
                    </Popup>
                  )}
                </Marker>

                {trail.map((s, i) => (
                  <Marker key={s.id} position={[s.lat, s.lng]} icon={sightIcon(i + 1, i === trail.length - 1)}>
                    <Popup>
                      <strong>Avistamiento {i + 1}</strong> · {formatClock(s.at)}
                      <br />
                      {s.note || 'Sin nota'}
                      <br />
                      <em>por {s.reporterDisplay}</em>
                    </Popup>
                  </Marker>
                ))}
              </Fragment>
            );
          })}
      </MapContainer>
    </div>
  );
}
