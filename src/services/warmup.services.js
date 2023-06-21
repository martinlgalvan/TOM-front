async function findWarmup(week_id, warmup_id) {
    return fetch(`https://tom-api-git-main-martinlgalvan\.vercel\.app/api/week/${week_id}/warmup/${warmup_id}`, {
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
async function createWarmup(week_id, day_id, warmup) {
  return fetch(`https://tom-api-git-main-martinlgalvan\.vercel\.app/api/week/${week_id}/day/${day_id}/warmup`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem('token')
      },
      body: JSON.stringify(warmup)
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

async function editWarmup(week_id, day_id, warmup_id, warmup) {
  return fetch(`https://tom-api-git-main-martinlgalvan\.vercel\.app/api/week/${week_id}/day/${day_id}/warmup/${warmup_id}`, {
      method: 'PUT',
      headers: {
          'Content-Type': 'application/json',
          'auth-token': localStorage.getItem('token')
      },
      body: JSON.stringify(warmup)
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

async function deleteWarmup(week_id, day_id, warmup_id) {
  return fetch(`https://tom-api-git-main-martinlgalvan\.vercel\.app/api/week/${week_id}/day/${day_id}/warmup/${warmup_id}`, {
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
  findWarmup,
  createWarmup,
  editWarmup,
  deleteWarmup
}

/*const search = (event) => {
    // Timeout to emulate a network connection
    setTimeout(() => {
        let filteredExercises;

        if (!event.query.trim().length) {
            _filteredExercises = [...exercises];
        }
        else {
            filteredExercises = exercises.filter((country) => {
                return country.name.toLowerCase().startsWith(event.query.toLowerCase());
            });
        }

        setFilteredExercises(filteredExercises);
    }, 100);
}

useEffect(() => {
    JsonExercises.findJsonExercises().then((data) => setExercises(data));
}, []);

  return (
    <section className="row justify-content-center">
      <article className="col-10 col-lg-6 border-bottom pb-3">
        <form className="row justify-content-center align-items-center" onSubmit={onSubmit}>
          <h2 className="text-center my-3">Agregar ejercicio</h2>

          <div className="col-10 col-lg-6 my-2 ">
            <span className="p-float-label">
            <AutoComplete field="name" value={selectedExercise} suggestions={filteredExercises} completeMethod={search} onChange={(e) => setSelectedExercise(e.value)} />    <label htmlFor="name">Nombre del ejercicio</label>
            </span>
          </div>*/