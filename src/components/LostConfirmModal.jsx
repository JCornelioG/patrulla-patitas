import Icon from './Icons';

export default function LostConfirmModal({ pet, onCancel, onConfirm }) {
  return (
    <div className="overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Confirmar alerta">
        <div className="sheet-grip" />
        <h3>¿Se perdió {pet.name}?</h3>
        <p>
          Vamos a marcar tu zona actual (aproximada) como última ubicación conocida y a alertar de
          inmediato a los vecinos más cercanos. Si no aparece, el radio de alerta se expande solo
          con el tiempo.
        </p>
        <p className="privacy-note">
          <Icon name="shield" size={15} />
          Nunca compartimos tu dirección exacta, solo una zona aproximada.
        </p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={onConfirm}>
            <Icon name="alert" size={16} />
            Activar alerta
          </button>
        </div>
      </div>
    </div>
  );
}
