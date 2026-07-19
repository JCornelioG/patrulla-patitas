import { useState } from 'react';

// Onboarding de primera apertura: 4 pantallas que explican la guardia
// ciudadana en 20 segundos. Se muestra una sola vez (flag en el dispositivo).
const SLIDES = [
  {
    emoji: '🐾',
    title: '¡Bienvenido a la guardia!',
    text: 'Patrulla Patitas une a los vecinos para encontrar mascotas perdidas en minutos.',
  },
  {
    emoji: '🚨',
    title: 'Un botón, todos alerta',
    text: 'Si tu mascota se pierde, presiona SE PERDIÓ: los vecinos cercanos reciben la alerta al instante y el radio de búsqueda crece solo.',
  },
  {
    emoji: '👀',
    title: 'Cada ojo suma',
    text: '¿Viste una mascota perdida? Marca el punto en el mapa. Su rastro guía a la familia hasta ella.',
  },
  {
    emoji: '💛',
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

      {/* key={step} reinicia las animaciones de entrada en cada slide */}
      <div className="onboarding-body" key={step}>
        <span className="onboarding-emoji">{slide.emoji}</span>
        <h2>{slide.title}</h2>
        <p>{slide.text}</p>
      </div>

      <div className="onboarding-footer">
        <div className="onboarding-dots">
          {SLIDES.map((_, i) => (
            <span key={i} className={`dot${i === step ? ' active' : ''}`} />
          ))}
        </div>
        <button
          className="btn btn-primary btn-big"
          onClick={() => (last ? onDone() : setStep(step + 1))}
        >
          {last ? '¡Empezar! 🐾' : 'Siguiente'}
        </button>
      </div>
    </div>
  );
}
