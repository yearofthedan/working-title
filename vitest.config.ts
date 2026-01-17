import { mergeConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'

import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

import viteConfig from './vite.config'

export default mergeConfig(viteConfig, {
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          browser: {
            enabled: true,
            provider: playwright({}),
            providerOptions: {
              launch: {
                args: ['--disable-dev-shm-usage'],
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
          name: 'storybook',
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
          },
          setupFiles: ['./.storybook/vitest.setup.ts'],
        },
      },
    ],
  },
})
