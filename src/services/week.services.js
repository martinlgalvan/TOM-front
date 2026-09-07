import { API_BASE, apiFetch } from './apiFetch.js'

/* Guardado corto de la rutina completa. Ver el comentario de
   findRoutineByUserId: sirve para no descargarla dos veces en el salto de la
   lista de semanas a un dia. */
/* Corto a proposito: solo tiene que cubrir el salto de una pantalla a la otra,
   que ocurre en menos de un segundo. No es una cache de sesion. */
const VIGENCIA_RUTINA_MS = 30000
const rutinaGuardada = new Map()

export function olvidarRutina(user_id) {
    if (!user_id) { rutinaGuardada.clear(); return }
    /* Hay una entrada por variante (completa y liviana): se borran las dos. */
    for (const clave of [...rutinaGuardada.keys()]) {
        if (clave.startsWith(`${user_id}|`)) rutinaGuardada.delete(clave)
    }
}

//Busca la rutina de un alumno
/* soloMeta pide las semanas sin los ejercicios: llegan igual el nombre, la
   fecha, la visibilidad y los dias con su nombre, que es lo que necesita un
   listado. Con 73 semanas la diferencia es 311kb contra 44kb.
   Se guarda por separado de la completa: son respuestas distintas. */
async function findRoutineByUserId(user_id, { usarGuardado = false, soloMeta = false } = {}) {
    const clave = `${user_id}|${soloMeta ? 'meta' : 'full'}`
    const guardada = rutinaGuardada.get(clave)
    if (usarGuardado && guardada && Date.now() - guardada.t < VIGENCIA_RUTINA_MS) {
        return guardada.datos
    }

    const consulta = soloMeta ? '?fields=meta' : ''
    return apiFetch(`${API_BASE}/api/user/${user_id}/routine${consulta}`, {
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
        .then(datos => {
            rutinaGuardada.set(clave, { t: Date.now(), datos })
            return datos
        })
}


//Crea una semana
async function createWeek(body, user_id) {
    /* Cualquier cambio invalida el guardado corto de la rutina completa. */
    olvidarRutina()

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
    /* Cualquier cambio invalida el guardado corto de la rutina completa. */
    olvidarRutina()

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
    /* Cualquier cambio invalida el guardado corto de la rutina completa. */
    olvidarRutina()

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
    /* Cualquier cambio invalida el guardado corto de la rutina completa. */
    olvidarRutina()

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
    /* Cualquier cambio invalida el guardado corto de la rutina completa. */
    olvidarRutina()

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
    /* Cualquier cambio invalida el guardado corto de la rutina completa. */
    olvidarRutina()

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
    /* Cualquier cambio invalida el guardado corto de la rutina completa. */
    olvidarRutina()

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

/**
 * NUEVO: acciones masivas sobre varias semanas de UN MISMO alumno.
 * patch admite: { visibility?: 'visible'|'hidden', block?: object|null, block_id?: string|null }
 */
async function bulkUpdateWeeks(userId, weekIds, patch) {
    /* Cualquier cambio invalida el guardado corto de la rutina completa. */
    olvidarRutina()

    return apiFetch(`${API_BASE}/api/weeks/bulk`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify({ userId, ids: weekIds, patch })
    })
    .then(res => {
        if (!res.ok) throw new Error('No se pudieron actualizar las semanas seleccionadas');
        return res.json();
    });
}

async function bulkDeleteWeeks(userId, weekIds) {
    /* Cualquier cambio invalida el guardado corto de la rutina completa. */
    olvidarRutina()

    return apiFetch(`${API_BASE}/api/weeks/bulk`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify({ userId, ids: weekIds })
    })
    .then(res => {
        if (!res.ok) throw new Error('No se pudieron eliminar las semanas seleccionadas');
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
    updateWeekProperties,
    bulkUpdateWeeks,
    bulkDeleteWeeks
}

