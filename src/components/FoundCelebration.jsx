import { formatElapsed } from '../utils/geo';

const CONFETTI = ['🎉', '💛', '🐾', '✨', '🎊', '💚', '🐾', '✨', '🎉', '💛', '🎊', '✨'];

export default function FoundCelebration({ pet, onClose }) {
  const lostFor = pet.foundAt && pet.lostAt ? pet.foundAt - pet.lostAt : 0;
  const helpers = new Set(pet.sightings.map((s) => s.reporterId ?? s.reporterName)).size;
  const n = pet.sightings.length;

  return (
    <div className="celebration">
      {CONFETTI.map((c, i) => (
        <span
          key={i}
          className="confetti"
          style={{
            left: `${(i * 8.3 + 4) % 100}%`,
            animationDelay: `${(i % 6) * 0.45}s`,
            fontSize: `${18 + (i % 3) * 8}px`,
          }}
        >
          {c}
        </span>
      ))}

      <div className="celebration-card">
        <div className="celebration-emoji">{pet.emoji}</div>
        <h2>¡{pet.name} está en casa!</h2>
        <p>
          Estuvo perdid{pet.pronoun} {formatElapsed(lostFor)}.
        </p>
        {n > 0 ? (
          <p>
            {helpers} vecino{helpers === 1 ? '' : 's'} ayud{helpers === 1 ? 'ó' : 'aron'} con {n} avistamiento
            {n === 1 ? '' : 's'}.
          </p>
        ) : (
          <p>Volvió por su cuenta 😄</p>
        )}
        <p className="thanks">💛 Gracias a la guardia ciudadana por estar atenta.</p>
        <button className="btn btn-green btn-big" onClick={onClose}>
          Cerrar caso con final feliz 🏠
        </button>
      </div>

      {/* FUTURO: aquí se otorgarían insignias a los vecinos que ayudaron. */}
    </div>
  );
}
