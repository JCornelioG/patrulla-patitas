import { useState } from 'react';
import { getProfile, saveProfile } from '../services/profile';
import { pickPhoto } from '../utils/photo';

// Avatares ilustrados de respaldo cuando no se sube foto.
const AVATARS = [
  { emoji: '🐶', bg: '#FDE2CF' },
  { emoji: '🐕', bg: '#F9D9B8' },
  { emoji: '🐩', bg: '#F5E6D3' },
  { emoji: '🐱', bg: '#E8DFF5' },
  { emoji: '🐈', bg: '#D9EDE1' },
  { emoji: '🐰', bg: '#FCE1EA' },
  { emoji: '🦜', bg: '#D8ECF8' },
];

export default function PetFormModal({ onCancel, onSave }) {
  const profile = getProfile();
  const [form, setForm] = useState({
    name: '',
    species: 'Perro',
    pronoun: 'o',
    breed: '',
    color: '',
    size: 'Mediano',
    description: '',
    avatar: 0,
    ownerName: profile.name ?? '',
    ownerPhone: profile.phone ?? '',
  });
  const [photo, setPhoto] = useState(null); // dataURL comprimido
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function choosePhoto() {
    try {
      const dataUrl = await pickPhoto();
      if (dataUrl) setPhoto(dataUrl);
    } catch (err) {
      console.warn('No se pudo elegir la foto:', err);
    }
  }

  function save() {
    if (!form.name.trim() || saving) return;
    setSaving(true);
    const av = AVATARS[form.avatar];
    // Recordamos el contacto para la próxima vez.
    saveProfile({ name: form.ownerName.trim(), phone: form.ownerPhone.trim() });
    onSave({
      name: form.name.trim(),
      species: form.species,
      pronoun: form.pronoun,
      breed: form.breed.trim() || 'Mestizo',
      color: form.color.trim() || 'Sin especificar',
      size: form.size,
      description: form.description.trim() || 'Sin descripción todavía.',
      emoji: av.emoji,
      bg: av.bg,
      photoDataUrl: photo,
      ownerName: form.ownerName.trim() || 'Vecino de la guardia',
      ownerPhone: form.ownerPhone.trim(),
    });
  }

  return (
    <div className="overlay">
      <div className="modal">
        <h3>🐾 Nueva mascota</h3>

        <div className="field">
          <span className="label">Foto</span>
          {photo ? (
            <div className="photo-row">
              <img className="photo-preview" src={photo} alt="Foto elegida" />
              <button type="button" className="btn btn-ghost" onClick={() => setPhoto(null)}>
                Quitar
              </button>
            </div>
          ) : (
            <button type="button" className="btn btn-ghost" onClick={choosePhoto}>
              📷 Agregar foto
            </button>
          )}
        </div>

        {!photo && (
          <div className="field">
            <span className="label">Avatar (si no hay foto)</span>
            <div className="emoji-row">
              {AVATARS.map((a, i) => (
                <button
                  key={a.emoji}
                  type="button"
                  className={`emoji-opt${form.avatar === i ? ' sel' : ''}`}
                  style={{ background: a.bg }}
                  onClick={() => set('avatar', i)}
                >
                  {a.emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="field">
          <span className="label">Nombre *</span>
          <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Firulais" />
        </div>

        <div className="field-row">
          <div className="field">
            <span className="label">Especie</span>
            <select value={form.species} onChange={(e) => set('species', e.target.value)}>
              <option>Perro</option>
              <option>Gato</option>
              <option>Otro</option>
            </select>
          </div>
          <div className="field">
            <span className="label">Tamaño</span>
            <select value={form.size} onChange={(e) => set('size', e.target.value)}>
              <option>Pequeño</option>
              <option>Mediano</option>
              <option>Grande</option>
            </select>
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <span className="label">Raza</span>
            <input value={form.breed} onChange={(e) => set('breed', e.target.value)} placeholder="Mestizo" />
          </div>
          <div className="field">
            <span className="label">Color</span>
            <input value={form.color} onChange={(e) => set('color', e.target.value)} placeholder="Marrón" />
          </div>
        </div>

        <div className="field">
          <span className="label">¿Cómo hablamos de tu mascota?</span>
          <div className="pronoun-row">
            <button
              type="button"
              className={`chip chip-toggle${form.pronoun === 'o' ? ' sel' : ''}`}
              onClick={() => set('pronoun', 'o')}
            >
              Perdido
            </button>
            <button
              type="button"
              className={`chip chip-toggle${form.pronoun === 'a' ? ' sel' : ''}`}
              onClick={() => set('pronoun', 'a')}
            >
              Perdida
            </button>
          </div>
        </div>

        <div className="field">
          <span className="label">Descripción / señas particulares</span>
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="Collar, cicatrices, comportamiento…"
          />
        </div>

        <div className="field-row">
          <div className="field">
            <span className="label">Tu nombre</span>
            <input value={form.ownerName} onChange={(e) => set('ownerName', e.target.value)} placeholder="José" />
          </div>
          <div className="field">
            <span className="label">Tu teléfono</span>
            <input
              value={form.ownerPhone}
              onChange={(e) => set('ownerPhone', e.target.value)}
              placeholder="+51 999 999 999"
              inputMode="tel"
            />
          </div>
        </div>
        <p className="privacy-note">
          🔒 Tu teléfono solo se muestra en la alerta si tu mascota se pierde, para que puedan avisarte.
        </p>

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={save} disabled={!form.name.trim() || saving}>
            {saving ? 'Guardando…' : 'Guardar 🐾'}
          </button>
        </div>
      </div>
    </div>
  );
}
