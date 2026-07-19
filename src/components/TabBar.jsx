import Icon from './Icons';

// Barra inferior de 4 acciones. "Reportar" es la acción principal:
// botón coral elevado en el centro.
export default function TabBar({ tab, onTab, onReport, alertCount }) {
  return (
    <nav className="tabbar" aria-label="Navegación principal">
      <button
        className={`tab${tab === 'alertas' ? ' active' : ''}`}
        onClick={() => onTab('alertas')}
        aria-label={`Alertas${alertCount > 0 ? `, ${alertCount} activas` : ''}`}
      >
        <Icon name="bell" size={22} />
        Alertas
        {alertCount > 0 && <span className="badge">{alertCount}</span>}
      </button>

      <button
        className={`tab${tab === 'mapa' ? ' active' : ''}`}
        onClick={() => onTab('mapa')}
        aria-label="Mapa"
      >
        <Icon name="map" size={22} />
        Mapa
      </button>

      <button className="tab-fab" onClick={onReport} aria-label="Reportar">
        <span className="tab-fab-circle">
          <Icon name="plus" size={26} strokeWidth={2.2} />
        </span>
        Reportar
      </button>

      <button
        className={`tab${tab === 'mis' ? ' active' : ''}`}
        onClick={() => onTab('mis')}
        aria-label="Mis mascotas"
      >
        <Icon name="paw" size={22} />
        Mis mascotas
      </button>
    </nav>
  );
}
