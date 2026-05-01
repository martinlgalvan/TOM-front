const DEV_API_BASE = (import.meta.env.VITE_API_BASE || '').trim()

// En produccion usamos siempre /api sobre el mismo dominio para no depender
// de cookies cross-site. En desarrollo podes overridear con VITE_API_BASE.
export const API_BASE = import.meta.env.DEV ? DEV_API_BASE : ''

export function buildApiUrl(path = '') {
  if (!path) return API_BASE
  if (path.startsWith('http')) return path
  return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`
}

export function authJsonHeaders(extra = {}) {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'auth-token': token } : {}),
    ...extra
  }
}

let refreshPromise = null
let refreshPromiseToken = null

async function refreshAccessToken(expectedToken) {
  const res = await fetch(buildApiUrl('/api/auth/refresh'), {
    method: 'POST',
    credentials: 'include'
  })
  if (!res.ok) return null
  const data = await res.json()
  if (data?.token) {
    const currentToken = localStorage.getItem('token')
    if (!expectedToken || !currentToken || currentToken === expectedToken) {
      localStorage.setItem('token', data.token)
    }
    return data.token
  }
  return null
}

function getRefreshPromise(expectedToken) {
  if (!refreshPromise || refreshPromiseToken !== expectedToken) {
    refreshPromiseToken = expectedToken
    refreshPromise = refreshAccessToken(expectedToken).finally(() => {
      if (refreshPromiseToken === expectedToken) {
        refreshPromise = null
        refreshPromiseToken = null
      }
    })
  }
  return refreshPromise
}

function emitAuthExpired(requestToken) {
  if (typeof window !== 'undefined' && requestToken && localStorage.getItem('token') === requestToken) {
    window.dispatchEvent(new CustomEvent('tom-auth-expired'))
  }
}

export async function apiFetch(path, options = {}) {
  const url = buildApiUrl(path)

  const token = localStorage.getItem('token')
  const headers = {
    ...(options.headers || {}),
    ...(token ? { 'auth-token': token } : {})
  }

  const first = await fetch(url, {
    ...options,
    headers,
    credentials: 'include' // CLAVE (manda refresh cookie)
  })

  if (first.status !== 401) return first

  const currentToken = localStorage.getItem('token')
  if (token && currentToken && currentToken !== token) {
    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        'auth-token': currentToken
      },
      credentials: 'include'
    })
  }

  // intento refresh
  const newToken = await getRefreshPromise(token)
  if (!newToken) {
    emitAuthExpired(token)
    return first
  }

  if (token && localStorage.getItem('token') !== token && localStorage.getItem('token') !== newToken) {
    return first
  }

  // reintento request original con token nuevo
  const headers2 = {
    ...(options.headers || {}),
    'auth-token': newToken
  }

  return fetch(url, {
    ...options,
    headers: headers2,
    credentials: 'include'
  })
}
