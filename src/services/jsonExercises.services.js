import { API_BASE, apiFetch } from './apiFetch.js'

async function findExercises(id) {
    return apiFetch(`${API_BASE}/api/exercises/${id}`, {
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

//Crea alumnos
async function createExercise(id, user) {
    return apiFetch(`${API_BASE}/api/exercises/${id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(user)
    })
    .then(async response => {
        if (response.ok) {
            return response.json()
        }
        else if (response.status === 400) {
            throw await response.json()
        }
        else {
            throw Error('No se puede crear el ejercicio')
        }
    })
}

//Editar un dia

async function editExercise(exercise_id, exercise) {
    return apiFetch(`${API_BASE}/api/exercises/${exercise_id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(exercise)
    })
    .then(response => {
        if (response.ok) {
            return response.json()
        }
        else {
            throw new Error('No se pudo editar el ejercicio')
        }
    })
}

//Eliminar un dia por su ID
async function deleteExercise(id) {
    return apiFetch(`${API_BASE}/api/exercises/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('token')
        },
    })
        .then(response => response.json())
}


export {
    findExercises,
    createExercise,
    editExercise,
    deleteExercise
}
