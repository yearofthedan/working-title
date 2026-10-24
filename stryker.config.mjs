/** @type {import('@stryker-mutator/core').PartialStrykerOptions} */
export default {
  /* shortcut: Stryker searches for plugins inside its own package, where pnpm does not keep this
     one, so the runner is named here; name it no more once Stryker searches where it is installed. */
  plugins: ['@stryker-mutator/vitest-runner'],
  testRunner: 'vitest',
  vitest: { configFile: 'stryker.vitest.config.ts' },
  /* shortcut: the UI and the adapters are driven in a browser, which this runner cannot mutate, so
     only the domain and the application are mutated; mutate them too once it can
     (https://stryker-mutator.io/docs/stryker-js/vitest-runner#limitations). */
  mutate: ['src/domain/**/*.ts', 'src/application/**/*.ts', '!src/**/*.test.ts'],
  incremental: true,
  thresholds: { break: 90 },
  reporters: ['clear-text', 'html', 'json'],
};
