import { API_BASE, apiFetch } from './apiFetch.js'


/*---------------------------------------------------*/

//Obtiene todos los ejercicios

async function findExercises(id) {
    return apiFetch(`${API_BASE}/api/day/${id}/exercise`, {
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

//Agrega un ejercicio a un dA­a 

async function addExerciseToDay(week_id,day_id, exercise) {
    return apiFetch(`${API_BASE}/api/week/${week_id}/day/${day_id}/exercises`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(exercise)
    })
        .then(response => response.json())
}

//Agrega un amrap a un dA­a 

async function addAmrap(week_id,day_id, amrap) {
    return apiFetch(`${API_BASE}/api/week/${week_id}/day/${day_id}/exercises/amrap`, {
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

async function editExerciseAmrap(week_id, day_id,exercise_id, amrap) {
    return apiFetch(`${API_BASE}/api/week/${week_id}/day/${day_id}/exercise/${exercise_id}/amrap`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(amrap)
    })
        .then(response => response.json())
}


//Elimina un ejercicio dependiendo el dA­a y el ejercicio
async function deleteExercise(week_id, day_id, exercise_id) {
    return apiFetch(`${API_BASE}/api/week/${week_id}/day/${day_id}/exercise/${exercise_id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('token')
        },
    })
        .then(response => response.json())
}


async function editExercise(week_id, day_id, exercise) {
  return apiFetch(
    `${API_BASE}/api/week/${week_id}/day/${day_id}/exercise`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "auth-token": localStorage.getItem("token"),
      },
      body: JSON.stringify(exercise),
    }
  ).then(async (response) => {
    const text = await response.text(); // ðY'ˆ lee el body aunque sea error
    if (response.ok) {
      try { return JSON.parse(text); } catch { return text; }
    }

    // ðY'‡ ahora vas a ver el status + body real
    console.error("editExercise failed:", {
      status: response.status,
      statusText: response.statusText,
      body: text,
    });

    throw new Error(
      `No se pudo editar el ejercicio (HTTP ${response.status}): ${text || response.statusText}`
    );
  });
}



async function editExerciseMobile(week_id, day_id, exercise_id, exercise) {
    return apiFetch(`${API_BASE}/api/week/${week_id}/day/${day_id}/exercises/${exercise_id}`, {
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
