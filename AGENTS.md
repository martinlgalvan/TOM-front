# TOM Front

## Entorno

- Usar Node.js 22 y `pnpm`; no actualizar lockfiles ni dependencias salvo que la tarea lo requiera.
- Ejecutar la aplicacion con `pnpm dev` y comprobar produccion con `pnpm build`.
- Tratar `TOM-APIREST`, ubicado como repositorio hermano, como la fuente del contrato HTTP.

## Arquitectura

- Mantener paginas en `src/pages`, componentes reutilizables en `src/components`, acceso HTTP en `src/services` y utilidades puras en `src/helpers`.
- Canalizar requests autenticadas por `src/services/apiFetch.js`; conservar `credentials: 'include'`, el header `auth-token` y el flujo compartido de refresh.
- Usar `VITE_API_BASE` mediante `API_BASE`/`buildApiUrl`; no agregar nuevas URLs de backend hardcodeadas.
- Conservar las formas de datos y los identificadores del dominio (`week_id`, `day_id`, `exercise_id`, `source_*`) salvo cambio coordinado con la API.
- Reutilizar el sistema visual dominante en la pantalla modificada. No introducir otra libreria de UI para un cambio local.

## Implementacion

- Cubrir estados de carga, error, vacio y exito en flujos asincronos.
- Mantener accesibles los controles interactivos y comprobar vistas mobile y desktop cuando cambie UI.
- No silenciar errores de red ni declarar guardado antes de recibir una respuesta exitosa.
- No modificar archivos generados, `test-results/`, respaldos ni codigo legacy ajeno a la tarea.
- Preservar cambios locales existentes y limitar el diff al alcance solicitado.

## Verificacion

- Ejecutar `pnpm build` para cambios de aplicacion.
- Ejecutar `pnpm test:dayedit` al cambiar la edicion/detalle de dias o sus servicios.
- Ejecutar `pnpm test:e2e` para navegacion o flujos visibles; usar `pnpm test:e2e:real` solo cuando frontend y API locales esten configurados.
- Agregar o actualizar la prueba mas cercana cuando se corrija una regresion.
- Informar comandos ejecutados, resultados y cualquier validacion omitida.
