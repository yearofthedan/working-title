import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import {
  documentSelectors,
  findsAnyOtherWay,
  findsByRoleOrLabel,
  pageSelectorActions,
} from './vite.config';

const calls = [...findsByRoleOrLabel, ...findsAnyOtherWay, ...pageSelectorActions];

const callingOnPage = (call: string) =>
  `import type { Page } from '@playwright/test';\nexport const sample = (page: Page) => page.${call}('x');\n`;

const readingTheDocument = (call: string) =>
  `export const sample = () => document.${call}('main');\n`;

let samples: string;
const lintErrors = new Map<string, string[]>();
const commentRefusals = new Set<string>();
const errorsIn = (file: string) => lintErrors.get(join(samples, file)) ?? [];

beforeAll(() => {
  samples = mkdtempSync('e2e/lint-sample-');
  const files: string[] = [];
  const write = (file: string, content: string) => {
    mkdirSync(join(samples, file, '..'), { recursive: true });
    writeFileSync(join(samples, file), content);
    files.push(join(samples, file));
  };
  for (const call of calls) {
    write(`sample-${call}.ts`, callingOnPage(call));
    write(`driver-${call}/sample.driver.ts`, callingOnPage(call));
    write(`language-${call}.dsl.ts`, callingOnPage(call));
  }
  for (const call of documentSelectors) {
    write(`reading-${call}.dsl.ts`, readingTheDocument(call));
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

  const run = spawnSync('vp', ['lint', '--format', 'json', ...files], { encoding: 'utf8' });
  const { diagnostics } = JSON.parse(run.stdout) as {
    diagnostics: { code: string; filename: string; help: string }[];
  };
  for (const { code, filename, help } of diagnostics) {
    if (code === 'eslint(no-restricted-properties)') {
      lintErrors.set(filename, [...(lintErrors.get(filename) ?? []), help]);
    }
    if (code.includes('allowed-prefix')) commentRefusals.add(filename);
  }
});

afterAll(() => rmSync(samples, { recursive: true, force: true }));

describe('e2e locators', { timeout: 60_000 }, () => {
  it.each(calls)('a spec calling page.%s fails lint, pointing to the driver', (call) => {
    expect(errorsIn(`sample-${call}.ts`)).toEqual([
      expect.stringContaining('a driver, src/test-helpers/'),
    ]);
  });

  it('a spec with no locator passes lint', () => {
    expect(errorsIn('sample-no-locator.ts')).toEqual([]);
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
