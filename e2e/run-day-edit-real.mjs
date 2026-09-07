/* Corre los tests de day-edit-details.real.spec.mjs, que sin datos se saltean.
 *
 * Ese spec espera por variables de entorno el alumno, la semana, el dia y un
 * token; si falta alguna, se saltea entero y no protege nada. Este script crea
 * un alumno de prueba propio con su semana, se los pasa, y borra todo al final.
 *
 * Uso:  pnpm test:e2e:dayedit
 *
 * Necesita la API local levantada y las credenciales del entrenador, que se
 * toman de E2E_COACH_EMAIL / E2E_COACH_PASSWORD (o de los valores de abajo,
 * pensados para desarrollo local).
 */

import { spawnSync } from 'node:child_process';

const API = process.env.E2E_API_BASE_URL || 'http://127.0.0.1:2022';
const COACH = {
  email: process.env.E2E_COACH_EMAIL || 'hola@gmail.com',
  password: process.env.E2E_COACH_PASSWORD || 'hola22',
};

/* Marca con la que se reconoce -y se limpia- lo que crea este script. */
const MARCA = 'QA-E2E-dayedit';
const EMAIL_ALUMNO = 'qa-e2e-dayedit@example.com';

async function api(metodo, ruta, { token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['auth-token'] = token;

  /* Al cerrar Playwright la primera peticion a veces cae con ECONNRESET.
     Se reintenta para no dejar datos de prueba colgados por eso. */
  for (let intento = 0; intento < 3; intento += 1) {
    try {
      const res = await fetch(API + ruta, {
        method: metodo,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      const texto = await res.text();
      let json = null;
      try { json = JSON.parse(texto); } catch { /* respuesta sin json */ }
      return { estado: res.status, json };
    } catch (error) {
      if (intento === 2) throw error;
    }
  }
}

async function limpiar(token, idCoach, alumnoId) {
  if (!alumnoId) return;
  const semanas = (await api(`GET`, `/api/user/${alumnoId}/routine?fields=meta`, { token })).json || [];
  for (const semana of semanas) {
    await api('DELETE', `/api/week/${semana._id}`, { token });
  }
  await api('DELETE', `/api/user/${alumnoId}`, { token });

  const restantes = ((await api('GET', `/api/users/${idCoach}`, { token })).json || [])
    .filter((u) => String(u.name || '').includes(MARCA));
  console.log(`limpieza: quedan ${restantes.length} alumnos de prueba`);
}

const login = await api('POST', '/api/users/login', { body: COACH });
if (login.estado !== 200) {
  console.error(`No pude entrar a la API (${login.estado}). Esta levantada en ${API}?`);
  process.exit(1);
}

const token = login.json.token;
const idCoach = login.json.user?._id || login.json._id;
const logo = (await api('GET', `/api/user/${idCoach}`, { token })).json?.logo || '';

let alumnoId = null;
let salida = 1;

try {
  /* Si quedo uno de una corrida anterior, se reutiliza en vez de duplicar. */
  await api('POST', `/api/users/${idCoach}`, {
    token,
    body: { name: MARCA, email: EMAIL_ALUMNO, password: 'QaE2eDayedit2026', category: 'Alumno casual', logo },
  });
  alumnoId = ((await api('GET', `/api/users/${idCoach}`, { token })).json || [])
    .find((u) => u.email === EMAIL_ALUMNO)?._id;

  if (!alumnoId) throw new Error('no pude crear ni encontrar el alumno de prueba');

  await api('POST', `/api/user/${alumnoId}/routine`, { token, body: { name: 'Semana de prueba' } });
  const rutina = (await api('GET', `/api/user/${alumnoId}/routine`, { token })).json;
  const semana = rutina[0]._id;
  const dia = rutina[0].routine[0]._id;

  console.log(`alumno ${alumnoId} | semana ${semana} | dia ${dia}\n`);

  const corrida = spawnSync(
    'npx',
    [
      'playwright', 'test',
      '-c', 'playwright.real-localhost.config.mjs',
      'e2e/day-edit-details.real.spec.mjs',
      '--reporter=list',
    ],
    {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        E2E_REAL_API: '1',
        E2E_API_BASE_URL: API,
        E2E_USER_ID: alumnoId,
        E2E_COACH_ID: alumnoId,
        E2E_ADMIN_ID: idCoach,
        E2E_WEEK_ID: semana,
        E2E_DAY_ID: dia,
        E2E_USERNAME: MARCA,
        E2E_AUTH_TOKEN: token,
      },
    }
  );

  salida = corrida.status ?? 1;
} finally {
  /* Se limpia pase lo que pase, tambien si los tests fallaron. */
  await limpiar(token, idCoach, alumnoId);
}

process.exit(salida);
