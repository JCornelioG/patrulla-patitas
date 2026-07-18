import AlertMap from './AlertMap';

export default function MapTab({ pets, now, userLocation, onOpen }) {
  return (
    <div className="maptab">
      <div className="maptab-chips">
        {pets.map((p) => (
          <button key={p.id} className="chip chip-pet" onClick={() => onOpen(p.id)}>
            {p.emoji} {p.name}
          </button>
        ))}
        {pets.length === 0 && <span className="muted small">Sin alertas activas 🎉</span>}
      </div>
      <AlertMap pets={pets} now={now} userLocation={userLocation} onPetClick={(p) => onOpen(p.id)} />
    </div>
  );
}
