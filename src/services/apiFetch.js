const PROD_API_BASE = 'https://tom-api-udqr-git-main-martinlgalvans-projects.vercel.app'

export const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (import.meta.env.DEV ? 'http://localhost:2022' : PROD_API_BASE)

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

async function refreshAccessToken() {
  const res = await fetch(buildApiUrl('/api/auth/refresh'), {
    method: 'POST',
    credentials: 'include'
  })
  if (!res.ok) return null
  const data = await res.json()
  if (data?.token) {
    localStorage.setItem('token', data.token)
    return data.token
  }
  return null
}

function getRefreshPromise() {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

function emitAuthExpired() {
  if (typeof window !== 'undefined') {
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

  // intento refresh
  const newToken = await getRefreshPromise()
  if (!newToken) {
    emitAuthExpired()
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
