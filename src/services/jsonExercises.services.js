async function findJsonExercises() {
    return fetch(`http://tom-api-serverless.vercel.app/api/listExercises`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('token')
        }
    })
        .then(response => {
            if (response.ok) {
                return response.json()
            }
            else {
                throw new Error('No se pudo obtener los ejercicios')
            }
        })
}

export {
    findJsonExercises
}