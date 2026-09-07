import { apiFetch, requestRefreshSession } from './apiFetch.js'

const CREDENCIALES_INVALIDAS =
  'La contraseña o el email son incorrectos. Por favor ingrese una cuenta válida.'
const SERVIDOR_CAIDO =
  'No pudimos conectarnos con el servidor. Revisa tu conexion o intenta de nuevo en unos minutos.'

async function login(email, password) {
  // Antes cualquier respuesta no-OK decia "contrasena o email incorrectos",
  // asi que con la API caida (500) el entrenador creia haberse equivocado de
  // clave. Solo las respuestas que hablan de credenciales dicen eso ahora.
  let res
  try {
    res = await apiFetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
  } catch {
    // fetch solo lanza cuando no se pudo llegar al servidor
    throw Error(SERVIDOR_CAIDO)
  }

  if (!res.ok) {
    if (res.status === 400 || res.status === 401 || res.status === 403) {
      throw Error(CREDENCIALES_INVALIDAS)
    }
    throw Error(SERVIDOR_CAIDO)
  }

  return res.json()
}

async function logout() {
  const res = await apiFetch('/api/users/logout', {
    method: 'POST'
  })
  if (!res.ok) throw new Error('No se pudo cerrar sesión')
  return res.json()
}

async function refreshSession() {
  const data = await requestRefreshSession()
  if (!data?.token || !data?.user) return null
  return data
}

export { login, logout, refreshSession }
