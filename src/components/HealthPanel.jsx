import { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import PetAvatar from './PetAvatar';
import Icon from './Icons';
import { getHealth, saveHealth, RECORD_TYPES, REPEAT_OPTIONS } from '../services/health';
import { scheduleReminder, cancelReminder } from '../services/notifications';
import { formatDate } from '../utils/geo';

const TABS = [
  { id: 'registros', label: 'Registros', icon: 'clipboard' },
  { id: 'peso', label: 'Peso', icon: 'scale' },
  { id: 'recordatorios', label: 'Recordatorios', icon: 'bellRing' },
];

const RECORD_ICON = {
  Vacuna: 'pill',
  Antiparasitario: 'pill',
  Consulta: 'health',
  Medicación: 'pill',
  Otro: 'clipboard',
};

// Cartilla sanitaria (Patitas Plus): registros médicos, curva de peso y
// recordatorios con notificación local. Datos privados, en el dispositivo.
export default function HealthPanel({ pet, initialTab = 'registros', onClose }) {
  const [tab, setTab] = useState(initialTab);
  const [health, setHealthState] = useState(() => getHealth(pet.id));
  const [adding, setAdding] = useState(false);

  function update(next) {
    setHealthState(next);
    saveHealth(pet.id, next);
  }

  async function add(kind, item) {
    const withId = { id: `${kind}-${Date.now()}`, ...item };
    update({ ...health, [kind]: [...health[kind], withId] });
    if (kind === 'reminders') await scheduleReminder(withId, pet.name);
    setAdding(false);
  }

  function remove(kind, id) {
    if (kind === 'reminders') cancelReminder(id);
    update({ ...health, [kind]: health[kind].filter((x) => x.id !== id) });
  }

  const records = [...health.records].sort((a, b) => b.date - a.date);
  const weights = [...health.weights].sort((a, b) => a.date - b.date);
  const reminders = [...health.reminders].sort((a, b) => a.at - b.at);

  return (
    <div className="detail panel">
      <div className="detail-top">
        <button className="btn-back" onClick={onClose} aria-label="Volver">
          <Icon name="back" size={20} />
        </button>
        <span className="detail-title">
          Cartilla de {pet.name}
          <span className="status-chip st-seen">Plus</span>
        </span>
      </div>

      <div className="tabs-row">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`fchip${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <Icon name={t.icon} size={16} />
            {t.label}
          </button>
        ))}
      </div>

      <div className="detail-scroll">
        <p className="meta" style={{ marginTop: 0 }}>
          {tab === 'registros' && 'Vacunas, tratamientos y consultas: el historial completo de salud.'}
          {tab === 'peso' && 'Registra el peso en cada control para seguir su evolución.'}
          {tab === 'recordatorios' && 'Nunca más una vacuna vencida: te avisamos a tiempo.'}
        </p>

        {tab === 'registros' && (
          <>
            {records.length === 0 && <EmptyRow text="Todavía no hay registros" icon="clipboard" />}
            {records.map((r) => (
              <div className="sight-row" key={r.id}>
                <span className="icon-chip">
                  <Icon name={RECORD_ICON[r.type] ?? 'clipboard'} size={20} />
                </span>
                <div style={{ flex: 1 }}>
                  <strong>{r.name}</strong> <span className="meta">· {r.type}</span>
                  <p className="time-note">
                    {formatDate(r.date)}
                    {r.notes ? ` · ${r.notes}` : ''}
                  </p>
                </div>
                <button className="row-del" onClick={() => remove('records', r.id)} aria-label="Eliminar">
                  <Icon name="x" size={16} />
                </button>
              </div>
            ))}
          </>
        )}

        {tab === 'peso' && (
          <>
            {weights.length === 0 && <EmptyRow text="Sin pesos registrados" icon="scale" />}
            {weights.map((w, i) => {
              const prev = weights[i - 1];
              const delta = prev ? w.kg - prev.kg : 0;
              return (
                <div className="sight-row" key={w.id}>
                  <span className="icon-chip">
                    <Icon name="scale" size={20} />
                  </span>
                  <div style={{ flex: 1 }}>
                    <strong>{w.kg} kg</strong>
                    {prev && (
                      <span className="meta">
                        {' '}
                        ({delta >= 0 ? '+' : ''}
                        {delta.toFixed(1)} kg)
                      </span>
                    )}
                    <p className="time-note">{formatDate(w.date)}</p>
                  </div>
                  <button className="row-del" onClick={() => remove('weights', w.id)} aria-label="Eliminar">
                    <Icon name="x" size={16} />
                  </button>
                </div>
              );
            })}
          </>
        )}

        {tab === 'recordatorios' && (
          <>
            {!Capacitor.isNativePlatform() && (
              <p className="privacy-note">
                <Icon name="bell" size={15} />
                Las notificaciones suenan en la app instalada en tu teléfono; en la web los
                recordatorios solo se guardan.
              </p>
            )}
            {reminders.length === 0 && <EmptyRow text="Sin recordatorios" icon="bellRing" />}
            {reminders.map((r) => (
              <div className="sight-row" key={r.id}>
                <span className="icon-chip">
                  <Icon name="bellRing" size={20} />
                </span>
                <div style={{ flex: 1 }}>
                  <strong>{r.title}</strong>
                  <p className="time-note">
                    Próximo: {formatDate(r.at)} ·{' '}
                    {REPEAT_OPTIONS.find((o) => o.id === r.repeat)?.label ?? 'Una sola vez'}
                  </p>
                </div>
                <button className="row-del" onClick={() => remove('reminders', r.id)} aria-label="Eliminar">
                  <Icon name="x" size={16} />
                </button>
              </div>
            ))}
          </>
        )}

        <button className="btn btn-primary btn-big" onClick={() => setAdding(true)}>
          <Icon name="plus" size={18} />
          Agregar {tab === 'registros' ? 'registro' : tab === 'peso' ? 'peso' : 'recordatorio'}
        </button>
      </div>

      {adding && tab === 'registros' && <RecordForm onCancel={() => setAdding(false)} onSave={(d) => add('records', d)} />}
      {adding && tab === 'peso' && <WeightForm onCancel={() => setAdding(false)} onSave={(d) => add('weights', d)} />}
      {adding && tab === 'recordatorios' && (
        <ReminderForm onCancel={() => setAdding(false)} onSave={(d) => add('reminders', d)} />
      )}
    </div>
  );
}

function EmptyRow({ text, icon }) {
  return (
    <div className="empty-state">
      <span className="empty-illu">
        <Icon name={icon} size={30} />
      </span>
      <p>{text}</p>
    </div>
  );
}

function dateToMs(value) {
  if (!value) return Date.now();
  // Un input type="date" ('YYYY-MM-DD') se parsea como medianoche UTC, lo que
  // en Perú (UTC-5) retrocede la fecha un día. Anclamos al mediodía local.
  return new Date(value.length === 10 ? `${value}T12:00` : value).getTime();
}

function todayInput() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function RecordForm({ onCancel, onSave }) {
  const [form, setForm] = useState({ type: 'Vacuna', name: '', date: todayInput(), notes: '' });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <div className="overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Nuevo registro">
        <div className="sheet-grip" />
        <h3>Nuevo registro</h3>
        <div className="field">
          <span className="label">Tipo</span>
          <select value={form.type} onChange={(e) => set('type', e.target.value)}>
            {RECORD_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <span className="label">Nombre *</span>
          <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Antirrábica" />
        </div>
        <div className="field">
          <span className="label">Fecha</span>
          <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
        </div>
        <div className="field">
          <span className="label">Notas</span>
          <input value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Veterinaria, lote, dosis…" />
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            disabled={!form.name.trim()}
            onClick={() => onSave({ type: form.type, name: form.name.trim(), date: dateToMs(form.date), notes: form.notes.trim() })}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

function WeightForm({ onCancel, onSave }) {
  const [kg, setKg] = useState('');
  const [date, setDate] = useState(todayInput());
  const valid = Number(kg) > 0;
  return (
    <div className="overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Nuevo peso">
        <div className="sheet-grip" />
        <h3>Nuevo peso</h3>
        <div className="field-row">
          <div className="field">
            <span className="label">Peso (kg) *</span>
            <input type="number" step="0.1" min="0" value={kg} onChange={(e) => setKg(e.target.value)} placeholder="4.5" />
          </div>
          <div className="field">
            <span className="label">Fecha</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button className="btn btn-primary" disabled={!valid} onClick={() => onSave({ kg: Number(kg), date: dateToMs(date) })}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

function ReminderForm({ onCancel, onSave }) {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset() + 60);
  const [form, setForm] = useState({ title: '', at: now.toISOString().slice(0, 16), repeat: 'none' });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <div className="overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Nuevo recordatorio">
        <div className="sheet-grip" />
        <h3>Nuevo recordatorio</h3>
        <div className="field">
          <span className="label">Título *</span>
          <input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Pipeta antipulgas" />
        </div>
        <div className="field">
          <span className="label">Fecha y hora</span>
          <input type="datetime-local" value={form.at} onChange={(e) => set('at', e.target.value)} />
        </div>
        <div className="field">
          <span className="label">Repetición</span>
          <select value={form.repeat} onChange={(e) => set('repeat', e.target.value)}>
            {REPEAT_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            disabled={!form.title.trim()}
            onClick={() => onSave({ title: form.title.trim(), at: dateToMs(form.at), repeat: form.repeat })}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
