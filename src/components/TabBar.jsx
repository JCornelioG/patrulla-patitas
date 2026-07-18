const TABS = [
  { id: 'alertas', icon: '🔔', label: 'Alertas' },
  { id: 'mapa', icon: '🗺️', label: 'Mapa' },
  { id: 'mis', icon: '🐾', label: 'Mis mascotas' },
];

export default function TabBar({ tab, onTab, alertCount }) {
  return (
    <nav className="tabbar">
      {TABS.map((t) => (
        <button key={t.id} className={`tab${tab === t.id ? ' active' : ''}`} onClick={() => onTab(t.id)}>
          <span className="icon">{t.icon}</span>
          {t.label}
          {t.id === 'alertas' && alertCount > 0 && <span className="badge">{alertCount}</span>}
        </button>
      ))}
    </nav>
  );
}
