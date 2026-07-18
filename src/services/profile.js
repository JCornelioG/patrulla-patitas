// Perfil mínimo del usuario (nombre y teléfono de contacto), guardado en el
// dispositivo. No es una cuenta: la identidad la da la Auth anónima de
// Firebase. Se usa para prellenar el contacto al crear una mascota y para
// firmar avistamientos.

const KEY = 'pp-profile';

export function getProfile() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? {};
  } catch {
    return {};
  }
}

export function saveProfile(profile) {
  try {
    localStorage.setItem(KEY, JSON.stringify(profile));
  } catch {
    /* sin persistencia no pasa nada grave */
  }
}
