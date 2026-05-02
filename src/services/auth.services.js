import { apiFetch, requestRefreshSession } from './apiFetch.js'

async function login(email, password) {
  const res = await apiFetch('/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })

  if (!res.ok) {
    throw Error('La contrasena o el email son incorrectos. Por favor ingrese una cuenta valida.')
  }

  return res.json()
}

async function logout() {
  const res = await apiFetch('/api/users/logout', {
    method: 'POST'
  })
  if (!res.ok) throw new Error('No se pudo cerrar sesion')
  return res.json()
}

async function refreshSession() {
  const data = await requestRefreshSession()
  if (!data?.token || !data?.user) return null
  return data
}

export { login, logout, refreshSession }
