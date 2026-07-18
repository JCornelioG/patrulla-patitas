export default function LostConfirmModal({ pet, onCancel, onConfirm }) {
  return (
    <div className="overlay">
      <div className="modal">
        <h3>😿 ¿Se perdió {pet.name}?</h3>
        <p>
          Vamos a marcar tu zona actual (aproximada) como última ubicación conocida y a alertar de inmediato a
          los vecinos más cercanos. Si no aparece, el radio de alerta se expande solo con el tiempo.
        </p>
        <p className="privacy-note">🔒 Nunca compartimos tu dirección exacta, solo una zona aproximada.</p>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel}>
            Cancelar
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            🚨 SÍ, ACTIVAR ALERTA
          </button>
        </div>
      </div>
    </div>
  );
}
