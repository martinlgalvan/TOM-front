import { API_BASE, apiFetch } from './apiFetch.js'

//Crea un dia
async function createDay(name, week_id) {
    return apiFetch(`${API_BASE}/api/week/${week_id}/day`, {
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


//Editar un dia

async function editDay(week_id, day_id, name) {
    return apiFetch(`${API_BASE}/api/week/${week_id}/day/${day_id}`, {
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

async function deleteDay(week_id, day_id) {
    return apiFetch(`${API_BASE}/api/week/${week_id}/day/${day_id}`, {
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
    createDay,
    editDay,
    deleteDay
}
