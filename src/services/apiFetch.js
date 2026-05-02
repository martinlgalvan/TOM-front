const ENV_API_BASE = (import.meta.env.VITE_API_BASE || '').trim().replace(/\/+$/, '')
const PROD_API_FALLBACK = 'https://tom-api-udqr-git-main-martinlgalvans-projects.vercel.app'

// Si existe VITE_API_BASE, lo usamos tanto en desarrollo como en produccion.
// En produccion, si falta esa env, usamos un fallback explicito a la API publicada.
// En desarrollo, si falta, caemos a mismo dominio/proxy local.
export const API_BASE = ENV_API_BASE || (import.meta.env.PROD ? PROD_API_FALLBACK : '')

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

export async function requestRefreshSession(expectedToken) {
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
    return data
  }
  return null
}

async function refreshAccessToken(expectedToken) {
  const data = await requestRefreshSession(expectedToken)
  return data?.token || null
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
