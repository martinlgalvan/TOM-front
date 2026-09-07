import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  /* Los specs *.real.spec.mjs necesitan el backend real y su propia config
     (playwright.real-localhost.config.mjs, que los selecciona con testMatch).
     Sin esta exclusion se colaban aca y fallaban siempre, porque este servidor
     sirve con rutas mockeadas en otro puerto. */
  testIgnore: /.*\.real\.spec\.mjs/,
  timeout: 120000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: false,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:4173",
    headless: true,
    viewport: { width: 1440, height: 900 },
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: true,
    timeout: 120000,
  },
});
