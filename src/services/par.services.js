import { API_BASE, apiFetch } from './apiFetch.js'

async function getPAR(user_id) {
    return apiFetch(`${API_BASE}/api/user/${user_id}/routine/par`, {
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


//Crea un papr
async function createPAR(routine, user_id) {
    return apiFetch(`${API_BASE}/api/user/${user_id}/routine/par`, {
        method: 'POST',
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
            throw new Error('No se pudo crear el dia')
        }
    })
}

async function updatePAR(id, updatedPAR) {
    return apiFetch(`${API_BASE}/api/par/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('token'),
        },
        body: JSON.stringify(updatedPAR),
    }).then((response) => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('No se pudo actualizar el PAR');
        }
    });
}

async function deletePAR(id) {
    return apiFetch(`${API_BASE}/api/par/${id}`, {
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
            const errorMessage = response.text();
            throw new Error(errorMessage || 'No se pudo obtener el usuario');
        }
    
    })
}


async function createPARroutine(routine, user_id) {
    return apiFetch(`${API_BASE}/api/user/${user_id}/routine/par/week`, {
        method: 'POST',
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
            throw new Error('No se pudo crear el dia')
        }
    })
}

async function createProgressionsPARToUsers(template, userIds) {
    return apiFetch(`${API_BASE}/api/routine/progression/multi`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify({
            template,
            user_ids: userIds
        })
    })
    .then(response => {
        if (response.ok) {
            return response.json()
        }
        else {
            const errorMessage = response.text();
            throw new Error(errorMessage || 'No se pudo obtener el usuario');
        }
    })
}

async function createProgressionFromPAR(par_id) {
    return apiFetch(`${API_BASE}/api/par/${par_id}/progression`, {
        method: 'POST',
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
            const errorMessage = response.text();
            throw new Error(errorMessage || 'No se pudo obtener el usuario');
        }
    })
}





export {
    getPAR,
    createPAR,
    updatePAR,
    deletePAR,
    createPARroutine,
    createProgressionFromPAR,
    createProgressionsPARToUsers
    
}
