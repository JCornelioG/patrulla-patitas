import { useEffect, useState } from 'react';
import Icon from './Icons';
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
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Flyer de búsqueda">
        <div className="sheet-grip" />
        <h3>Flyer de búsqueda</h3>
        {img ? (
          <img className="flyer-preview" src={img} alt={`Flyer de ${pet.name}`} />
        ) : (
          <div className="empty-state">
            <p>Generando flyer…</p>
          </div>
        )}

        {!isPlus && (
          <p className="privacy-note">
            <Icon name="sparkle" size={15} />
            Con <strong>Patitas Plus</strong> el flyer incluye un QR escaneable con tu contacto.{' '}
            <button type="button" className="link-btn" onClick={onOpenPaywall}>
              Ver Plus
            </button>
          </p>
        )}

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Cerrar
          </button>
          <button
            className="btn btn-primary"
            disabled={!img}
            onClick={() => saveOrShareImage(img, `se-perdio-${pet.name}.png`, `Flyer de búsqueda de ${pet.name}`)}
          >
            <Icon name="share" size={16} />
            Descargar / compartir
          </button>
        </div>
      </div>
    </div>
  );
}
