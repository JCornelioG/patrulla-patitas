import { useEffect, useState } from 'react';
import PetAvatar from './PetAvatar';
import { qrDataUrl, petVCard } from '../utils/qr';
import { saveOrShareImage } from '../utils/share';

// Chapita QR (Patitas Plus): un QR con el contacto del dueño en formato
// vCard. Quien lo escanee con la cámara del celular ve el contacto al
// instante, sin necesidad de tener la app instalada.
export default function QrPanel({ pet, onClose }) {
  const [qr, setQr] = useState(null);

  useEffect(() => {
    qrDataUrl(petVCard(pet), 640).then(setQr);
  }, [pet]);

  async function downloadTag() {
    if (!qr) return;
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 1160;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 900, 1160);
    ctx.strokeStyle = '#FF6B4A';
    ctx.lineWidth = 10;
    ctx.strokeRect(20, 20, 860, 1120);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#3B2E28';
    ctx.font = "900 64px Nunito, 'Segoe UI', sans-serif";
    ctx.fillText(`¡Hola! Soy ${pet.name}`, 450, 120);
    const img = new Image();
    await new Promise((r) => {
      img.onload = r;
      img.src = qr;
    });
    ctx.drawImage(img, 130, 180, 640, 640);
    ctx.font = "800 44px Nunito, 'Segoe UI', sans-serif";
    ctx.fillText('Si me encontraste, escanéame', 450, 910);
    ctx.fillText('con la cámara de tu celular 📱', 450, 970);
    ctx.fillStyle = '#FF6B4A';
    ctx.font = "800 36px Nunito, 'Segoe UI', sans-serif";
    ctx.fillText('🐾 Patrulla Patitas', 450, 1070);
    await saveOrShareImage(canvas.toDataURL('image/png'), `chapita-${pet.name}.png`, `Chapita QR de ${pet.name}`);
  }

  return (
    <div className="detail panel">
      <div className="detail-top">
        <button className="btn-back" onClick={onClose} aria-label="Volver">
          ←
        </button>
        <span className="detail-title">Chapita QR</span>
        <span className="plus-badge">PLUS</span>
      </div>

      <div className="detail-scroll" style={{ textAlign: 'center' }}>
        <div className="detail-hero" style={{ justifyContent: 'center' }}>
          <PetAvatar pet={pet} size={64} />
          <div style={{ textAlign: 'left' }}>
            <h2 style={{ margin: 0 }}>{pet.name}</h2>
            <span className="muted small">Contacto: {pet.ownerPhone || 'sin teléfono registrado'}</span>
          </div>
        </div>

        <p className="muted small">
          Imprime este QR y pégalo en la chapita del collar. Quien lo escanee con la cámara del
          celular ve tu contacto al instante — <strong>no necesita tener la app</strong>.
        </p>

        {qr ? <img className="qr-img" src={qr} alt={`QR de ${pet.name}`} /> : <div className="empty">Generando QR…</div>}

        <button className="btn btn-primary btn-big" onClick={downloadTag} disabled={!qr}>
          ⬇️ Descargar chapita para imprimir
        </button>

        {!pet.ownerPhone && (
          <p className="privacy-note">
            ⚠️ Esta mascota no tiene teléfono de contacto: el QR mostrará solo el nombre. Agrégalo al
            crear o editar la mascota.
          </p>
        )}

        {/* FUTURO: pedir la chapita física grabada con envío a domicilio
            (bien físico → se puede cobrar fuera del IAP de Apple). */}
      </div>
    </div>
  );
}
