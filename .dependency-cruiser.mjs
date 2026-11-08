/* shortcut: its own TypeScript, 6, as it reads only a `typescript` below 7 and the toolchain is
   on 7; one version when it reads 7 (the range is what `depcruise --info` prints). */

/** @type {import('dependency-cruiser').IConfiguration} */
export default {
  forbidden: [
    ...Object.entries({
      domain: ['application', 'ports', 'adapters', 'ui'],
      application: ['adapters', 'ui'],
      ports: ['application', 'adapters', 'ui'],
      adapters: ['application', 'ui'],
      ui: ['domain', 'ports', 'adapters'],
    }).map(([layer, others]) => ({
      name: `layer-direction-${layer}`,
      severity: 'error',
      comment: `The ${layer} layer may not import ${others.join(', ')}, because a layer's dependencies point inward (docs/adr/0002-hexagonal-layers.md).`,
      from: { path: `^src/${layer}/` },
      to: { path: others.map((other) => `^src/${other}/`) },
    })),
    {
      name: 'dsl-not-on-a-driver',
      severity: 'error',
      comment:
        'A language file is written once over the driver contract, so it never imports a protocol driver (docs/standards/testing.md).',
      from: { path: '\\.dsl\\.ts$' },
      to: { path: '\\.driver\\.ts$' },
    },
    {
      name: 'scenario-code-in-test-helpers',
      severity: 'error',
      comment:
        'The scenario layers are reached by a test, another language file, a driver, a harness and src/test-helpers/, and by nothing else the app is made of (docs/standards/testing.md).',
      from: {
        path: '^src/',
        pathNot: [
          '\\.test\\.ts$',
          '\\.dsl\\.ts$',
          '\\.driver\\.ts$',
          '\\.harness\\.ts$',
          '^src/test-helpers/',
        ],
      },
      to: { path: '(\\.dsl\\.ts$|\\.driver\\.ts$|test-helpers/driver\\.ts$|\\.harness\\.ts$)' },
    },
    {
      name: 'logic-not-on-the-dom',
      severity: 'error',
      comment:
        'A plain file in src/ui/ holds the logic, and the code that touches the DOM is in a *.dom.ts beside it (docs/standards/testing.md).',
      from: { path: '^src/ui/', pathNot: ['\\.dom\\.ts$', '\\.test\\.ts$', '\\.harness\\.ts$'] },
      to: { path: '\\.dom\\.ts$' },
    },
    {
      name: 'start-app-imported-only-by-its-entry-and-app-tests',
      severity: 'error',
      comment:
        'Only the entry and an app test import startApp, because a test that starts the whole app through it is an app test (docs/standards/testing.md).',
      from: { path: '^src/', pathNot: ['^src/main\\.ts$', '\\.app\\.test\\.ts$'] },
      to: { path: '^src/app\\.ts$' },
    },
    {
      name: 'no-circular',
      severity: 'error',
      comment:
        'This dependency is part of a cycle, so the modules in it cannot be read one at a time. Break it by moving what they share down a layer (docs/adr/0002-hexagonal-layers.md).',
      from: {},
      to: { circular: true },
    },
  ],
  required: [
    {
      name: 'dsl-on-the-driver-contract',
      severity: 'error',
      comment:
        'A language file is written once over the driver contract, so every *.dsl.ts imports src/test-helpers/driver.ts (docs/standards/testing.md).',
      module: { path: '\\.dsl\\.ts$' },
      to: { path: '^src/test-helpers/driver\\.ts$' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsPreCompilationDeps: true,
  },
};
