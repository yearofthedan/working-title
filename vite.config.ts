import { playwright } from '@vitest/browser-playwright';
import { VitePWA } from 'vite-plugin-pwa';
import { configDefaults, defineConfig } from 'vite-plus';
import { overrides } from './lint';

const themeColor = '#f4f2ed';

const approving = process.env.SCENARIO_APPROVE !== undefined;

declare module 'vite-plus/test/browser' {
  interface BrowserCommands {
    emulateReducedMotion(motion: 'reduce' | 'no-preference'): Promise<void>;
  }
}

export default defineConfig({
  define: { __SCENARIO_APPROVE__: JSON.stringify(process.env.SCENARIO_APPROVE ?? '') },
  plugins: [
    {
      name: 'theme-color',
      transformIndexHtml: () => [
        { tag: 'meta', attrs: { name: 'theme-color', content: themeColor }, injectTo: 'head' },
      ],
    },
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'working-title',
        short_name: 'working-title',
        description: 'Plan and draft a novel.',
        theme_color: themeColor,
        background_color: themeColor,
        display: 'standalone',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,woff2}'],
      },
    }),
  ],
  fmt: {
    ignorePatterns: ['**/*.md'],
    singleQuote: true,
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
    jsPlugins: [
      './scripts/_lint-comments.mjs',
      { name: 'eslint-js', specifier: 'oxlint-plugin-eslint' },
    ],
    rules: {
      'comments/allowed-prefix': 'error',
      'unicorn/no-thenable': 'error',
    },
    overrides,
  },
  test: {
    ...(approving ? { api: { allowWrite: true } } : {}),
    update: 'none',
    projects: [
      {
        test: {
          name: 'node',
          environment: 'node',
          exclude: [
            ...configDefaults.exclude,
            'e2e/**',
            '**/*.component.test.ts',
            'src/ui/lint-sample-*/**',
          ],
        },
      },
      {
        test: {
          name: 'browser',
          include: ['**/*.component.test.ts'],
          exclude: ['src/ui/lint-sample-*/**'],
          setupFiles: [
            'src/shell.css',
            'src/test-helpers/locators.ts',
            'src/test-helpers/matchers.ts',
          ],
          ...(approving ? { api: { allowWrite: true } } : {}),
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            viewport: { width: 1280, height: 896 },
            instances: [{ browser: 'chromium' }],
            commands: {
              emulateReducedMotion: async ({ page }, motion: 'reduce' | 'no-preference') => {
                await page.emulateMedia({ reducedMotion: motion });
              },
            },
          },
        },
      },
    ],
  },
  staged: {
    '*': 'vp check --fix',
  },
});
