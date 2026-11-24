import {
  all,
  archetype,
  contains,
  defineConfig,
  dir,
  exposes,
  files,
  pkg,
  ruleset,
  using,
} from '@yearofthedan/warp';

const component = archetype('component')
  .identify({ marker: '{name}.dom.ts' })
  .requires({
    strings: dir(),
    icons: dir(),
    shared: files(),
    testHelpers: dir(),
    domain: dir(),
    ports: dir(),
    adapters: dir(),
    seed: dir(),
    drivers: dir(),
    folders: dir(),
    runner: dir(),
    staging: dir(),
    application: dir(),
    methods: dir(),
  })
  .contains((c, { required, self }) =>
    c
      .module('subcomponent', dir('{name}'), self)
      .module(
        'logic',
        files('*.ts'),
        exposes(all()).using([required.strings, required.application, required.methods]),
      )
      .module(
        'dom',
        files('{name}.dom.ts'),
        exposes(all()).using((m) => [
          m.logic,
          m.subcomponent.render,
          required.strings,
          required.icons,
          required.shared,
          required.application,
          required.methods,
        ]),
      ),
  )
  .exposes((m) => ({ render: m.dom }))
  .tests(
    contains((c) =>
      c.module('support', files('*.dsl.ts', '*.harness.ts', '*.test-page.ts', 'test-helpers/**')),
    )
      .exposes(all())
      .using((m, { required }) => [
        required.domain,
        required.ports,
        required.adapters,
        required.seed,
        required.drivers,
        required.folders,
        required.runner,
        required.staging,
        required.application,
        required.methods,
        required.testHelpers,
        pkg('vite-plus'),
      ]),
  );

const ui = archetype('ui')
  .contains((c) =>
    c
      .module('strings', dir('strings'), exposes(files('strings.ts')))
      .module('icons', dir('icons'), exposes(all()))
      .module('shared', files('*.ts'), exposes(all()))
      .module(
        'testHelpers',
        dir('test-helpers'),
        exposes(all()).using((m, { required }) => [
          required.drivers,
          required.folders,
          required.staging,
          pkg('vite-plus'),
        ]),
      )
      .module(
        'header',
        dir('header'),
        exposes(files('header.dom.ts')).using((m, { required }) => [
          m.strings,
          required.application,
        ]),
      )
      .module(
        'components',
        dir('{name}'),
        component.using((m) => [m.header]),
      ),
  )
  .exposes(all())
  .requires({ drivers: dir(), folders: dir(), staging: dir(), application: dir() })
  .provides((m) => ({
    strings: m.strings,
    icons: m.icons,
    shared: m.shared,
    testHelpers: m.testHelpers,
  }));

const app = archetype('app')
  .contains((c) =>
    c
      .module('domain', dir('src/domain'), exposes(all()))
      .module(
        'ports',
        dir('src/ports'),
        exposes(all()).using((m) => [m.domain]),
      )
      .module(
        'methods',
        dir('src/methods'),
        exposes(all()).using((m) => [m.domain]),
      )
      .module(
        'application',
        dir('src/application'),
        exposes(all()).using((m) => [m.domain, m.ports, m.methods]),
      )
      .module(
        'adapters',
        dir('src/adapters'),
        exposes(
          files('file-system-folders.ts', 'local-storage-project-store.ts', 'folder-name.ts'),
        ).using((m) => [m.domain, m.ports, m.methods]),
      )
      .module(
        'seed',
        dir('src/test-helpers/seed'),
        exposes(all()).using((m) => [m.domain, m.methods, m.ports]),
      )
      .module(
        'drivers',
        dir('src/test-helpers/drivers'),
        exposes(all()).using((m) => [m.adapters, pkg('vite-plus'), pkg('@playwright/test')]),
      )
      .module(
        'folders',
        dir('src/test-helpers/folders'),
        exposes(all()).using((m) => [m.drivers, m.adapters, m.methods, m.ports]),
      )
      .module(
        'runner',
        dir('src/test-helpers/runner'),
        exposes(all()).using((m) => [m.drivers, m.folders, pkg('node:*')]),
      )
      .module('ui', dir('src/ui'), ui)
      .module(
        'registrations',
        files('src/test-helpers/*.ts'),
        exposes(all()).using([pkg('vite-plus')]),
      )
      .module(
        'startUp',
        files('src/*.ts'),
        exposes(all()).using((m) => [
          m.adapters,
          m.application,
          m.methods,
          m.ports,
          m.ui,
          pkg('virtual:pwa-register'),
        ]),
      )
      .module(
        'staging',
        dir('src/test-helpers/staging'),
        exposes(all()).using((m) => [
          m.adapters,
          m.drivers,
          m.ports,
          m.seed,
          m.ui,
          m.startUp,
          pkg('vite-plus'),
        ]),
      )
      .module('lint', dir('lint'), exposes(all()).using([pkg('vite-plus'), pkg('node:*')]))
      .module(
        'tooling',
        files('*.ts'),
        using((m) => [
          m.lint,
          pkg('vite-plus'),
          pkg('vite-plugin-pwa'),
          pkg('@vitest/browser-playwright'),
          pkg('@playwright/test'),
          pkg('@yearofthedan/warp'),
          pkg('node:*'),
        ]),
      ),
  )
  .provides((m) => ({
    domain: m.domain,
    ports: m.ports,
    adapters: m.adapters,
    seed: m.seed,
    drivers: m.drivers,
    folders: m.folders,
    runner: m.runner,
    staging: m.staging,
    application: m.application,
    methods: m.methods,
  }))
  .tests(
    dir('e2e'),
    using((m) => [
      m.domain,
      m.ports,
      m.adapters,
      m.seed,
      m.drivers,
      m.folders,
      m.runner,
      m.staging,
      m.startUp,
      pkg('vite-plus'),
      pkg('@playwright/test'),
      pkg('@axe-core/playwright'),
      pkg('node:*'),
    ]),
  );

const forTestCode = {
  'function-cohesion': false,
  'cognitive-complexity': false,
  'file-cohesion': false,
};

const base = ruleset().on(app.modules.tests, forTestCode).on(component.modules.tests, forTestCode);

export default defineConfig({
  root: app,
  tests: files('**/*.test.ts', 'e2e/**/*.spec.ts'),
  rulesets: { default: base },
});
