// services/finance.services.js

import { API_BASE, apiFetch } from './apiFetch.js'

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'auth-token': localStorage.getItem('token')
  };
}

// ownerId desde tu localStorage (segun lo que mencionaste)
function getOwnerId() {
  const direct = localStorage.getItem('_id');
  if (direct) return direct;
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user?._id || null;
  } catch {
    return null;
  }
}


function buildQuery(params = {}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    q.append(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : '';
}

/** =============================
 *           READS
 *  ============================= */

// Ledger agrupado (tres listas). Soporta from/to/limit/sort
async function getFinanceLedger({
  ownerId = getOwnerId(),
  from,
  to,
  limit = 200,
  sort = 'desc'
} = {}) {
  if (!ownerId) throw new Error('ownerId no disponible');
  const query = buildQuery({ from, to, limit, sort });

  const res = await apiFetch(`${API_BASE}/api/finance/${ownerId}/ledger${query}`, {
    method: 'GET',
    headers: authHeaders()
  });

  if (res.ok) return res.json();
  const text = await res.text();
  throw new Error(text || 'No se pudo obtener el ledger');
}

// Listado paginado unificado
// tipo: 'expense' | 'cashflow' | 'extrasale' (opcional; sin tipo trae todo)
async function listFinanceItems({
  ownerId = getOwnerId(),
  tipo,
  from,
  to,
  page = 1,
  limit = 20,
  sort = 'desc'
} = {}) {
  if (!ownerId) throw new Error('ownerId no disponible');
  const query = buildQuery({ tipo, from, to, page, limit, sort });

  const res = await apiFetch(`${API_BASE}/api/finance/${ownerId}/items${query}`, {
    method: 'GET',
    headers: authHeaders()
  });

  if (res.ok) return res.json(); // { items, page, limit, total }
  const text = await res.text();
  throw new Error(text || 'No se pudo obtener los items de finanzas');
}

// Resumen (ingresos, retiros, gastos, saldo) con rango opcional
async function getFinanceSummary({
  ownerId = getOwnerId(),
  from,
  to
} = {}) {
  if (!ownerId) throw new Error('ownerId no disponible');
  const query = buildQuery({ from, to });

  const res = await apiFetch(`${API_BASE}/api/finance/${ownerId}/summary${query}`, {
    method: 'GET',
    headers: authHeaders()
  });

  if (res.ok) return res.json(); // { ingresos, retiros, gastos, saldo }
  const text = await res.text();
  throw new Error(text || 'No se pudo obtener el resumen de finanzas');
}

/** =============================
 *           CREATES
 *  ============================= */

// Crear Gasto
// payload: { categoria, nombre, monto, descripcion?, fecha? }
async function createFinanceExpense(payload, ownerId = getOwnerId()) {
  if (!ownerId) throw new Error('ownerId no disponible');

  const res = await apiFetch(`${API_BASE}/api/finance/${ownerId}/expense`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload)
  });

  if (res.ok) return res.json();
  const text = await res.text();
  throw new Error(text || 'No se pudo crear el gasto');
}

// Crear Movimiento de Caja
// payload: { tipo: 'INGRESO'|'RETIRO', concepto, monto, descripcion?, fecha? }
async function createFinanceCashflow(payload, ownerId = getOwnerId()) {
  if (!ownerId) throw new Error('ownerId no disponible');

  const res = await apiFetch(`${API_BASE}/api/finance/${ownerId}/cashflow`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload)
  });

  if (res.ok) return res.json();
  const text = await res.text();
  throw new Error(text || 'No se pudo crear el movimiento de caja');
}

// Crear Venta Adicional (crea cashflow INGRESO espejo en el backend)
// payload: { nombre, monto, fecha? }
async function createFinanceExtraSale(payload, ownerId = getOwnerId()) {
  if (!ownerId) throw new Error('ownerId no disponible');

  const res = await apiFetch(`${API_BASE}/api/finance/${ownerId}/extrasale`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload)
  });

  if (res.ok) return res.json(); // { sale, mirrorCashflow }
  const text = await res.text();
  throw new Error(text || 'No se pudo crear la venta adicional');
}

/** =============================
 *        UPDATE / DELETE
 *  ============================= */

// Editar item por _id (sirve para expense/cashflow/extrasale)
// patch: campos editables segun el tipo
async function updateFinanceItem(itemId, patch, ownerId = getOwnerId()) {
  if (!ownerId) throw new Error('ownerId no disponible');
  if (!itemId) throw new Error('itemId requerido');

  const res = await apiFetch(`${API_BASE}/api/finance/${ownerId}/${itemId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(patch)
  });

  if (res.ok) return res.json();
  const text = await res.text();
  throw new Error(text || 'No se pudo actualizar el item');
}

// Borrar item por _id
async function deleteFinanceItem(itemId, ownerId = getOwnerId()) {
  if (!ownerId) throw new Error('ownerId no disponible');
  if (!itemId) throw new Error('itemId requerido');

  const res = await apiFetch(`${API_BASE}/api/finance/${ownerId}/${itemId}`, {
    method: 'DELETE',
    headers: authHeaders()
  });

  if (res.ok) return res.json();
  const text = await res.text();
  throw new Error(text || 'No se pudo eliminar el item');
}

export {
  // reads
  getFinanceLedger,
  listFinanceItems,
  getFinanceSummary,
  // creates
  createFinanceExpense,
  createFinanceCashflow,
  createFinanceExtraSale,
  // update/delete
  updateFinanceItem,
  deleteFinanceItem,
  // util (por si lo queres usar)
  getOwnerId
};
