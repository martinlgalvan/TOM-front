async function generateQR(user_id) {
    return fetch(`https://tom-api-udqr-git-main-martinlgalvans-projects.vercel.app/api/generate-qr/${user_id}`, {
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
                throw Error('La contraseña o el email son incorrectos. Por favor ingrese una cuenta válida.')
            }
        })
}

async function loginWithQR(token) {
    return fetch('https://tom-api-udqr-git-main-martinlgalvans-projects.vercel.app/api/qr-login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }), // Envia el token en el cuerpo de la solicitud
    })
        .then(async (response) => {
            if (response.ok) {
                return response.json(); // Devuelve los datos del usuario y el JWT
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Error al iniciar sesión con el QR.');
            }
        });
}

export {
    generateQR,
    loginWithQR
}