import { useEffect, useState } from 'react';
import { hapticSuccess } from '../utils/haptics';

// Tarjeta "Protege tus mascotas": vincula la identidad anónima con
// Apple/Google para poder recuperar las mascotas en otro dispositivo.
// Solo se muestra en modo Firebase (en demo local no hay nada que vincular).
export default function AccountCard({ onToast }) {
  const [info, setInfo] = useState(null); // null = cargando
  const [busy, setBusy] = useState(false);

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
      onToast(`🛡️ ¡Cuenta protegida${result.email ? ` con ${result.email}` : ''}!`);
      setInfo(acc.getAccountInfo());
    } else if (result.status === 'switched') {
      onToast('👋 ¡Bienvenido de vuelta! Recuperando tus mascotas…');
      // uid nuevo: recargamos para resuscribir los datos con la cuenta recuperada.
      setTimeout(() => window.location.reload(), 1200);
      return;
    } else if (result.status === 'error') {
      onToast(`⚠️ ${result.message}`);
    }
    setBusy(false);
  }

  if (!info) return null;

  if (info.linked) {
    return (
      <div className="card account-card-linked">
        🛡️ Cuenta protegida
        <span className="muted small">
          {info.providerId === 'apple.com' ? ' Apple' : ' Google'}
          {info.email ? ` · ${info.email}` : ''}
        </span>
      </div>
    );
  }

  return (
    <div className="card account-card">
      <strong>🛡️ Protege tus mascotas</strong>
      <span className="small muted">
        Vincula tu cuenta y recupéralas si cambias de teléfono. Si ya la tenías, entra y vuelven
        solas.
      </span>
      <div className="account-buttons">
        <button className="btn btn-ghost" disabled={busy} onClick={() => connect('google')}>
          {busy ? '…' : 'Continuar con Google'}
        </button>
        <button className="btn btn-ghost" disabled={busy} onClick={() => connect('apple')}>
          {busy ? '…' : ' Continuar con Apple'}
        </button>
      </div>
    </div>
  );
}
