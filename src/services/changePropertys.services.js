import { API_BASE } from './apiFetch.js'

 async function changeProperty(userId, category) {
  const token = localStorage.getItem('token');

  const res = await fetch(`${API_BASE}/api/user/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'auth-token': token,
    },
    body: JSON.stringify({ category })
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt);
  }

  return res.json();
}


export {
    changeProperty
}
