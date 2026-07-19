import { useEffect, useState } from 'react';
import PetAvatar from './PetAvatar';
import Icon from './Icons';
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
    ctx.strokeStyle = '#FF6258';
    ctx.lineWidth = 8;
    ctx.strokeRect(24, 24, 852, 1112);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#262129';
    ctx.font = "800 60px Manrope, 'Segoe UI', sans-serif";
    ctx.fillText(`Hola, soy ${pet.name}`, 450, 124);
    const img = new Image();
    await new Promise((r) => {
      img.onload = r;
      img.src = qr;
    });
    ctx.drawImage(img, 130, 180, 640, 640);
    ctx.font = "700 42px Manrope, 'Segoe UI', sans-serif";
    ctx.fillText('Si me encontraste, escanéame', 450, 912);
    ctx.fillText('con la cámara de tu celular', 450, 968);
    ctx.fillStyle = '#E94F47';
    ctx.font = "700 34px Manrope, 'Segoe UI', sans-serif";
    ctx.fillText('Patrulla Patitas', 450, 1068);
    await saveOrShareImage(canvas.toDataURL('image/png'), `chapita-${pet.name}.png`, `Chapita QR de ${pet.name}`);
  }

  return (
    <div className="detail panel">
      <div className="detail-top">
        <button className="btn-back" onClick={onClose} aria-label="Volver">
          <Icon name="back" size={20} />
        </button>
        <span className="detail-title">
          Chapita QR
          <span className="status-chip st-seen">Plus</span>
        </span>
      </div>

      <div className="detail-scroll" style={{ textAlign: 'center' }}>
        <div className="detail-hero">
          <PetAvatar pet={pet} size="sm" />
          <div>
            <h2 style={{ margin: 0, fontSize: 20 }}>{pet.name}</h2>
            <span className="meta">Contacto: {pet.ownerPhone || 'sin teléfono registrado'}</span>
          </div>
        </div>

        <p className="meta">
          Imprime este QR y pégalo en la chapita del collar. Quien lo escanee con la cámara del
          celular ve tu contacto al instante y <strong>no necesita tener la app</strong>.
        </p>

        {qr ? (
          <img className="qr-img" src={qr} alt={`QR de ${pet.name}`} />
        ) : (
          <div className="empty-state">
            <p>Generando QR…</p>
          </div>
        )}

        <button className="btn btn-primary btn-big" onClick={downloadTag} disabled={!qr}>
          <Icon name="share" size={17} />
          Descargar chapita para imprimir
        </button>

        {!pet.ownerPhone && (
          <p className="privacy-note">
            <Icon name="alert" size={15} />
            Esta mascota no tiene teléfono de contacto: el QR mostrará solo el nombre. Agrégalo al
            crear o editar la mascota.
          </p>
        )}

        {/* FUTURO: pedir la chapita física grabada con envío a domicilio
            (bien físico → se puede cobrar fuera del IAP de Apple). */}
      </div>
    </div>
  );
}
