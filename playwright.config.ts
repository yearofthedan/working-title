import { defineConfig } from '@playwright/test';

const build = process.env.COVERAGE_DIR ? 'vp build --sourcemap --minify false' : 'vp build';

export default defineConfig({
  testDir: 'e2e',
  use: { baseURL: `http://localhost:${process.env.PREVIEW_PORT}` },
  webServer: {
    command: `${build} && vp preview --port 0`,
    wait: { stdout: /Local:\s+http:\/\/localhost:(?<preview_port>\d+)/ },
  },
});
