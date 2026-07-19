import Icon from './Icons';
import { formatElapsed } from '../utils/geo';

// Final feliz: confeti de formas de color (sin emojis) y resumen del caso.
const CONFETTI_COLORS = ['#FF6258', '#1F8A58', '#2B5FAB', '#E9B44C', '#FF6258', '#1F8A58'];

export default function FoundCelebration({ pet, onClose }) {
  const lostFor = pet.foundAt && pet.lostAt ? pet.foundAt - pet.lostAt : 0;
  const helpers = new Set(pet.sightings.map((s) => s.reporterId ?? s.reporterName)).size;
  const n = pet.sightings.length;

  return (
    <div className="celebration">
      {Array.from({ length: 14 }, (_, i) => (
        <span
          key={i}
          className="confetti"
          style={{
            left: `${(i * 7.3 + 3) % 100}%`,
            background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            animationDelay: `${(i % 7) * 0.4}s`,
            width: `${8 + (i % 3) * 3}px`,
            height: `${8 + ((i + 1) % 3) * 3}px`,
          }}
        />
      ))}

      <div className="celebration-card">
        <span className="celebration-illu">
          <Icon name="heart" size={44} strokeWidth={1.6} />
        </span>
        <h2>{pet.name} está en casa</h2>
        <p>
          Estuvo perdid{pet.pronoun} {formatElapsed(lostFor)}.
        </p>
        {n > 0 ? (
          <p>
            {helpers} vecino{helpers === 1 ? '' : 's'} ayud{helpers === 1 ? 'ó' : 'aron'} con {n}{' '}
            avistamiento{n === 1 ? '' : 's'}.
          </p>
        ) : (
          <p>Volvió por su cuenta.</p>
        )}
        <p className="thanks">Gracias a la guardia ciudadana por estar atenta.</p>
        <button className="btn btn-success btn-big" onClick={onClose}>
          <Icon name="home" size={18} />
          Cerrar caso con final feliz
        </button>
      </div>

      {/* FUTURO: aquí se otorgarían insignias a los vecinos que ayudaron. */}
    </div>
  );
}
