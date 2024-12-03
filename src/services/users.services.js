//Busca los alumnos del entrenador(que tienen entrenador_id)
async function find(id) {
    return fetch(`https://tom-api-udqr-git-main-martinlgalvans-projects.vercel.app/api/users/${id}`, {
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
    return fetch(`https://tom-api-udqr-git-main-martinlgalvans-projects.vercel.app/api/users/${id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(user)
    })
    .then(async response => {
        if (response.ok) {
            return response.json(); // Devuelve los datos si la creación es exitosa
        } 
        else if (response.status === 403) {
            // Código de error 403: Manejo de límite de usuarios
            const errorResponse = await response.json();
            throw new Error(errorResponse.message || 'Límite de usuarios alcanzado. No puedes crear más usuarios.');
        } 
        else if (response.status === 400) {
            // Código de error 400: Manejo de email duplicado
            const errorResponse = await response.json();
            if (errorResponse.message.includes('email')) {
                throw new Error('El email que ingresaste ya existe. Por favor, ingresá otro.');
            }
            throw new Error(errorResponse.message || 'Error de validación en los datos proporcionados.');
        } 
        else {
            // Otros errores no manejados
            throw new Error('Ocurrió un error inesperado. Por favor, intentá de nuevo.');
        }
    });
}


//Elimino alumnos
async function deleteUser(id) {
    return fetch(`https://tom-api-udqr-git-main-martinlgalvans-projects.vercel.app/api/user/${id}`, {
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
    try {
        const response = await fetch(`https://tom-api-udqr-git-main-martinlgalvans-projects.vercel.app/api/user/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'auth-token': localStorage.getItem('token')
            }
        });
        
        if (response.ok) {
            return response.json();
        } else {
            const errorMessage = await response.text();
            throw new Error(errorMessage || 'No se pudo obtener el usuario');
        }
    } catch (error) {
        throw new Error(`Error en la solicitud: ${error.message}`);
    }
}




//--------------------------------------------------------------------//





//Encontrar días
async function findDays(id) {
    return fetch(`https://tom-api-udqr-git-main-martinlgalvans-projects.vercel.app/api/users/routine/${id}/createDay`, {
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
    return fetch(`https://tom-api-udqr-git-main-martinlgalvans-projects.vercel.app/api/day/${id}/exercise`, {
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
    return fetch(`https://tom-api-udqr-git-main-martinlgalvans-projects.vercel.app/api/day/${id}/exercise`, {
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
    return fetch(`https://tom-api-udqr-git-main-martinlgalvans-projects.vercel.app/api/day/${idDay}/exercise/${idExercise}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('token')
        },
    })
        .then(response => response.json())
}


async function editExercise(idDay, idExercise, exercise) {
    return fetch(`https://tom-api-udqr-git-main-martinlgalvans-projects.vercel.app/api/day/${idDay}/exercise/${idExercise}`, {
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
    return fetch(`https://tom-api-udqr-git-main-martinlgalvans-projects.vercel.app/api/user/${id}/routine`, {
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


//Busca los alumnos del entrenador(que tienen entrenador_id)
async function getProfileById(id) {
    return fetch(`https://tom-api-udqr-git-main-martinlgalvans-projects.vercel.app/api/user/${id}/routine/clon`, {
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



async function editProfile(user_id, data) {
    return fetch(`https://tom-api-udqr-git-main-martinlgalvans-projects.vercel.app/api/user/${user_id}/routine`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(data)
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
    findRoutineById,
    getProfileById,
    editProfile
}