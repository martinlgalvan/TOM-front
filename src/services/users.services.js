//Busca los alumnos del entrenador(que tienen entrenador_id)
async function find(id) {
    return fetch(`https://tom-api-git-main-martinlgalvan.vercel.app/api/users/${id}`, {
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
                throw new Error('No se pudo obtener los usuarios')
            }
        })
}

//Crea alumnos
async function createAlumno(id, user) {
    return fetch(`https://tom-api-git-main-martinlgalvan.vercel.app/api/users/${id}`, {
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
            throw Error('El email que ingresaste ya existe. Por favor, ingresá otro.')
        }
    })
}

//Elimino alumnos
async function deleteUser(id) {
    return fetch(`https://tom-api-git-main-martinlgalvan.vercel.app/api/user/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('token')
        },
    })
        .then(response => response.json())
}

//Busca a un alumno
async function findUserById(id) {
    return fetch(`https://tom-api-git-main-martinlgalvan.vercel.app/api/user/${id}`, {
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
                throw new Error('No se pudo obtener los usuarios')
            }
        })
}




//--------------------------------------------------------------------//





//Encontrar días
async function findDays(id) {
    return fetch(`https://tom-api-git-main-martinlgalvan.vercel.app/api/users/routine/${id}/createDay`, {
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
                throw new Error('No se pudo obtener los días')
            }
        })
}

/*---------------------------------------------------*/

//Obtiene todos los ejercicios

/*async function findExercises(id) {
    return fetch(`https://tom-api-git-main-martinlgalvan.vercel.app/api/day/${id}/exercise`, {
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
}*/

//Agrega un ejercicio a un día 

async function addExerciseToDay(id, exercise) {
    return fetch(`https://tom-api-git-main-martinlgalvan.vercel.app/api/day/${id}/exercise`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(exercise)
    })
        .then(response => response.json())
}

//Elimina un ejercicio dependiendo el día y el ejercicio
async function deleteExercise(idDay, idExercise) {
    return fetch(`https://tom-api-git-main-martinlgalvan.vercel.app/api/day/${idDay}/exercise/${idExercise}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('token')
        },
    })
        .then(response => response.json())
}


async function editExercise(idDay, idExercise, exercise) {
    return fetch(`https://tom-api-git-main-martinlgalvan.vercel.app/api/day/${idDay}/exercise/${idExercise}`, {
        method: 'PUT',
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


//Busca los alumnos del entrenador(que tienen entrenador_id)
async function findRoutineById(id) {
    return fetch(`https://tom-api-git-main-martinlgalvan.vercel.app/api/user/${id}/routine`, {
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
                throw new Error('No se pudo obtener la rutina')
            }
        })
}


export {
    find,
    findUserById,
    createAlumno,
    deleteUser,
    findDays,
    addExerciseToDay,
    editExercise,
    //findExercises,
    deleteExercise,
    findRoutineById
}