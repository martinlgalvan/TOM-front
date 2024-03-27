async function getColumns(user_id) {
    return fetch(`https://tom-api-udqr-git-main-martinlgalvans-projects.vercel.app/api/${user_id}/columns`, {
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

//Crea un dia
async function createColumn(data, user_id) {
    return fetch(`https://tom-api-udqr-git-main-martinlgalvans-projects.vercel.app/api/${user_id}/columns`, {
        method: 'POST',
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
            throw new Error('No se pudo crear el dia')
        }
    })
}


//Editar un día

async function editColumn(column_id, updatedData) {
    return fetch(`https://tom-api-udqr-git-main-martinlgalvans-projects.vercel.app/api/column/${column_id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(updatedData)
    })
    .then(response => {
        if (response.ok) {
            return response.json()
        }
        else {
            throw new Error('No se pudo editar el dia')
        }
    })
}

async function deleteColumn(column_id) {
    return fetch(`https://tom-api-udqr-git-main-martinlgalvans-projects.vercel.app/api/column/${column_id}`, {
        method: 'DELETE',
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
            throw new Error('No se pudo eliminar el dia')
        }
    })
}


//Crea un dia
async function createExerciseInColumn(column_id, data) {
    return fetch(`https://tom-api-udqr-git-main-martinlgalvans-projects.vercel.app/api/column/${column_id}`, {
        method: 'POST',
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
            throw new Error('No se pudo crear el dia')
        }
    })
}


//
async function editExerciseInColumn(column_id, exercise_id, exercise) {
    return fetch(`https://tom-api-udqr-git-main-martinlgalvans-projects.vercel.app/api/column/${column_id}/exercise/${exercise_id}`, {
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
            throw new Error('No se pudo crear el dia')
        }
    })
}


async function deleteExerciseInColumn(idColumn, idExercise) {
    return fetch(`https://tom-api-udqr-git-main-martinlgalvans-projects.vercel.app/api/column/${idColumn}/exercise/${idExercise}`, {
        method: 'DELETE',
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
            throw new Error('No se pudo eliminar el dia')
        }
    })
}


export {
    getColumns,
    createColumn,
    editColumn,
    deleteColumn,

    createExerciseInColumn,
    editExerciseInColumn,
    deleteExerciseInColumn
}