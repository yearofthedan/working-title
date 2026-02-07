import { mergeConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'

import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

import viteConfig from './vite.config'

export default mergeConfig(viteConfig, {
  test: {
    // Tweaks to improve performance in a container
    pool: 'forks',
    maxConcurrency: 3,
    maxWorkers: 2,
    testTimeout: 15000,
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          retry: 0,
          browser: {
            enabled: true,
            provider: playwright({}),
            providerOptions: {
              launch: {
                args: ['--disable-dev-shm-usage', '--disable-gpu'],
              },
            },
            headless: true,
            instances: [{ browser: 'chromium' }],
            viewport: { width: 1920, height: 1080 },
          },
          setupFiles: ['./vitest.setup.ts'],
          include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
        },
      },
      {
        extends: true,
        plugins: [
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
          }),
        ],
        test: {
          name: 'a11y',
          browser: {
            enabled: true,
            provider: playwright({}),
            headless: true,
            instances: [{ browser: 'chromium' }],
            providerOptions: {
              launch: {
                args: ['--disable-dev-shm-usage'],
              },
            },
            viewport: { width: 1280, height: 720 },
          },
          setupFiles: ['./.storybook/vitest.setup.ts'],
        },
      },
    ],
  },
})
