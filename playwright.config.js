import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
const python =
  process.env.ECOTWIN_PYTHON ||
  (existsSync(".venv/bin/python")
    ? ".venv/bin/python"
    : existsSync("/workspace/.ecotwin-venv/bin/python")
      ? "/workspace/.ecotwin-venv/bin/python"
      : "python3");
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60000,
  fullyParallel: false,
  workers: 1,
  reporter: [
    ["list"],
    ["html", { outputFolder: "test-results/report", open: "never" }],
  ],
  outputDir: "test-results/artifacts",
  use: {
    baseURL: process.env.ECOTWIN_E2E_URL || "http://127.0.0.1:8010",
    headless: true,
    trace: "retain-on-failure",
    launchOptions: {
      executablePath:
        process.env.CHROMIUM_PATH ||
        (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
      args: [
        "--no-sandbox",
        "--enable-webgl",
        "--use-gl=angle",
        "--use-angle=swiftshader",
        "--enable-unsafe-swiftshader",
      ],
    },
  },
  webServer: process.env.ECOTWIN_E2E_URL
    ? undefined
    : {
        command: `npm run build && ${python} -m uvicorn api.src.main:app --host 127.0.0.1 --port 8010`,
        url: "http://127.0.0.1:8010/health",
        env: {
          ECOTWIN_DATA_DIR: resolve("test-results/runtime"),
          ALLOW_REGISTRATION: "true",
        },
        reuseExistingServer: false,
        timeout: 60000,
      },
});
