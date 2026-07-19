import { useState } from 'react';
import Icon from './Icons';

// Onboarding de primera apertura: 4 pantallas que explican la guardia
// ciudadana en 20 segundos. Se muestra una sola vez (flag en el dispositivo).
const SLIDES = [
  {
    icon: 'paw',
    tint: 'var(--color-warning-soft)',
    color: 'var(--color-primary)',
    title: 'Bienvenido a la guardia',
    text: 'Patrulla Patitas une a los vecinos para encontrar mascotas perdidas en minutos.',
  },
  {
    icon: 'alert',
    tint: 'var(--color-danger-soft)',
    color: 'var(--color-danger-text)',
    title: 'Un botón, todos alerta',
    text: 'Si tu mascota se pierde, publica la alerta: los vecinos cercanos la reciben al instante y el radio de búsqueda crece solo.',
  },
  {
    icon: 'eye',
    tint: 'var(--color-info-soft)',
    color: 'var(--color-info-text)',
    title: 'Cada ojo suma',
    text: 'Si ves una mascota perdida, marca el punto en el mapa. Su rastro guía a la familia hasta ella.',
  },
  {
    icon: 'heart',
    tint: 'var(--color-success-soft)',
    color: 'var(--color-success)',
    title: 'Gratis, hoy y siempre',
    text: 'El rescate nunca se cobra. Registra a tu mascota y duerme tranquilo: el barrio te cuida.',
  },
];

export default function Onboarding({ onDone }) {
  const [step, setStep] = useState(0);
  const slide = SLIDES[step];
  const last = step === SLIDES.length - 1;

  return (
    <div className="onboarding">
      <button className="onboarding-skip" onClick={onDone}>
        Saltar
      </button>

      <div className="onboarding-body" key={step}>
        <span className="onboarding-illu" style={{ background: slide.tint, color: slide.color }}>
          <Icon name={slide.icon} size={56} strokeWidth={1.6} />
        </span>
        <h2>{slide.title}</h2>
        <p>{slide.text}</p>
      </div>

      <div className="onboarding-footer">
        <div className="onboarding-dots">
          {SLIDES.map((_, i) => (
            <span key={i} className={`dot${i === step ? ' active' : ''}`} />
          ))}
        </div>
        <button className="btn btn-primary btn-big" onClick={() => (last ? onDone() : setStep(step + 1))}>
          {last ? 'Empezar' : 'Siguiente'}
        </button>
      </div>
    </div>
  );
}
