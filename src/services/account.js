import { Capacitor } from '@capacitor/core';
import {
  GoogleAuthProvider,
  OAuthProvider,
  linkWithPopup,
  linkWithCredential,
  signInWithCredential,
  signInWithPopup,
} from 'firebase/auth';
import { firebaseAuth } from './firebaseApp';

// Vinculación de la cuenta anónima con Apple/Google.
//
// Por qué: la identidad anónima vive en el dispositivo; si el usuario cambia
// de teléfono o reinstala, pierde sus mascotas. Al VINCULAR (link), el uid no
// cambia y sus datos quedan recuperables: en otro dispositivo inicia con el
// mismo proveedor y vuelve a ser el mismo usuario.
//
// Un solo flujo cubre ambos casos:
//  - Usuario nuevo   → link: la cuenta anónima queda protegida.
//  - Usuario que vuelve → el link falla con credential-already-in-use y
//    entramos directamente a su cuenta existente (status 'switched'; la app
//    se recarga para resuscribirse con el uid recuperado).
//
// IMPORTANTE: importar este módulo solo con import() dinámico para no meter
// el SDK de Firebase en el bundle principal.

function makeProvider(name) {
  return name === 'google' ? new GoogleAuthProvider() : new OAuthProvider('apple.com');
}

export function getAccountInfo() {
  const user = firebaseAuth().currentUser;
  const federated = user?.providerData?.find((p) => p.providerId !== 'firebase');
  if (!federated) return { linked: false };
  return {
    linked: true,
    email: federated.email ?? user.email ?? '',
    providerId: federated.providerId,
  };
}

// En la app nativa el popup web no existe: el plugin de Capacitor hace el
// login nativo (hoja de Apple / selector de cuentas de Google) y nos da la
// credencial para vincularla al usuario anónimo actual.
async function nativeCredential(name) {
  const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication');
  if (name === 'google') {
    const result = await FirebaseAuthentication.signInWithGoogle({ skipNativeAuth: true });
    return GoogleAuthProvider.credential(result.credential?.idToken);
  }
  const result = await FirebaseAuthentication.signInWithApple({ skipNativeAuth: true });
  return new OAuthProvider('apple.com').credential({
    idToken: result.credential?.idToken,
    rawNonce: result.credential?.nonce,
  });
}

export async function linkOrSignIn(name) {
  const auth = firebaseAuth();
  try {
    if (Capacitor.isNativePlatform()) {
      const credential = await nativeCredential(name);
      await linkWithCredential(auth.currentUser, credential);
    } else {
      await linkWithPopup(auth.currentUser, makeProvider(name));
    }
    return { status: 'linked', ...getAccountInfo() };
  } catch (err) {
    // La cuenta de Apple/Google ya pertenece a otro usuario de la app:
    // es alguien que vuelve. Entramos con su cuenta existente.
    if (err?.code === 'auth/credential-already-in-use') {
      const credential =
        GoogleAuthProvider.credentialFromError(err) ?? OAuthProvider.credentialFromError(err);
      if (credential) {
        await signInWithCredential(auth, credential);
      } else {
        await signInWithPopup(auth, makeProvider(name));
      }
      return { status: 'switched' };
    }
    if (
      err?.code === 'auth/popup-closed-by-user' ||
      err?.code === 'auth/cancelled-popup-request' ||
      err?.code === 'auth/user-cancelled'
    ) {
      return { status: 'cancelled' };
    }
    if (err?.code === 'auth/operation-not-allowed') {
      return {
        status: 'error',
        message: 'Este método aún no está habilitado. Actívalo en la consola de Firebase.',
      };
    }
    if (err?.code === 'auth/popup-blocked') {
      return { status: 'error', message: 'El navegador bloqueó la ventana. Permite popups e intenta de nuevo.' };
    }
    console.warn('No se pudo vincular la cuenta:', err);
    return { status: 'error', message: 'No se pudo vincular la cuenta. Intenta de nuevo.' };
  }
}
