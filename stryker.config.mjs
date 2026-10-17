/** @type {import('@stryker-mutator/core').PartialStrykerOptions} */
export default {
  // Stryker searches for plugins inside its own package, where pnpm does not keep this one.
  plugins: ['@stryker-mutator/vitest-runner'],
  testRunner: 'vitest',
  vitest: { configFile: 'stryker.vitest.config.ts' },
  // The UI and the adapters are driven in a browser, which this runner cannot mutate.
  mutate: ['src/domain/**/*.ts', 'src/application/**/*.ts', '!src/**/*.test.ts'],
  // Results carry over between runs, so a run mutates only what changed.
  incremental: true,
  // One number for the whole run, so the domain and the application are gated together.
  thresholds: { break: 90 },
  reporters: ['clear-text', 'html', 'json'],
};
