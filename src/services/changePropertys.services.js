async function changeProperty(userId, category ) {
    return fetch(``https://tom-api-udqr-git-main-martinlgalvans-projects.vercel.app/api/user/${userId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify( { category } )
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


export {
    changeProperty
}