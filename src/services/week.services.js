import { API_BASE, apiFetch } from './apiFetch.js'

//Busca la rutina de un alumno
async function findRoutineByUserId(user_id) {
    return apiFetch(`${API_BASE}/api/user/${user_id}/routine`, {
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


//Crea una semana
async function createWeek(body, user_id) {
    // body tipicamente: { name: 'Semana X', visibility: 'visible' }
    return apiFetch(`${API_BASE}/api/user/${user_id}/routine`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(body)
    })
    .then(response => {
        if (response.ok) {
            return response.json()
        }
        else {
            throw new Error('No se pudo crear la semana')
        }
    })
}

async function createClonWeek(user_id, fecha) {
    return apiFetch(`${API_BASE}/api/user/${user_id}/routine/clon`, {
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
            throw new Error('No se pudo crear la semana clon')
        }
    })
}

//Encuentra una semana por su ID
async function findByWeekId(week_id) {
    return apiFetch(`${API_BASE}/api/week/${week_id}`, {
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
                throw new Error('No se pudo obtener la semana')
            }
        })
}

//Editar rutina completa (array de dias/ejercicios)
async function editWeek(week_id, routine) {
    return apiFetch(`${API_BASE}/api/week/${week_id}`, {
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
            throw new Error('No se pudo editar la rutina')
        }
    })
}

async function assignBlockToRoutine(weekId, block) {
    const normalizedBlock = block?.block === null && !block?._id ? null : block;

    return apiFetch(`${API_BASE}/api/week/${weekId}/properties`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify({
            block: normalizedBlock || null,
            block_id: normalizedBlock?._id || null
        })
    })
    .then(res => {
        if (!res.ok) throw new Error("Error actualizando bloque");
        return res.json();
    });
}

// Edita el nombre de una semana
async function editNameWeek(week_id, name) {
    return apiFetch(`${API_BASE}/api/week/${week_id}/day/`, {
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
            throw new Error('No se pudo editar el nombre de la semana')
        }
    })
}

//Eliminar una semana por su ID
async function deleteWeek(week_id) {
    return apiFetch(`${API_BASE}/api/week/${week_id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('token')
        },
    })
        .then(response => response.json())
}

async function exportToExcel(data) {
    return apiFetch(`${API_BASE}/api/excel`, {
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
            throw new Error('No se pudo exportar')
        }
    })
}

/**
 * NUEVO: actualizacion generica de propiedades de una semana
 * Uso tipico: updateWeekProperties(weekId, { visibility: 'hidden' })
 * Tambien te sirve a futuro: updateWeekProperties(weekId, { name: 'Semana 8', tags: [...] })
 */
async function updateWeekProperties(weekId, partial) {
    return apiFetch(`${API_BASE}/api/week/${weekId}/properties`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(partial)
    })
    .then(res => {
        if (!res.ok) throw new Error('No se pudieron actualizar las propiedades');
        return res.json();
    });
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
    exportToExcel,
    // NUEVO
    updateWeekProperties
}

