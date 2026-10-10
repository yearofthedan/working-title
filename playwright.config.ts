import { defineConfig } from '@playwright/test';

// The specs run against the built app, since the service worker exists only in a build.
export default defineConfig({
  testDir: 'e2e',
  use: { baseURL: 'http://localhost:4173' },
  webServer: {
    command: 'vp build && vp preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
  },
});
