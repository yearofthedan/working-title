// Mutation testing writes small faults into the code and runs the tests over them, reporting
// the ones the tests let through (docs/architecture.md#toolchain). The report is the point:
// the break threshold is proposed from a baseline of real numbers, so nothing here fails a run.

/** @type {import('@stryker-mutator/core').PartialStrykerOptions} */
export default {
  // The runner is named rather than searched for: under pnpm it sits beside this package in the
  // store, not beside @stryker-mutator/core, which is where Stryker looks
  // (https://stryker-mutator.io/docs/stryker-js/configuration#plugins-string).
  plugins: ['@stryker-mutator/vitest-runner'],
  testRunner: 'vitest',
  vitest: { configFile: 'stryker.vitest.config.ts' },
  // The domain and the application are where the tests are the only thing holding the behaviour
  // up. The UI and the adapters are driven in a browser, which this runner cannot mutate.
  mutate: ['src/domain/**/*.ts', 'src/application/**/*.ts', '!src/**/*.test.ts'],
  // Before each run Stryker rewrites the tsconfig's `extends` and `references` paths, through the
  // TypeScript compiler API, which the TypeScript 7 this repo is on does not have
  // (https://stryker-mutator.io/docs/stryker-js/configuration#tsconfigfile). Ours has neither, so
  // the rewrite has nothing to do and this names a file no sandbox holds, which skips it.
  tsconfigFile: 'no-tsconfig-rewrite.json',
  // Reports carry a mutant's result forward, so a run reads only what changed since it was written
  // (https://stryker-mutator.io/docs/stryker-js/incremental).
  incremental: true,
  reporters: ['clear-text', 'html', 'json'],
};
