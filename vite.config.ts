import { playwright } from '@vitest/browser-playwright';
import { VitePWA } from 'vite-plugin-pwa';
import { configDefaults, defineConfig } from 'vite-plus';

const themeColor = '#f4f2ed';

export const findsByRoleOrLabel = ['getByRole', 'getByLabel', 'getByLabelText'];
export const documentSelectors = ['querySelector', 'querySelectorAll'];
export const domGlobals = [
  'document',
  'window',
  'getComputedStyle',
  'requestAnimationFrame',
  'ResizeObserver',
  'localStorage',
];
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

const theLanguageCallsTheDriver = 'The language calls the driver, and finds no element itself.';
const findsElementsInADriver = 'Find elements in a driver, src/test-helpers/*.driver.ts.';
const theDomBelongsInADomFile =
  'The DOM belongs in a *.dom.ts beside this one, which holds the logic (docs/standards/testing.md).';

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
      /* shortcut: assets are swapped without the tab asking, which is safe while every keystroke is
         saved and nothing here reloads the tab on its own; prompt instead once something in the app
         is transient (https://vite-pwa-org.netlify.app/guide/auto-update). */
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
    jsPlugins: ['./scripts/_lint-comments.mjs'],
    rules: {
      'comments/allowed-prefix': 'error',
      'unicorn/no-thenable': 'error',
    },
    overrides: [
      {
        files: ['e2e/**'],
        rules: {
          'no-restricted-properties': [
            'error',
            ...restricted([...findsByRoleOrLabel, ...findsAnyOtherWay], findsElementsInADriver),
            ...documentSelectors.map((property) => ({
              object: 'document',
              property,
              message: findsElementsInADriver,
            })),
          ],
        },
      },
      {
        files: ['src/**/*.browser.test.ts'],
        rules: {
          'no-restricted-properties': [
            'error',
            ...restricted([...findsByRoleOrLabel, ...findsAnyOtherWay], findsElementsInADriver),
          ],
        },
      },
      {
        files: ['src/ui/**/*.ts'],
        rules: {
          'no-restricted-globals': [
            'error',
            ...domGlobals.map((name) => ({ name, message: theDomBelongsInADomFile })),
          ],
        },
      },
      {
        files: ['src/ui/**/*.dom.ts', 'src/ui/**/*.test.ts'],
        rules: { 'no-restricted-globals': 'off' },
      },
      {
        files: ['**/*.dsl.ts'],
        rules: {
          'no-restricted-properties': [
            'error',
            ...restricted([...findsByRoleOrLabel, ...findsAnyOtherWay], theLanguageCallsTheDriver),
            ...documentSelectors.map((property) => ({
              object: 'document',
              property,
              message: theLanguageCallsTheDriver,
            })),
          ],
        },
      },
      {
        files: ['**/*.driver.ts', '**/test-helpers/driver.ts'],
        rules: {
          'no-restricted-properties': [
            'error',
            ...restricted(
              findsAnyOtherWay,
              'A driver finds elements by role or label, as the writer does.',
            ),
          ],
        },
      },
    ],
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
            '**/*.browser.test.ts',
            'src/ui/lint-sample-*/**',
          ],
        },
      },
      {
        test: {
          name: 'browser',
          include: ['**/*.browser.test.ts'],
          setupFiles: ['src/shell.css'],
          ...(approving ? { api: { allowWrite: true } } : {}),
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
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
