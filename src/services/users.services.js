import { API_BASE } from './apiFetch.js'

//Busca los alumnos del entrenador(que tienen entrenador_id)
async function find(id) {
    return fetch(`${API_BASE}/api/users/${id}`, {
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
                throw new Error('No se pudo obtener los usuarios')
            }
        })
}

//Crea alumnos
async function createAlumno(id, user) {
  const response = await fetch(`${API_BASE}/api/users/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'auth-token': localStorage.getItem('token')
    },
    body: JSON.stringify(user)
  });

  const text = await response.text();           // 1) leo siempre como texto
  if (!response.ok) {                           // 2) si no esta OK, propago el texto
    // puedes inspeccionar aqui text para logs:
    console.error('createAlumno -> Error response:', text);
    throw new Error(
      response.status === 403
        ? (JSON.parseSafe(text)?.message || 'Limite de usuarios alcanzado.')
        : response.status === 400
          ? (JSON.parseSafe(text)?.message.includes('email')
              ? 'El email ya existe. Usa otro.'
              : (JSON.parseSafe(text)?.message || 'Error de validacion.'))
          : (JSON.parseSafe(text)?.message || 'Ocurrio un error inesperado.')
    );
  }

  // 3) si esta OK, parseo JSON con control de errores
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('El servidor devolvio una respuesta no-JSON.');
  }
}

// helper opcional para parsear sin lanzar
JSON.parseSafe = s => { try { return JSON.parse(s) } catch { return {} } };

//Elimino alumnos
async function deleteUser(id) {
    return fetch(`${API_BASE}/api/user/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('token')
        },
    })
        .then(response => response.json())
}

 async function findWithLastWeek(id) {
  const url = `${API_BASE}/api/users/${id}?withLastWeek=true`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'auth-token': localStorage.getItem('token')
    }
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    console.error('findWithLastWeek -> Error response:', text);
    throw new Error('No se pudo obtener los usuarios (withLastWeek)');
  }

  return response.json();
}


//Busca a un alumno
async function findUserById(id) {
    try {
        const response = await fetch(`${API_BASE}/api/user/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'auth-token': localStorage.getItem('token')
            }
        });
        
        if (response.ok) {
            return response.json();
        } else {
            const errorMessage = await response.text();
            throw new Error(errorMessage || 'No se pudo obtener el usuario');
        }
    } catch (error) {
        throw new Error(`Error en la solicitud: ${error.message}`);
    }
}




//--------------------------------------------------------------------//





//Encontrar dias
async function findDays(id) {
    return fetch(`${API_BASE}/api/users/routine/${id}/createDay`, {
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

/*---------------------------------------------------*/

//Obtiene todos los ejercicios

/*async function findExercises(id) {
    return fetch(`${API_BASE}/api/day/${id}/exercise`, {
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
}*/

//Agrega un ejercicio a un dia 

async function addExerciseToDay(id, exercise) {
    return fetch(`${API_BASE}/api/day/${id}/exercise`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('token')
        },
        body: JSON.stringify(exercise)
    })
        .then(response => response.json())
}

//Elimina un ejercicio dependiendo el dia y el ejercicio
async function deleteExercise(idDay, idExercise) {
    return fetch(`${API_BASE}/api/day/${idDay}/exercise/${idExercise}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('token')
        },
    })
        .then(response => response.json())
}


async function editExercise(idDay, idExercise, exercise) {
    return fetch(`${API_BASE}/api/day/${idDay}/exercise/${idExercise}`, {
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


//Busca los alumnos del entrenador(que tienen entrenador_id)
async function findRoutineById(id) {
    return fetch(`${API_BASE}/api/user/${id}/routine`, {
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
                throw new Error('No se pudo obtener la rutina')
            }
        })
}


//Busca los alumnos del entrenador(que tienen entrenador_id)
async function getProfileById(id) {
    return fetch(`${API_BASE}/api/user/${id}/routine/clon`, {
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
                throw new Error('No se pudo obtener el perfil')
            }
        })
}



async function editProfile(user_id, data) {
    const response = await fetch(`${API_BASE}/api/user/${user_id}/routine`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': localStorage.getItem('token')
      },
      body: JSON.stringify(data)
    });
  
    if (response.ok) {
      return response.json();
    } else {
      // Intentamos parsear la respuesta en JSON para obtener mas detalles
      let errorData;
      try {
        errorData = await response.json();
      } catch (parseError) {
        errorData = { message: 'No se pudo parsear la respuesta de error' };
      }
      const error = new Error(`Error ${response.status}: No se pudo editar el perfil`);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }
  }

    async function getAnnouncementsByCreator(id) {
    const response = await fetch(`${API_BASE}/api/announcements/creator/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': localStorage.getItem('token')
      }
    });
  
    if (response.ok) {
      return response.json();
    } else {
      // Intentamos parsear la respuesta en JSON para obtener mas detalles
      let errorData;
      try {
        errorData = await response.json();
      } catch (parseError) {
        errorData = { message: 'No se pudo parsear la respuesta de error' };
      }
      const error = new Error(`Error ${response.status}: No se pudo editar el perfil`);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }
  }

  async function createAnnouncement(data) {
    const response = await fetch(`${API_BASE}/api/announcements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': localStorage.getItem('token')
      },
      body: JSON.stringify(data)
    });
  
    if (response.ok) {
      return response.json();
    } else {
      // Intentamos parsear la respuesta en JSON para obtener mas detalles
      let errorData;
      try {
        errorData = await response.json();
      } catch (parseError) {
        errorData = { message: 'No se pudo parsear la respuesta de error' };
      }
      const error = new Error(`Error ${response.status}: No se pudo editar el perfil`);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }
  }

  
  async function editAnnouncement(id, updates) {
    const response = await fetch(`${API_BASE}/api/announcements/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': localStorage.getItem('token')
      },
      body: JSON.stringify(updates)
    });
  
    if (response.ok) {
      return response.json();
    } else {
      // Intentamos parsear la respuesta en JSON para obtener mas detalles
      let errorData;
      try {
        errorData = await response.json();
      } catch (parseError) {
        errorData = { message: 'No se pudo parsear la respuesta de error' };
      }
      const error = new Error(`Error ${response.status}: No se pudo editar el perfil`);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }
  }

    async function deleteAnnouncement(id) {
    const response = await fetch(`${API_BASE}/api/announcements/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': localStorage.getItem('token')
      }
    });
  
    if (response.ok) {
      return response.json();
    } else {
      // Intentamos parsear la respuesta en JSON para obtener mas detalles
      let errorData;
      try {
        errorData = await response.json();
      } catch (parseError) {
        errorData = { message: 'No se pudo parsear la respuesta de error' };
      }
      const error = new Error(`Error ${response.status}: No se pudo editar el perfil`);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }
  }



  async function getUnreadAnnouncements(id) {
    const response = await fetch(`${API_BASE}/api/announcements/user/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': localStorage.getItem('token')
      }
    });
  
    if (response.ok) {
      return response.json();
    } else {
      // Intentamos parsear la respuesta en JSON para obtener mas detalles
      let errorData;
      try {
        errorData = await response.json();
      } catch (parseError) {
        errorData = { message: 'No se pudo parsear la respuesta de error' };
      }
      const error = new Error(`Error ${response.status}: No se pudo editar el perfil`);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }
  }


    async function markAnnouncementRead(announcementId, userId) {
    const response = await fetch(`${API_BASE}/api/announcements/${announcementId}/read/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': localStorage.getItem('token')
      }
    });
  
    if (response.ok) {
      return response.json();
    } else {
      // Intentamos parsear la respuesta en JSON para obtener mas detalles
      let errorData;
      try {
        errorData = await response.json();
      } catch (parseError) {
        errorData = { message: 'No se pudo parsear la respuesta de error' };
      }
      const error = new Error(`Error ${response.status}: No se pudo editar el perfil`);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }
  }

  async function getAnnouncementsHistory(userId) {
  const response = await fetch(`${API_BASE}/api/announcements/user/${userId}/history`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'auth-token': localStorage.getItem('token')
    }
  });
  if (!response.ok) throw new Error('No se pudo obtener el historial de anuncios');
  return response.json();
}

  async function getAnnouncementViewsWithNames(announcementId) {
  const response = await fetch(`${API_BASE}/api/announcements/${announcementId}/viewers`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'auth-token': localStorage.getItem('token')
    }
  });
  if (!response.ok) throw new Error('No se pudo obtener el historial de anuncios');
  return response.json();
}

  async function getAnnouncementViewCounts(creatorId) {
  const response = await fetch(`${API_BASE}/api/announcements/${creatorId}/views-count`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'auth-token': localStorage.getItem('token')
    }
  });
  if (!response.ok) throw new Error('No se pudo obtener el conteo de anuncios');
  return response.json();
}

async function updatePaymentInfo(userId, paymentInfo) {
  return fetch(`${API_BASE}/api/user/${userId}/payment-info`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'auth-token': localStorage.getItem('token')
    },
    body: JSON.stringify(paymentInfo)
  }).then(res => {
    if (!res.ok) throw new Error('Error al guardar el pago');
    return res.json();
  });
}

async function getOpenersProfileData(userId) {
  const profile = await getProfileById(userId).catch(() => ({}));

  const [plansResponse, templatesResponse] = await Promise.all([
    fetch(`${API_BASE}/api/user/${userId}/openers/plans`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': localStorage.getItem('token')
      }
    }).then(async (response) => (response.ok ? response.json() : null)).catch(() => null),
    fetch(`${API_BASE}/api/coach/${userId}/openers/templates`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': localStorage.getItem('token')
      }
    }).then(async (response) => (response.ok ? response.json() : null)).catch(() => null)
  ]);

  const openersPlans = Array.isArray(plansResponse?.plans)
    ? plansResponse.plans
    : Array.isArray(profile?.openers_plans)
    ? profile.openers_plans
    : Array.isArray(profile?.openersPlans)
    ? profile.openersPlans
    : [];

  const openersTemplates = Array.isArray(templatesResponse?.templates)
    ? templatesResponse.templates
    : Array.isArray(profile?.openers_templates)
    ? profile.openers_templates
    : Array.isArray(profile?.openersTemplates)
    ? profile.openersTemplates
    : [];

  return { profile, openersPlans, openersTemplates };
}

async function saveOpenersPlans(userId, plans) {
  const response = await fetch(`${API_BASE}/api/user/${userId}/openers/plans`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'auth-token': localStorage.getItem('token')
    },
    body: JSON.stringify({ plans: Array.isArray(plans) ? plans : [] })
  });

  if (!response.ok) {
    throw new Error('No se pudieron guardar los planes de competencia');
  }

  return response.json();
}

async function saveOpenersTemplates(userId, templates) {
  const response = await fetch(`${API_BASE}/api/coach/${userId}/openers/templates`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'auth-token': localStorage.getItem('token')
    },
    body: JSON.stringify({
      templates: Array.isArray(templates) ? templates : []
    })
  });

  if (!response.ok) {
    throw new Error('No se pudieron guardar las plantillas de competencia');
  }

  return response.json();
}


export {
    find,
    findWithLastWeek,
    findUserById,
    createAlumno,
    deleteUser,
    findDays,
    addExerciseToDay,
    editExercise,
    //findExercises,
    deleteExercise,
    findRoutineById,
    getProfileById,
    editProfile,

    getAnnouncementsByCreator,
    createAnnouncement,
    editAnnouncement,
    deleteAnnouncement,

    getUnreadAnnouncements,
    markAnnouncementRead,
    getAnnouncementsHistory,
    getAnnouncementViewsWithNames,
    getAnnouncementViewCounts,

    updatePaymentInfo,
    getOpenersProfileData,
    saveOpenersPlans,
    saveOpenersTemplates
    
}

