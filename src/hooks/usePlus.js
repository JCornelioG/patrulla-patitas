import { useEffect, useState } from 'react';
import { isPlus, onPlusChange } from '../services/subscription';

// Estado reactivo de la suscripción Patitas Plus.
export function usePlus() {
  const [plus, setPlus] = useState(isPlus());
  useEffect(() => onPlusChange(setPlus), []);
  return plus;
}
