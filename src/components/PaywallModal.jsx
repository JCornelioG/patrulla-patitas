import { useEffect, useState } from 'react';
import { getPlans, purchase, restorePurchases, subscriptionMode } from '../services/subscription';

const FEATURES = [
  ['🩺', 'Cartilla sanitaria digital', 'vacunas, tratamientos y peso'],
  ['⏰', 'Recordatorios de cuidados', 'antiparasitarios, vacunas, citas'],
  ['🔖', 'Chapita QR para el collar', 'funciona sin la app instalada'],
  ['📄', 'Flyer de búsqueda con QR', 'listo para imprimir y pegar'],
  ['🐾', 'Mascotas ilimitadas', 'el plan gratis incluye 2'],
];

// URL estándar del EULA de Apple para apps con suscripción.
const EULA_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';

export default function PaywallModal({ onClose, onPurchased }) {
  const [plans, setPlans] = useState([]);
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const testMode = subscriptionMode() === 'test';

  useEffect(() => {
    getPlans().then((ps) => {
      setPlans(ps);
      setSelected(ps.find((p) => p.tag)?.id ?? ps[0]?.id ?? null);
    });
  }, []);

  async function buy() {
    if (busy || !selected) return;
    setBusy(true);
    try {
      const ok = await purchase(plans.find((p) => p.id === selected));
      if (ok) {
        onPurchased();
        onClose();
      }
    } catch (err) {
      // El usuario canceló la compra o falló StoreKit: el paywall sigue abierto.
      console.warn('Compra no completada:', err);
    }
    setBusy(false);
  }

  async function doRestore() {
    if (busy) return;
    setBusy(true);
    try {
      const ok = await restorePurchases();
      if (ok) {
        onPurchased();
        onClose();
      }
    } catch (err) {
      console.warn('No se pudo restaurar:', err);
    }
    setBusy(false);
  }

  return (
    <div className="overlay">
      <div className="modal paywall">
        <div className="paywall-head">
          <h3>🐾 Patitas Plus</h3>
          <p className="muted small">
            Cuida a tu mascota antes de que se pierda. El rescate (alertas, mapa y avistamientos)
            <strong> es y será siempre gratis para todos</strong>.
          </p>
        </div>

        {testMode && (
          <p className="test-chip">🧪 Modo de prueba: la compra se simula en este dispositivo</p>
        )}

        <ul className="paywall-features">
          {FEATURES.map(([icon, title, sub]) => (
            <li key={title}>
              <span className="feat-icon">{icon}</span>
              <span>
                <strong>{title}</strong>
                <span className="muted small">: {sub}</span>
              </span>
            </li>
          ))}
        </ul>

        <div className="plan-row">
          {plans.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`plan-card${selected === p.id ? ' sel' : ''}`}
              onClick={() => setSelected(p.id)}
            >
              {p.tag && <span className="plan-tag">{p.tag}</span>}
              <span className="plan-title">{p.title}</span>
              <span className="plan-price">{p.price}</span>
              <span className="muted small">{p.period}</span>
            </button>
          ))}
        </div>

        <button className="btn btn-primary btn-big" onClick={buy} disabled={busy || !selected}>
          {busy ? 'Procesando…' : 'Continuar ✨'}
        </button>
        <button className="btn btn-ghost btn-big" onClick={onClose} disabled={busy}>
          Ahora no
        </button>

        <p className="paywall-legal">
          Suscripción auto-renovable, se cobra a tu cuenta de Apple y se cancela desde Ajustes.
          <br />
          <a href={EULA_URL} target="_blank" rel="noreferrer">
            Términos de uso
          </a>
          {' · '}
          <a href="/privacidad.html" target="_blank" rel="noreferrer">
            Privacidad
          </a>
          {' · '}
          <button type="button" className="link-btn" onClick={doRestore} disabled={busy}>
            Restaurar compras
          </button>
        </p>
      </div>
    </div>
  );
}
