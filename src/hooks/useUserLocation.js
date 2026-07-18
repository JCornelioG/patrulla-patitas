import { useEffect, useState } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { DEFAULT_LOCATION } from '../config/constants';

// Ubicación real del usuario vía GPS (plugin de Capacitor; en web usa
// navigator.geolocation). Mientras no haya permiso o señal, se usa la
// ubicación por defecto (Lima) para que la app nunca quede sin mapa.
export function useUserLocation() {
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [isReal, setIsReal] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pos = await Geolocation.getCurrentPosition({
          enableHighAccuracy: false,
          timeout: 8000,
          maximumAge: 60000,
        });
        if (!cancelled) {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setIsReal(true);
        }
      } catch {
        // Sin permiso o sin señal: seguimos con la ubicación por defecto.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { location, isReal };
}
