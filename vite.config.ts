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

export default defineConfig({
  plugins: [
    {
      name: 'theme-color',
      transformIndexHtml: () => [
        { tag: 'meta', attrs: { name: 'theme-color', content: themeColor }, injectTo: 'head' },
      ],
    },
    VitePWA({
      // shortcut: a new build takes over open tabs without asking and can lose unsaved input, prompt
      // instead once the writer can type (https://vite-pwa-org.netlify.app/guide/auto-update).
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
        files: ['e2e/**'],
        excludeFiles: ['e2e/**/writer.ts'],
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
    // The approved-file tests run sample tests in folders of their own, which a run
    // of the whole suite, or one they left behind when stopped, must not collect.
    exclude: [
      ...configDefaults.exclude,
      'e2e/**',
      ...(process.env.APPROVED_SAMPLE ? [] : ['**/approved-sample-*/**']),
    ],
    update: 'none',
  },
  staged: {
    '*': 'vp check --fix',
  },
});
