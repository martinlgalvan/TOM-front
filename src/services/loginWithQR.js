import { API_BASE, apiFetch } from './apiFetch.js'

async function generateQR(user_id) {
    return apiFetch(`/api/generate-qr/${user_id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(async response => {
            if (response.ok) {
                return response.json()
            }
            else {
                throw Error('La contrasena o el email son incorrectos. Por favor ingrese una cuenta valida.')
            }
        })
}

 async function loginWithQR(qrToken) {
  const res = await fetch(`${API_BASE}/api/qr-login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ token: qrToken })
  });

  if (!res.ok) {
    // si el back manda { message }, lo mostramos
    let msg = 'Error al iniciar sesion con QR.';
    try {
      const data = await res.json();
      if (data?.message) msg = data.message;
    } catch (_) {}
    throw new Error(msg);
  }

  // ✅ Esperamos { token, user }
  return res.json();
}


export {
    generateQR,
    loginWithQR
}


