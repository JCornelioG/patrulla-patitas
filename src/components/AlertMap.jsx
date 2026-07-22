import { Fragment, useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Circle, Polyline, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { alertRadius, formatClock } from '../utils/geo';

// SVG inline para los marcadores (Leaflet renderiza HTML plano).
const PAW_SVG =
  '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><ellipse cx="6.4" cy="9.6" rx="1.9" ry="2.5" transform="rotate(-22 6.4 9.6)"/><ellipse cx="10.1" cy="7.2" rx="1.9" ry="2.6"/><ellipse cx="13.9" cy="7.2" rx="1.9" ry="2.6"/><ellipse cx="17.6" cy="9.6" rx="1.9" ry="2.5" transform="rotate(22 17.6 9.6)"/><path d="M12 11.4c-3.4 0-5.8 2.7-5.8 5.3 0 2.6 2.4 3.6 3.8 3.3.9-.2 1.4-.6 2-.6s1.1.4 2 .6c1.4.3 3.8-.7 3.8-3.3 0-2.6-2.4-5.3-5.8-5.3Z"/></svg>';

const userIcon = L.divIcon({
  className: '',
  html: '<div class="pin-user"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// Marcador de mascota: miniatura (foto o huella) + distintivo de estado con
// símbolo, para no depender solo del color.
const petIcon = (pet) =>
  L.divIcon({
    className: '',
    html: `<div class="pin-marker" role="img" aria-label="${pet.name}, perdido">
      <div class="pin-photo" style="${pet.photoUrl ? '' : `background:${pet.bg ?? '#FFF0D3'};color:#262129`}">
        ${pet.photoUrl ? `<img src="${pet.photoUrl}" alt=""/>` : PAW_SVG}
      </div>
      <div class="pin-state">!</div>
    </div>`,
    iconSize: [46, 46],
    iconAnchor: [23, 23],
  });

const sightIcon = (n, latest) =>
  L.divIcon({
    className: '',
    html: `<div class="pin-sight${latest ? ' latest' : ''}" role="img" aria-label="Avistamiento ${n}">${n}</div>`,
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

// MapContainer solo usa `center` al montarse. El GPS llega de forma asíncrona,
// así que centramos una vez más cuando recibimos la lectura real; sin esto el
// marcador se actualizaba pero el mapa podía seguir mostrando la zona anterior.
function SyncUserLocation({ location, disabled }) {
  const map = useMap();
  useEffect(() => {
    if (!disabled) map.setView([location.lat, location.lng], map.getZoom(), { animate: false });
  }, [disabled, location.lat, location.lng, map]);
  return null;
}

// Mapa reutilizable: por cada mascota perdida dibuja su zona aproximada
// (baja opacidad), el radio de alerta en expansión y el rastro cronológico.
// El zoom nativo de Leaflet se oculta; los controles los pone el contenedor.
export default function AlertMap({
  pets,
  focus = null,
  now,
  userLocation,
  userAccuracy = null,
  placing = false,
  onPlace,
  onPetClick,
  height,
  mapRef,
}) {
  const center = focus?.lastKnown ?? userLocation;

  return (
    <div className={`map-wrap${placing ? ' placing' : ''}`} style={height ? { height } : undefined}>
      {placing && <div className="map-hint">Toca el mapa donde lo viste</div>}
      <MapContainer
        ref={mapRef}
        center={[center.lat, center.lng]}
        zoom={focus ? 15 : 14}
        className="map"
        zoomControl={false}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {placing && onPlace && <ClickCapture onPlace={onPlace} />}
        <SyncUserLocation location={userLocation} disabled={Boolean(focus)} />

        {userAccuracy && userAccuracy > 0 && (
          <Circle
            center={[userLocation.lat, userLocation.lng]}
            radius={userAccuracy}
            interactive={false}
            pathOptions={{
              color: '#1976D2',
              weight: 1,
              fillColor: '#1976D2',
              fillOpacity: 0.08,
            }}
          />
        )}

        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
          <Popup>
            Estás por aquí
            {userAccuracy ? ` (precisión aproximada: ${Math.round(userAccuracy)} m)` : ''}
          </Popup>
        </Marker>

        {pets
          .filter((p) => p.lastKnown)
          .map((pet) => {
            const trail = [...pet.sightings].sort((a, b) => a.at - b.at);
            const line = [pet.lastKnown, ...trail].map((pt) => [pt.lat, pt.lng]);
            return (
              <Fragment key={pet.id}>
                {/* Área aproximada de alerta (se expande con el tiempo) */}
                <Circle
                  center={[pet.lastKnown.lat, pet.lastKnown.lng]}
                  radius={alertRadius(now - pet.lostAt)}
                  pathOptions={{
                    color: '#FF6258',
                    weight: 1.5,
                    dashArray: '6 6',
                    fillColor: '#FF6258',
                    fillOpacity: 0.06,
                  }}
                />

                <Polyline
                  positions={line}
                  pathOptions={{ color: '#746A70', weight: 2.5, opacity: 0.8, dashArray: '2 8', lineCap: 'round' }}
                />

                <Marker
                  position={[pet.lastKnown.lat, pet.lastKnown.lng]}
                  icon={petIcon(pet)}
                  eventHandlers={onPetClick ? { click: () => onPetClick(pet) } : undefined}
                >
                  {!onPetClick && (
                    <Popup>
                      <strong>{pet.name}</strong>: visto por última vez en esta zona (aproximada)
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
                      Reportado por {s.reporterDisplay}
                    </Popup>
                  </Marker>
                ))}
              </Fragment>
            );
          })}

        {/* FUTURO: agrupación de marcadores (clustering) cuando la densidad
            de alertas lo justifique; hoy agregaría una dependencia sin
            beneficio visible. */}
      </MapContainer>
    </div>
  );
}
