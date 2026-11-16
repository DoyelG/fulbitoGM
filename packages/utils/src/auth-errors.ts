const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/user-not-found': 'No encontramos una cuenta con ese email.',
  'auth/wrong-password': 'Email o contraseña incorrectos.',
  'auth/invalid-credential': 'Email o contraseña incorrectos.',
  'auth/invalid-login-credentials': 'Email o contraseña incorrectos.',
  'auth/invalid-email': 'El email no es válido.',
  'auth/missing-email': 'Ingresá tu email.',
  'auth/missing-password': 'Ingresá tu contraseña.',
  'auth/email-already-in-use': 'Ya existe una cuenta con ese email.',
  'auth/weak-password': 'La contraseña tiene que tener al menos 6 caracteres.',
  'auth/user-disabled': 'Esta cuenta está deshabilitada.',
  'auth/too-many-requests': 'Demasiados intentos. Esperá unos minutos y probá de nuevo.',
  'auth/network-request-failed': 'No hay conexión. Revisá tu internet y probá de nuevo.',
  'auth/operation-not-allowed': 'Este método de inicio de sesión no está habilitado.',
  'auth/popup-closed-by-user': 'Cerraste la ventana de Google antes de terminar.',
  'auth/cancelled-popup-request': 'Cerraste la ventana de Google antes de terminar.',
  'auth/popup-blocked': 'El navegador bloqueó la ventana de Google. Habilitá los pop-ups y probá de nuevo.',
  'auth/account-exists-with-different-credential':
    'Ya existe una cuenta con ese email usando otro método de inicio de sesión.',
}

const DEFAULT_AUTH_ERROR = 'No pudimos completar la operación. Probá de nuevo.'

function authErrorCode(error: unknown): string | null {
  if (typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string') {
    return error.code
  }
  if (error instanceof Error) {
    return error.message.match(/auth\/[a-z-]+/)?.[0] ?? null
  }
  return null
}

export function authErrorMessage(error: unknown): string {
  const code = authErrorCode(error)
  return (code && AUTH_ERROR_MESSAGES[code]) || DEFAULT_AUTH_ERROR
}
