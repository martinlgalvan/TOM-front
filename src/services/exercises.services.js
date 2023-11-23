
/*---------------------------------------------------*/

//Obtiene todos los ejercicios

async function findExercises(id) {
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
}

//Agrega un ejercicio a un día 

async function addExerciseToDay(week_id,day_id, exercise) {
    return fetch(`https://tom-api-git-main-martinlgalvan.vercel.app/api/week/${week_id}/day/${day_id}/exercises`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(exercise)
    })
        .then(response => response.json())
}

//Agrega un amrap a un día 

async function addAmrap(week_id,day_id, amrap) {
    return fetch(`https://tom-api-git-main-martinlgalvan.vercel.app/api/week/${week_id}/day/${day_id}/exercises/amrap`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(amrap)
    })
        .then(response => response.json())
}

//Editar un ejercicio del amrap

async function editExerciseAmrap(week_id,day_id,exercise_id, amrap) {
    return fetch(`https://tom-api-git-main-martinlgalvan.vercel.app/api/week/${week_id}/day/${day_id}/exercise/${exercise_id}/amrap`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(amrap)
    })
        .then(response => response.json())
}




//Elimina un ejercicio dependiendo el día y el ejercicio
async function deleteExercise(week_id, day_id, exercise_id) {
    return fetch(`https://tom-api-git-main-martinlgalvan.vercel.app/api/week/${week_id}/day/${day_id}/exercise/${exercise_id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('token')
        },
    })
        .then(response => response.json())
}


async function editExercise(week_id, day_id, exercise) {
    return fetch(`https://tom-api-git-main-martinlgalvan.vercel.app/api/week/${week_id}/day/${day_id}/exercise`, {
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

async function editExerciseMobile(week_id, day_id, exercise_id, exercise) {
    return fetch(`https://tom-api-git-main-martinlgalvan.vercel.app/api/week/${week_id}/day/${day_id}/exercises/${exercise_id}`, {
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






export {
    addExerciseToDay,
    addAmrap,
    editExerciseAmrap,
    editExercise,
    editExerciseMobile,
    findExercises,
    deleteExercise,
}