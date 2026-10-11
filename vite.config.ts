import { playwright } from '@vitest/browser-playwright';
import { VitePWA } from 'vite-plugin-pwa';
import { configDefaults, defineConfig } from 'vite-plus';

const themeColor = '#fbfaf7';

// A property restricted with no object is restricted on every object, and one with an
// object only where that name is written
// (https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-restricted-properties).
// The selector actions are restricted on `page` alone because a locator's own `click()`
// is how the driver acts.
export const findsByRoleOrLabel = ['getByRole', 'getByLabel'];
export const findsAnyOtherWay = [
  'getByText',
  'getByPlaceholder',
  'getByAltText',
  'getByTitle',
  'getByTestId',
  'getByRef',
  'locator',
  'frameLocator',
  '$',
  '$$',
  '$eval',
  '$$eval',
  'waitForSelector',
];
export const pageSelectorActions = [
  'check',
  'click',
  'dblclick',
  'dispatchEvent',
  'dragAndDrop',
  'fill',
  'focus',
  'getAttribute',
  'hover',
  'innerHTML',
  'innerText',
  'inputValue',
  'isChecked',
  'isDisabled',
  'isEditable',
  'isEnabled',
  'isHidden',
  'isVisible',
  'press',
  'selectOption',
  'setChecked',
  'setInputFiles',
  'tap',
  'textContent',
  'type',
  'uncheck',
];
const restricted = (anyObject: string[], message: string) => [
  ...anyObject.map((property) => ({ property, message })),
  ...pageSelectorActions.map((property) => ({ object: 'page', property, message })),
];

// ./do approve runs a runner with this set, and only that run may write a scenario's
// observed block. It reaches a browser-mode test through the define below.
const approving = process.env.SCENARIO_APPROVE !== undefined;

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
      // shortcut: assets are swapped without the tab asking, which is safe while every keystroke
      // is saved and nothing here reloads the tab on its own; prompt instead once something in
      // the app is transient (https://vite-pwa-org.netlify.app/guide/auto-update).
      registerType: 'autoUpdate',
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
    rules: {
      'unicorn/no-thenable': 'error',
    },
    overrides: [
      {
        files: ['e2e/**', 'src/**/*.browser.test.ts'],
        excludeFiles: ['e2e/**/writer.ts', 'src/test-helpers/browser-scope.ts'],
        rules: {
          'no-restricted-properties': [
            'error',
            ...restricted(
              [...findsByRoleOrLabel, ...findsAnyOtherWay],
              'Find elements in the writer driver, e2e/writer.ts.',
            ),
          ],
        },
      },
      {
        files: ['e2e/**/writer.ts'],
        rules: {
          'no-restricted-properties': [
            'error',
            ...restricted(
              findsAnyOtherWay,
              'The writer driver finds elements by role or label, as the writer does.',
            ),
          ],
        },
      },
    ],
  },
  test: {
    // A run never writes a scenario's observed block; only ./do approve does, and ./do test
    // refuses --update. A browser test may write a file only when that run says so
    // (https://vitest.dev/config/api#api-allowwrite).
    // Set only when approving: passing `api` starts Vitest's API server on every run
    // (https://vitest.dev/config/api).
    ...(approving ? { api: { allowWrite: true } } : {}),
    // `update` is set at the root because Vitest reads it there and not from a project
    // (https://vitest.dev/config/: options "not supported inside a project config ... can only
    // be set in the root Vitest config"). Observed: with it inside a project, a run wrote the
    // file it was meant to compare with.
    update: 'none',
    projects: [
      {
        test: {
          name: 'node',
          environment: 'node',
          exclude: [...configDefaults.exclude, 'e2e/**', '**/*.browser.test.ts'],
        },
      },
      {
        test: {
          name: 'browser',
          // A test that needs a browser says so in its name, wherever it sits: a file the
          // browser project does not match is matched by neither project.
          include: ['**/*.browser.test.ts'],
          // Set only when approving: passing `api` starts Vitest's API server on every run
          // (https://vitest.dev/config/api), and only an approving run may write a file.
          ...(approving ? { api: { allowWrite: true } } : {}),
          browser: {
            enabled: true,
            // Headless whatever the machine: Vitest's default follows CI, which would open a
            // window on a builder's machine.
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
  staged: {
    '*': 'vp check --fix',
  },
});
