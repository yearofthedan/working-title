import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import {
  componentTestRefusals,
  createsInTheDocument,
  documentSelectors,
  domGlobals,
  findsAnyOtherWay,
  findsByElement,
  findsByRoleOrLabel,
  pageSelectorActions,
  readsFromTheDocument,
  readsTheViewport,
  walksFromAnElement,
} from './vite.config';

const calls = [
  ...findsByRoleOrLabel,
  ...findsAnyOtherWay,
  ...findsByElement,
  ...pageSelectorActions,
];

const callingOnPage = (call: string) =>
  `import type { Page } from '@playwright/test';\nexport const sample = (page: Page) => page.${call}('x');\n`;

const readingTheDocument = (call: string) =>
  `export const sample = () => document.${call}('main');\n`;

const aTestFile = 'export {};\n';

const readingACard: Record<string, string> = {
  querySelector: "export const sample = (card: HTMLElement) => card.querySelector('h2');\n",
  querySelectorAll: "export const sample = (card: HTMLElement) => card.querySelectorAll('h2');\n",
  style: 'export const sample = (card: HTMLElement) => card.style.width;\n',
  getByElement:
    "import type { Locator } from 'vite-plus/test/browser';\nexport const sample = (card: Locator) => card.getByElement('.x');\n",
};

const usingTheDom: Record<string, string> = {
  document: "export const sample = (): unknown => document.createElement('div');\n",
  window: 'export const sample = (): unknown => window.innerHeight;\n',
  getComputedStyle:
    'export const sample = (element: HTMLElement): unknown => getComputedStyle(element).width;\n',
  requestAnimationFrame:
    'export const sample = (): unknown => requestAnimationFrame(() => undefined);\n',
  ResizeObserver: 'export const sample = (): unknown => new ResizeObserver(() => undefined);\n',
  localStorage: "export const sample = (): unknown => localStorage.getItem('key');\n",
};

const lookingOutsideTheRoot: Record<string, string> = {
  'document.querySelector':
    "export const sample = (): unknown => document.querySelector('main');\n",
  'document.querySelectorAll':
    "export const sample = (): unknown => document.querySelectorAll('main');\n",
  'document.getElementById':
    "export const sample = (): unknown => document.getElementById('main');\n",
  'document.addEventListener':
    "export const sample = (): void => document.addEventListener('keydown', () => undefined);\n",
  'window.addEventListener':
    "export const sample = (): void => window.addEventListener('resize', () => undefined);\n",
  'document.body': 'export const sample = (): unknown => document.body;\n',
  'document.documentElement': 'export const sample = (): unknown => document.documentElement;\n',
  'document.elementFromPoint':
    'export const sample = (): unknown => document.elementFromPoint(0, 0);\n',
  'window.scrollY': 'export const sample = (): unknown => window.scrollY;\n',
};

const walkingFromAnElement: Record<string, string> = {
  closest: "export const sample = (el: HTMLElement): unknown => el.closest('div');\n",
  parentElement: 'export const sample = (el: HTMLElement): unknown => el.parentElement;\n',
  parentNode: 'export const sample = (el: HTMLElement): unknown => el.parentNode;\n',
  getRootNode: 'export const sample = (el: HTMLElement): unknown => el.getRootNode();\n',
  ownerDocument: 'export const sample = (el: HTMLElement): unknown => el.ownerDocument;\n',
};

const drawingTheDomAsAllowed: Record<string, string> = {
  createElement: "document.createElement('div')",
  createElementNS: "document.createElementNS('http://www.w3.org/2000/svg', 'svg')",
  createTextNode: "document.createTextNode('x')",
  createDocumentFragment: 'document.createDocumentFragment()',
  fonts: 'document.fonts',
  activeElement: 'document.activeElement',
  innerHeight: 'window.innerHeight',
};

const drawingAndReadingAsAllowed = [
  'export const sample = (el: HTMLElement): unknown => [',
  ...[...createsInTheDocument, ...readsFromTheDocument, readsTheViewport].map((name) => {
    const call = drawingTheDomAsAllowed[name];
    if (call === undefined) throw new Error(`no sample draws the DOM with ${name}`);
    return `  ${call},`;
  }),
  "  el.querySelector('div'),",
  "  el.addEventListener('click', () => undefined),",
  '];',
  '',
].join('\n');

const reachingThePageInTheApp =
  "export const sample = (el: HTMLElement): unknown => [document.querySelector('main'), window.scrollY, el.closest('div')];\n";

const outsideTheRoot = (name: string) => `outside-${name.replaceAll('.', '-')}.dom.ts`;

const callingUserEvent = "export const sample = () => browser.userEvent.keyboard('a');\n";

const importingUserEvent =
  "import { userEvent } from 'vite-plus/test/browser';\nexport const sample = () => userEvent.keyboard('a');\n";

let samples: string;
let uiSamples: string;
let testFileSamples: string;
const lintErrors = new Map<string, string[]>();
const commentRefusals = new Set<string>();
const errorsIn = (file: string) => lintErrors.get(join(samples, file)) ?? [];
const uiErrorsIn = (file: string) => lintErrors.get(join(uiSamples, file)) ?? [];

beforeAll(() => {
  samples = mkdtempSync('e2e/lint-sample-');
  uiSamples = mkdtempSync('src/ui/lint-sample-');
  testFileSamples = realpathSync(mkdtempSync(join(tmpdir(), 'test-file-sample-')));
  for (const name of ['component-test.component.test.ts', 'mis-named-test.browser.test.ts'])
    writeFileSync(join(testFileSamples, name), aTestFile);
  const files: string[] = [];
  const writeIn = (root: string) => (file: string, content: string) => {
    mkdirSync(join(root, file, '..'), { recursive: true });
    writeFileSync(join(root, file), content);
    files.push(join(root, file));
  };
  const write = writeIn(samples);
  const writeInUi = writeIn(uiSamples);
  for (const call of calls) {
    write(`sample-${call}.ts`, callingOnPage(call));
    write(`driver-${call}/sample.driver.ts`, callingOnPage(call));
    write(`language-${call}.dsl.ts`, callingOnPage(call));
  }
  for (const call of documentSelectors) {
    write(`reading-${call}.dsl.ts`, readingTheDocument(call));
    write(`reading-${call}.spec.ts`, readingTheDocument(call));
  }
  for (const global of domGlobals) {
    const use = usingTheDom[global];
    if (use === undefined) throw new Error(`no sample uses ${global}`);
    writeInUi(`plain-${global}.ts`, use);
    writeInUi(`thing-${global}.dom.ts`, use);
    writeInUi(`thing-${global}.test.ts`, use);
    writeInUi(`thing-${global}.test-page.ts`, use);
  }
  for (const [name, use] of Object.entries(lookingOutsideTheRoot))
    writeInUi(outsideTheRoot(name), use);
  for (const name of walksFromAnElement) {
    const use = walkingFromAnElement[name];
    if (use === undefined) throw new Error(`no sample walks from an element with ${name}`);
    writeInUi(`outside-${name}.dom.ts`, use);
  }
  writeInUi('drawing-the-document.dom.ts', drawingAndReadingAsAllowed);
  writeInUi('app/app.dom.ts', reachingThePageInTheApp);
  write('sample-no-locator.ts', callingOnPage('reload'));
  write(
    'driver-acting-on-a-locator/sample.driver.ts',
    "import type { Page } from '@playwright/test';\nexport const sample = (page: Page) => page.getByRole('button').click();\n",
  );
  write('finding/test-helpers/driver.ts', callingOnPage('getByText'));
  write(
    'acting/test-helpers/driver.ts',
    "import type { Page } from '@playwright/test';\nexport const sample = (page: Page) => page.getByRole('button').click();\n",
  );
  write('comment-plain.ts', '// what the next line does\nexport const sample = 1;\n');
  write('comment-shortcut.ts', '// shortcut: one, until two\nexport const sample = 1;\n');

  for (const property of componentTestRefusals) {
    const use = readingACard[property];
    if (use === undefined) throw new Error(`no sample reads a card with ${property}`);
    writeInUi(`component-${property}.component.test.ts`, use);
  }
  writeInUi(
    'component-document.component.test.ts',
    'export const sample = (): number => document.body.childElementCount;\n',
  );
  writeInUi('calling-user-event/sample.component.test.ts', callingUserEvent);
  writeInUi('importing-user-event/sample.component.test.ts', importingUserEvent);
  writeInUi('finding-by-element.test-page.ts', readingACard.getByElement ?? '');
  writeInUi('unlisted/other.test.ts', callingUserEvent);
  const run = spawnSync('vp', ['lint', '--format', 'json', ...files], { encoding: 'utf8' });
  const { diagnostics } = JSON.parse(run.stdout) as {
    diagnostics: { code: string; filename: string; help: string; message: string }[];
  };
  for (const { code, filename, help, message } of diagnostics) {
    if (code.startsWith('eslint(no-restricted-') || code.startsWith('eslint-js(no-restricted-')) {
      const refusal =
        code === 'eslint(no-restricted-globals)' || code.startsWith('eslint-js(') ? message : help;
      lintErrors.set(filename, [...(lintErrors.get(filename) ?? []), refusal]);
    }
    if (code.includes('allowed-prefix')) commentRefusals.add(filename);
  }
});

afterAll(() => {
  rmSync(samples, { recursive: true, force: true });
  rmSync(uiSamples, { recursive: true, force: true });
  rmSync(testFileSamples, { recursive: true, force: true });
});

describe('e2e locators', { timeout: 60_000 }, () => {
  it.each(calls)('a spec calling page.%s fails lint, pointing to the driver', (call) => {
    expect(errorsIn(`sample-${call}.ts`)).toEqual([
      expect.stringContaining('a driver, src/test-helpers/'),
    ]);
  });

  it('a spec with no locator passes lint', () => {
    expect(errorsIn('sample-no-locator.ts')).toEqual([]);
  });

  it.each(documentSelectors)('a spec reading the document with document.%s fails lint', (call) => {
    expect(errorsIn(`reading-${call}.spec.ts`)).toEqual([
      expect.stringContaining('a driver, src/test-helpers/'),
    ]);
  });

  it.each(findsByRoleOrLabel)('the driver calling page.%s passes lint', (call) => {
    expect(errorsIn(`driver-${call}/sample.driver.ts`)).toEqual([]);
  });

  it('the driver acting on a locator it found passes lint', () => {
    expect(errorsIn('driver-acting-on-a-locator/sample.driver.ts')).toEqual([]);
  });

  it.each([...findsAnyOtherWay, ...findsByElement, ...pageSelectorActions])(
    'the driver calling page.%s fails lint',
    (call) => {
      expect(errorsIn(`driver-${call}/sample.driver.ts`)).toEqual([
        expect.stringContaining('by role or label'),
      ]);
    },
  );
});

describe('the DOM in src/ui/', { timeout: 60_000 }, () => {
  it.each(domGlobals)('a plain file using %s fails lint, pointing at a *.dom.ts', (global) => {
    expect(uiErrorsIn(`plain-${global}.ts`)).toEqual([expect.stringContaining('*.dom.ts')]);
  });

  it.each(domGlobals)('a *.dom.ts using %s passes lint', (global) => {
    expect(uiErrorsIn(`thing-${global}.dom.ts`)).toEqual([]);
  });

  it.each(domGlobals)('a test file using %s passes lint', (global) => {
    expect(uiErrorsIn(`thing-${global}.test.ts`)).toEqual([]);
  });

  it.each(domGlobals)('a test page using %s passes lint', (global) => {
    expect(uiErrorsIn(`thing-${global}.test-page.ts`)).toEqual([]);
  });

  it.each(Object.keys(lookingOutsideTheRoot))(
    'a *.dom.ts using %s outside its root fails lint',
    (name) => {
      expect(uiErrorsIn(outsideTheRoot(name))).toEqual([
        expect.stringContaining('outside its root'),
      ]);
    },
  );

  it.each(walksFromAnElement)('a *.dom.ts calling %s on an element fails lint', (name) => {
    expect(uiErrorsIn(`outside-${name}.dom.ts`)).toEqual([
      expect.stringContaining('outside its root'),
    ]);
  });

  it('a *.dom.ts drawing and reading the DOM as allowed passes lint', () => {
    expect(uiErrorsIn('drawing-the-document.dom.ts')).toEqual([]);
  });

  it('a *.dom.ts under app/ passes lint, where start-up finds the page’s elements', () => {
    expect(uiErrorsIn('app/app.dom.ts')).toEqual([]);
  });
});

describe('a component test', { timeout: 60_000 }, () => {
  it.each(componentTestRefusals)(
    'calling card.%s fails lint, pointing at the test page and staging',
    (property) => {
      expect(uiErrorsIn(`component-${property}.component.test.ts`)).toEqual([
        expect.stringMatching(/test-page\.ts.*staging\.ts/),
      ]);
    },
  );

  it('reading document fails lint, pointing at the test page and staging', () => {
    expect(uiErrorsIn('component-document.component.test.ts')).toEqual([
      expect.stringMatching(/test-page\.ts.*staging\.ts/),
    ]);
  });

  it('finding by getByElement in a test page passes lint', () => {
    expect(uiErrorsIn('finding-by-element.test-page.ts')).toEqual([]);
  });
});

describe('a component test using the writer', { timeout: 60_000 }, () => {
  it('calling browser.userEvent fails lint, pointing at the writer', () => {
    expect(uiErrorsIn('calling-user-event/sample.component.test.ts')).toEqual([
      expect.stringMatching(/writer.*testing\.md/),
    ]);
  });

  it('importing userEvent fails lint, pointing at the writer', () => {
    expect(uiErrorsIn('importing-user-event/sample.component.test.ts')).toEqual([
      expect.stringMatching(/writer.*testing\.md/),
    ]);
  });

  it('a test that is not a component test calling browser.userEvent passes lint', () => {
    expect(uiErrorsIn('unlisted/other.test.ts')).toEqual([]);
  });
});

describe('the test files a project runs', { timeout: 60_000 }, () => {
  it('runs a component test in the browser project, and a file named otherwise in node', () => {
    const run = spawnSync(
      'vp',
      [
        'test',
        'list',
        '--filesOnly',
        '--json',
        '--root',
        testFileSamples,
        '--config',
        resolve('vite.config.ts'),
      ],
      { encoding: 'utf8' },
    );
    const listed = JSON.parse(run.stdout) as { file: string; projectName: string }[];
    const projectOf = (file: string) =>
      listed.find((entry) => entry.file === resolve(testFileSamples, file))?.projectName;

    expect(projectOf('component-test.component.test.ts')).toBe('browser (chromium)');
    expect(projectOf('mis-named-test.browser.test.ts')).toBe('node');
  });
});

describe('the language', { timeout: 60_000 }, () => {
  it.each(calls)('a language file calling page.%s fails lint', (call) => {
    expect(errorsIn(`language-${call}.dsl.ts`)).toEqual([
      expect.stringContaining('finds no element'),
    ]);
  });

  it.each(documentSelectors)('a language file calling document.%s fails lint', (call) => {
    expect(errorsIn(`reading-${call}.dsl.ts`)).toEqual([
      expect.stringContaining('finds no element'),
    ]);
  });
});

describe('the driver contract', { timeout: 60_000 }, () => {
  it('the driver contract calling page.getByText fails lint', () => {
    expect(errorsIn('finding/test-helpers/driver.ts')).toEqual([
      expect.stringContaining('by role or label'),
    ]);
  });

  it('the driver contract finding by role passes lint', () => {
    expect(errorsIn('acting/test-helpers/driver.ts')).toEqual([]);
  });
});

describe('comments', { timeout: 60_000 }, () => {
  it('a comment without an allowed prefix fails lint', () => {
    expect(commentRefusals.has(join(samples, 'comment-plain.ts'))).toBe(true);
  });

  it('a shortcut: comment passes lint', () => {
    expect(commentRefusals.has(join(samples, 'comment-shortcut.ts'))).toBe(false);
  });
});
