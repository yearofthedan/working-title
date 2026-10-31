import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  use: { baseURL: `http://localhost:${process.env.PREVIEW_PORT}` },
  webServer: {
    command: 'vp build && vp preview --port 0',
    wait: { stdout: /Local:\s+http:\/\/localhost:(?<preview_port>\d+)/ },
  },
});
