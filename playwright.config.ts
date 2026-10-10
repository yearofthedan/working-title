import { defineConfig } from '@playwright/test';

// The specs run against a build, because vite.config.ts leaves the service worker off in dev
// (https://vite-pwa-org.netlify.app/guide/development).
export default defineConfig({
  testDir: 'e2e',
  use: { baseURL: 'http://localhost:4173' },
  webServer: {
    command: 'vp build && vp preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
  },
});
