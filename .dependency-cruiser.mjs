/* shortcut: its own TypeScript, 6, as it reads only a `typescript` below 7 and the toolchain is
   on 7; one version when it reads 7 (the range is what `depcruise --info` prints). */

import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const cruised = process.cwd();

const ownersOfTestHelpers = () => {
  const owners = [];
  const visit = (folder) => {
    for (const entry of readdirSync(join(cruised, folder), { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      if (entry.name === 'test-helpers') owners.push(folder);
      else visit(`${folder}/${entry.name}`);
    }
  };
  if (existsSync(join(cruised, 'src'))) visit('src');
  return owners.filter((owner) => owner !== 'src');
};

const helperFolderRules = ownersOfTestHelpers().map((owner) => ({
  name: `helpers-of-${owner.replaceAll('/', '-')}`,
  severity: 'error',
  comment: `A helper sits in the test-helpers/ folder of the nearest folder that holds everything importing it, so only ${owner}/ and the folders above it reach this one (docs/standards/testing.md).`,
  from: { path: ['^src/', '^e2e/'], pathNot: `^${owner}/` },
  to: { path: `^${owner}/test-helpers/` },
}));

const kindPaths = {
  drivers: '^src/test-helpers/drivers/',
  runner: '^src/test-helpers/runner/',
  folders: '^src/test-helpers/folders/',
  staging: '^src/test-helpers/staging/',
  seed: '^src/test-helpers/seed/',
  measures: '^src/test-helpers/measures/',
  adapters: '^src/adapters/',
  methods: '^src/methods/',
  application: '^src/application/',
  domain: '^src/domain/',
  ui: '^src/ui/',
};

const kindRules = Object.entries({
  drivers: ['staging', 'folders', 'runner', 'seed', 'measures'],
  staging: ['folders', 'runner', 'adapters', 'methods'],
  folders: ['staging', 'runner'],
  runner: ['staging', 'seed', 'adapters', 'methods', 'application', 'domain'],
  seed: ['drivers', 'staging', 'folders', 'runner', 'adapters', 'ui'],
}).map(([kind, others]) => ({
  name: `test-helpers-kind-${kind}`,
  severity: 'error',
  comment: `A ${kind} helper is written over the kinds above it, so it may not import ${others.join(', ')} (docs/standards/testing.md).`,
  from: { path: kindPaths[kind], pathNot: '\\.test\\.ts$' },
  to: {
    path: others.map((other) => kindPaths[other]),
    ...(kind === 'staging' ? { dependencyTypesNot: ['type-only'] } : {}),
  },
}));

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
    ...helperFolderRules,
    ...kindRules,
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
        'Test code is reached by a test, a language file, a driver, a harness and src/test-helpers/, and by nothing the app is made of (docs/standards/testing.md).',
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
      name: 'a-component-through-its-render',
      severity: 'error',
      comment:
        "A component reaches another only through that component's *.dom.ts, whose one export renders it; its plain modules are its own (docs/project-structure.md).",
      from: {
        path: '^(src/ui/.+/)[^/]+$',
        pathNot: [
          '\\.test\\.ts$',
          '\\.test-page\\.ts$',
          '\\.harness\\.ts$',
          '\\.dsl\\.ts$',
          '/test-helpers/',
        ],
      },
      to: {
        path: '^src/ui/[^/]+/',
        pathNot: ['^$1[^/]+$', '^src/ui/strings/', '\\.dom\\.ts$'],
        dependencyTypesNot: ['type-only'],
      },
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
