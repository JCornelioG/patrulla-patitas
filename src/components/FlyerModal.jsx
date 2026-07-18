import { useEffect, useState } from 'react';
import { generateFlyer } from '../utils/flyer';
import { qrDataUrl, petVCard } from '../utils/qr';
import { saveOrShareImage } from '../utils/share';

// Flyer de búsqueda. GRATIS para toda mascota perdida (herramienta de
// rescate); con Patitas Plus incluye además el QR de contacto escaneable.
export default function FlyerModal({ pet, isPlus, onOpenPaywall, onClose }) {
  const [img, setImg] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const qr = isPlus ? await qrDataUrl(petVCard(pet), 300) : null;
      const flyer = await generateFlyer(pet, { qr });
      if (alive) setImg(flyer);
    })();
    return () => {
      alive = false;
    };
  }, [pet, isPlus]);

  return (
    <div className="overlay">
      <div className="modal">
        <h3>📄 Flyer de búsqueda</h3>
        {img ? (
          <img className="flyer-preview" src={img} alt={`Flyer de ${pet.name}`} />
        ) : (
          <div className="empty">Generando flyer…</div>
        )}

        {!isPlus && (
          <p className="privacy-note">
            ✨ Con <strong>Patitas Plus</strong> el flyer incluye un QR escaneable con tu contacto.{' '}
            <button type="button" className="link-btn" onClick={onOpenPaywall}>
              Ver Plus
            </button>
          </p>
        )}

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>
            Cerrar
          </button>
          <button
            className="btn btn-primary"
            disabled={!img}
            onClick={() => saveOrShareImage(img, `se-perdio-${pet.name}.png`, `Flyer de búsqueda de ${pet.name}`)}
          >
            ⬇️ Descargar / compartir
          </button>
        </div>
      </div>
    </div>
  );
}
