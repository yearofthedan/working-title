/** @type {import('@stryker-mutator/core').PartialStrykerOptions} */
export default {
  /* shortcut: Stryker searches for plugins inside its own package, where pnpm does not keep this
     one, so the runner is named here; name it no more once Stryker searches where it is installed. */
  plugins: ['@stryker-mutator/vitest-runner'],
  testRunner: 'vitest',
  vitest: { configFile: 'stryker.vitest.config.ts' },
  /* shortcut: Stryker's Vitest runner cannot run browser mode, so a *.dom.ts and the adapters,
     tested only there, are left out; mutate them too once it can
     (https://stryker-mutator.io/docs/stryker-js/vitest-runner#limitations). A component's
     *.harness.ts is browser-mode test code and is left out for the same reason, and so is a
     test-helpers/ folder, which holds measures, staging and seed code for browser tests. The app's
     words in src/ui/strings/ are left out too: the browser tests and the approved scenarios pin
     them; mutate them once the runner can run browser mode. */
  mutate: [
    'src/domain/**/*.ts',
    'src/application/**/*.ts',
    'src/ui/**/*.ts',
    '!src/**/*.dom.ts',
    '!src/**/*.dsl.ts',
    '!src/**/*.test.ts',
    '!src/**/*.test-page.ts',
    '!src/**/*.harness.ts',
    '!src/**/test-helpers/**',
    '!src/ui/strings/**',
  ],
  incremental: true,
  thresholds: { break: 90 },
  reporters: ['clear-text', 'html', 'json'],
};
