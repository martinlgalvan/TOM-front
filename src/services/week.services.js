//Busca la rutina de un alumno
async function findRoutineByUserId(user_id) {
    return fetch(`https://tom-api-martinlgalvan.vercel.app/api/user/${user_id}/routine`, {
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
                throw new Error('No se pudo obtener las rutinas')
            }
        })
}


//Crea un dia
async function createWeek(name, user_id) {
    return fetch(`https://tom-api-martinlgalvan.vercel.app/api/user/${user_id}/routine`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(name)
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

async function createClonWeek(user_id) {
    return fetch(`https://tom-api-martinlgalvan.vercel.app/api/user/${user_id}/routine/clon`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('token')
        },
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

//Encuentra una semana por su ID
async function findByWeekId(week_id) {
    return fetch(`https://tom-api-martinlgalvan.vercel.app/api/week/${week_id}`, {
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
                throw new Error('No se pudo obtener los dias')
            }
        })
}

//Editar el nombre de una semana 

async function editWeek(week_id, name) {
    return fetch(`https://tom-api-martinlgalvan.vercel.app/api/week/${week_id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(name)
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



//Eliminar un día por su ID
async function deleteWeek(week_id) {
    return fetch(`https://tom-api-martinlgalvan.vercel.app/api/week/${week_id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('token')
        },
    })
        .then(response => response.json())
}




export {
    findRoutineByUserId,
    createWeek,
    createClonWeek,
    findByWeekId,
    editWeek,
    deleteWeek
}