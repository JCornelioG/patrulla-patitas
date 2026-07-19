import { useState } from 'react';
import Icon from './Icons';

export default function SightingModal({ pet, onCancel, onConfirm }) {
  const [note, setNote] = useState('');

  return (
    <div className="overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Confirmar avistamiento">
        <div className="sheet-grip" />
        <h3>Viste a {pet.name}</h3>
        <p className="sheet-sub">
          Vamos a marcar la zona en el mapa con la hora actual. El dueño y los vecinos lo ven al
          instante.
        </p>
        <textarea
          rows={3}
          autoFocus
          aria-label="Nota del avistamiento"
          placeholder="Nota opcional: ¿hacia dónde iba? ¿cómo estaba?"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={() => onConfirm(note.trim())}>
            <Icon name="check" size={16} />
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
