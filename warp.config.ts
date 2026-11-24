import {
  all,
  archetype,
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
    domain: dir(),
    ports: dir(),
    adapters: dir(),
    methods: dir(),
    application: dir(),
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
      )
      .testModule(
        'tests',
        files('*.test.ts', '*.dsl.ts', '*.harness.ts', '*.test-page.ts', 'test-helpers/**'),
        using((m, { required }) => [
          m.subcomponent.tests,
          required.domain,
          required.ports,
          required.adapters,
          required.methods,
          required.application,
        ]),
      ),
  )
  .exposes((m) => ({ render: m.dom, tests: m.tests }))
  .testUsing((m) => [m.tests]);

const ui = archetype('ui')
  .contains((c) =>
    c
      .module('strings', dir('strings'), exposes(files('strings.ts')))
      .module('icons', dir('icons'), exposes(all()))
      .module('shared', files('*.ts'), exposes(all()))
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
      )
      .testModule('testHelpers', dir('test-helpers'))
      .testModule('tests', files('*.test.ts')),
  )
  .exposes(all())
  .requires({ application: dir() })
  .provides((m) => ({ strings: m.strings, icons: m.icons, shared: m.shared }))
  .testUsing((m) => [m.testHelpers, m.components.tests]);

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
        exposes(all()).using((m) => [m.domain, m.ports]),
      )
      .module(
        'adapters',
        dir('src/adapters'),
        exposes(
          files('file-system-folders.ts', 'local-storage-project-store.ts', 'folder-name.ts'),
        ).using((m) => [m.domain, m.ports]),
      )
      .testModule(
        'seed',
        dir('src/test-helpers/seed'),
        using((m) => [m.domain, m.methods, m.ports]),
      )
      .testModule(
        'drivers',
        dir('src/test-helpers/drivers'),
        using((m) => [m.adapters, pkg('@playwright/test')]),
      )
      .testModule(
        'folders',
        dir('src/test-helpers/folders'),
        using((m) => [m.drivers, m.adapters, m.methods, m.ports]),
      )
      .testModule(
        'runner',
        dir('src/test-helpers/runner'),
        using((m) => [m.drivers, m.folders, pkg('node:*')]),
      )
      .module('ui', dir('src/ui'), ui)
      .testModule('registrations', files('src/test-helpers/*.ts'), using([pkg('vite-plus')]))
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
      .testModule(
        'staging',
        dir('src/test-helpers/staging'),
        using((m) => [m.adapters, m.drivers, m.ports, m.seed, m.ui, m.startUp, pkg('vite-plus')]),
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
          pkg('node:*'),
        ]),
      )
      .testModule('tests', files('src/**/*.test.ts'))
      .testModule('scripts', files('scripts/*.test.ts'))
      .testModule('e2e', dir('e2e')),
  )
  .provides((m) => ({
    domain: m.domain,
    ports: m.ports,
    adapters: m.adapters,
    methods: m.methods,
    application: m.application,
  }))
  .testUsing((m) => [
    m.seed,
    m.drivers,
    m.folders,
    m.runner,
    m.staging,
    m.registrations,
    m.ui,
    m.startUp,
    pkg('vite-plus'),
    pkg('@playwright/test'),
    pkg('@axe-core/playwright'),
    pkg('node:*'),
  ]);

const forTestCode = {
  'function-cohesion': false,
  'cognitive-complexity': false,
  'file-cohesion': false,
};

const base = ruleset()
  .on(app.modules.tests, forTestCode)
  .on(app.modules.scripts, forTestCode)
  .on(app.modules.e2e, forTestCode)
  .on(app.modules.seed, forTestCode)
  .on(app.modules.drivers, forTestCode)
  .on(app.modules.folders, forTestCode)
  .on(app.modules.runner, forTestCode)
  .on(app.modules.registrations, forTestCode)
  .on(app.modules.staging, forTestCode)
  .on(component.modules.tests, forTestCode);

export default defineConfig({ root: app, rulesets: { default: base } });
