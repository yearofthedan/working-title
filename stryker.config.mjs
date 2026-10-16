// Stryker runs the tests over the domain and the application with small faults written into them,
// and reports the ones the tests let through (docs/architecture.md#toolchain).

/** @type {import('@stryker-mutator/core').PartialStrykerOptions} */
export default {
  // Named, because Stryker searches for plugins inside its own package and pnpm keeps this one
  // beside it in the store (https://stryker-mutator.io/docs/stryker-js/configuration#plugins-string).
  plugins: ['@stryker-mutator/vitest-runner'],
  testRunner: 'vitest',
  vitest: { configFile: 'stryker.vitest.config.ts' },
  // The domain and the application hold the behaviour the tests are written over. The UI and the
  // adapters are driven in a browser, which this runner cannot mutate.
  mutate: ['src/domain/**/*.ts', 'src/application/**/*.ts', '!src/**/*.test.ts'],
  // Each mutant's result is stored, so the next run tests only what changed since
  // (https://stryker-mutator.io/docs/stryker-js/incremental).
  incremental: true,
  // Set from the baseline of the first run over this repository, recorded in the pull request that
  // added it (https://github.com/yearofthedan/working-title/pull/63).
  thresholds: { break: 90 },
  reporters: ['clear-text', 'html', 'json'],
};
