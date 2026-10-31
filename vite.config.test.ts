import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import {
  browserTestRefusals,
  documentSelectors,
  domGlobals,
  findsAnyOtherWay,
  findsByRoleOrLabel,
  pageSelectorActions,
} from './vite.config';

const calls = [...findsByRoleOrLabel, ...findsAnyOtherWay, ...pageSelectorActions];

const callingOnPage = (call: string) =>
  `import type { Page } from '@playwright/test';\nexport const sample = (page: Page) => page.${call}('x');\n`;

const readingTheDocument = (call: string) =>
  `export const sample = () => document.${call}('main');\n`;

const readingACard: Record<string, string> = {
  querySelector: "export const sample = (card: HTMLElement) => card.querySelector('h2');\n",
  querySelectorAll: "export const sample = (card: HTMLElement) => card.querySelectorAll('h2');\n",
  style: 'export const sample = (card: HTMLElement) => card.style.width;\n',
};

const usingTheDom: Record<string, string> = {
  document: 'export const sample = (): unknown => document.body.childElementCount;\n',
  window: 'export const sample = (): unknown => window.innerHeight;\n',
  getComputedStyle:
    'export const sample = (element: HTMLElement): unknown => getComputedStyle(element).width;\n',
  requestAnimationFrame:
    'export const sample = (): unknown => requestAnimationFrame(() => undefined);\n',
  ResizeObserver: 'export const sample = (): unknown => new ResizeObserver(() => undefined);\n',
  localStorage: "export const sample = (): unknown => localStorage.getItem('key');\n",
};

let samples: string;
let uiSamples: string;
const lintErrors = new Map<string, string[]>();
const commentRefusals = new Set<string>();
const errorsIn = (file: string) => lintErrors.get(join(samples, file)) ?? [];
const uiErrorsIn = (file: string) => lintErrors.get(join(uiSamples, file)) ?? [];

beforeAll(() => {
  samples = mkdtempSync('e2e/lint-sample-');
  uiSamples = mkdtempSync('src/ui/lint-sample-');
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

  for (const property of browserTestRefusals) {
    const use = readingACard[property];
    if (use === undefined) throw new Error(`no sample reads a card with ${property}`);
    writeInUi(`browser-${property}.browser.test.ts`, use);
  }
  writeInUi(
    'browser-document.browser.test.ts',
    'export const sample = (): number => document.body.childElementCount;\n',
  );
  const run = spawnSync('vp', ['lint', '--format', 'json', ...files], { encoding: 'utf8' });
  const { diagnostics } = JSON.parse(run.stdout) as {
    diagnostics: { code: string; filename: string; help: string; message: string }[];
  };
  for (const { code, filename, help, message } of diagnostics) {
    if (code.startsWith('eslint(no-restricted-')) {
      const refusal = code === 'eslint(no-restricted-globals)' ? message : help;
      lintErrors.set(filename, [...(lintErrors.get(filename) ?? []), refusal]);
    }
    if (code.includes('allowed-prefix')) commentRefusals.add(filename);
  }
});

afterAll(() => {
  rmSync(samples, { recursive: true, force: true });
  rmSync(uiSamples, { recursive: true, force: true });
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

  it.each([...findsAnyOtherWay, ...pageSelectorActions])(
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
});

describe('a browser test', { timeout: 60_000 }, () => {
  it.each(browserTestRefusals)(
    'calling card.%s fails lint, pointing at the test page and staging',
    (property) => {
      expect(uiErrorsIn(`browser-${property}.browser.test.ts`)).toEqual([
        expect.stringMatching(/test-page\.ts.*staging\.ts/),
      ]);
    },
  );

  it('reading document fails lint, pointing at the test page and staging', () => {
    expect(uiErrorsIn('browser-document.browser.test.ts')).toEqual([
      expect.stringMatching(/test-page\.ts.*staging\.ts/),
    ]);
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
