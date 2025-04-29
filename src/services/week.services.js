//Busca la rutina de un alumno
async function findRoutineByUserId(user_id) {
    return fetch(`https://tom-api-udqr-git-main-martinlgalvans-projects.vercel.app/api/user/${user_id}/routine`, {
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
    return fetch(`https://tom-api-udqr-git-main-martinlgalvans-projects.vercel.app/api/user/${user_id}/routine`, {
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

async function createClonWeek(user_id, fecha) {
    return fetch(`https://tom-api-udqr-git-main-martinlgalvans-projects.vercel.app/api/user/${user_id}/routine/clon`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(fecha)
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
    return fetch(`https://tom-api-udqr-git-main-martinlgalvans-projects.vercel.app/api/week/${week_id}`, {
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

async function editWeek(week_id, routine) {
    return fetch(`https://tom-api-udqr-git-main-martinlgalvans-projects.vercel.app/api/week/${week_id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(routine)
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

async function assignBlockToRoutine(weekId, block) {
    return fetch(`https://tom-api-udqr-git-main-martinlgalvans-projects.vercel.app/api/week/${weekId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': localStorage.getItem('token')
      },
      body: JSON.stringify({
        week_id: weekId, // necesario para que el backend lo reconozca
        block
      })
    })
    .then(res => {
      if (!res.ok) throw new Error("Error actualizando bloque");
      return res.json();
    });
  }

async function editNameWeek(week_id, name) {
    return fetch(`https://tom-api-udqr-git-main-martinlgalvans-projects.vercel.app/api/week/${week_id}/day/`, {
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
    return fetch(`https://tom-api-udqr-git-main-martinlgalvans-projects.vercel.app/api/week/${week_id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('token')
        },
    })
        .then(response => response.json())
}



async function exportToExcel(data) {
    return fetch(`https://tom-api-udqr-git-main-martinlgalvans-projects.vercel.app/api/excel`, {
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



export {
    findRoutineByUserId,
    createWeek,
    createClonWeek,
    findByWeekId,
    editWeek,
    editNameWeek,
    deleteWeek,
    assignBlockToRoutine,

    exportToExcel
}