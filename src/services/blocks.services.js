const BASE_URL = '/api/users'; // usamos la ruta existente

export async function getBlocks(userId) {
  const response = await fetch(`https://tom-api-udqr-git-main-martinlgalvans-projects.vercel.app/api/users/${userId}?blocks=true`, {
    method: 'GET', // CORREGIDO
    headers: {
      'Content-Type': 'application/json',
      'auth-token': localStorage.getItem('token')
    }

  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'No se pudo crear el bloque');
  }

  return response.json();
}

  export async function createBlock(userId, blockData) {
    const response = await fetch(`https://tom-api-udqr-git-main-martinlgalvans-projects.vercel.app/api/users/${userId}`, {
      method: 'POST', // CORREGIDO
      headers: {
        'Content-Type': 'application/json',
        'auth-token': localStorage.getItem('token')
      },
      body: JSON.stringify({
        type: 'block',
        data: blockData
      })
    });
  
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'No se pudo crear el bloque');
    }
  
    return response.json();
  }

export async function cloneBlock(userId, blockId) {
  const res = await fetch(`${BASE_URL}/${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'auth-token': localStorage.getItem('token')
    },
    body: JSON.stringify({
      type: 'clone_block',
      blockId: blockId
    })
  });

  if (!res.ok) throw new Error('No se pudo clonar el bloque');
  return res.json();
}

export async function updateBlock(blockId, blockData) {
    const res = await fetch(`https://tom-api-udqr-git-main-martinlgalvans-projects.vercel.app/api/block/${blockId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'auth-token': localStorage.getItem('token')
      },
      body: JSON.stringify(blockData)
    })
    if (!res.ok) throw new Error('No se pudo actualizar el bloque')
    return res.json()
  }

  export async function deleteBlock(blockId) {
    const res = await fetch(`https://tom-api-udqr-git-main-martinlgalvans-projects.vercel.app/api/block/${blockId}`, {
      method: 'DELETE',
      headers: {
        'auth-token': localStorage.getItem('token')
      }
    })
    if (!res.ok) throw new Error('No se pudo eliminar el bloque')
    return res
  }
