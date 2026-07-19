import { useEffect, useState } from 'react';
import Icon from './Icons';
import { hapticSuccess } from '../utils/haptics';

// Protección de cuenta (sección secundaria de Mis mascotas): vincula la
// identidad anónima con Apple/Google para recuperar las mascotas si el
// usuario cambia de teléfono. La autenticación aparece recién cuando ya
// hay algo que proteger.
export default function AccountCard({ onToast }) {
  const [info, setInfo] = useState(null);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    import('../services/account').then((acc) => {
      if (alive) setInfo(acc.getAccountInfo());
    });
    return () => {
      alive = false;
    };
  }, []);

  async function connect(provider) {
    if (busy) return;
    setBusy(true);
    const acc = await import('../services/account');
    const result = await acc.linkOrSignIn(provider);
    if (result.status === 'linked') {
      hapticSuccess();
      onToast(`Cuenta protegida${result.email ? ` con ${result.email}` : ''}.`);
      setInfo(acc.getAccountInfo());
      setOpen(false);
    } else if (result.status === 'switched') {
      onToast('Bienvenido de vuelta. Recuperando tus mascotas…');
      setTimeout(() => window.location.reload(), 1200);
      return;
    } else if (result.status === 'error') {
      onToast(result.message);
    }
    setBusy(false);
  }

  if (!info) return null;

  if (info.linked) {
    return (
      <div className="account-row">
        <span className="icon-chip" style={{ background: 'var(--color-success-soft)', color: 'var(--color-success-text)' }}>
          <Icon name="shield" size={20} />
        </span>
        <div className="account-row-body">
          <strong>Cuenta protegida</strong>
          <span>
            {info.providerId === 'apple.com' ? 'Apple' : 'Google'}
            {info.email ? ` · ${info.email}` : ''}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button className="account-row" style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} onClick={() => setOpen(!open)}>
        <span className="icon-chip">
          <Icon name="shield" size={20} />
        </span>
        <div className="account-row-body">
          <strong>Protege tus mascotas</strong>
          <span>Recupéralas si cambias de teléfono.</span>
        </div>
        <Icon name={open ? 'x' : 'chevronRight'} size={18} />
      </button>

      {open && (
        <div className="account-buttons">
          <button className="btn btn-secondary" disabled={busy} onClick={() => connect('google')}>
            {busy ? 'Conectando…' : 'Continuar con Google'}
          </button>
          <button className="btn btn-secondary" disabled={busy} onClick={() => connect('apple')}>
            {busy ? 'Conectando…' : 'Continuar con Apple'}
          </button>
        </div>
      )}
    </div>
  );
}
