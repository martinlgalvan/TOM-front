import test from "node:test";
import assert from "node:assert/strict";

import { assignBlockToRoutine } from "../src/services/week.services.js";
/* La base cambia segun el entorno (vacia con el proxy de desarrollo, absoluta
   si hay VITE_API_BASE). Lo que se verifica aca es la ruta y el cuerpo. */
import { API_BASE } from "../src/services/apiFetch.js";

test("assignBlockToRoutine envia bloque y block_id al endpoint de propiedades", async () => {
  const requests = [];
  global.localStorage = {
    getItem(key) {
      if (key === "token") return "fake-token";
      return null;
    },
  };
  global.fetch = async (url, options) => {
    requests.push({ url, options });
    return {
      ok: true,
      async json() {
        return { ok: true };
      },
    };
  };

  await assignBlockToRoutine("week-1", { _id: "block-99", name: "Fuerza" });

  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, `${API_BASE}/api/week/week-1/properties`);
  const body = JSON.parse(requests[0].options.body);
  assert.deepEqual(body, {
    block: { _id: "block-99", name: "Fuerza" },
    block_id: "block-99",
  });
});

test("assignBlockToRoutine permite limpiar el bloque con null", async () => {
  const requests = [];
  global.localStorage = {
    getItem() {
      return "fake-token";
    },
  };
  global.fetch = async (url, options) => {
    requests.push({ url, options });
    return {
      ok: true,
      async json() {
        return { ok: true };
      },
    };
  };

  await assignBlockToRoutine("week-2", null);

  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, `${API_BASE}/api/week/week-2/properties`);
  const body = JSON.parse(requests[0].options.body);
  assert.deepEqual(body, { block: null, block_id: null });
});
