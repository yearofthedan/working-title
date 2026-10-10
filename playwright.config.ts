import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  use: { baseURL: 'http://localhost:4173' },
  webServer: {
    command: 'vp build && vp preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
  },
});
