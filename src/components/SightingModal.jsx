import { useState } from 'react';

export default function SightingModal({ pet, onCancel, onConfirm }) {
  const [note, setNote] = useState('');

  return (
    <div className="overlay">
      <div className="modal">
        <h3>👀 Viste a {pet.name}</h3>
        <p className="muted small">
          Vamos a marcar la zona en el mapa con la hora actual. El dueño y los vecinos lo ven al instante.
        </p>
        <textarea
          rows={3}
          autoFocus
          placeholder="Nota opcional: ¿hacia dónde iba? ¿cómo estaba?"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={() => onConfirm(note.trim())}>
            ✅ Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
