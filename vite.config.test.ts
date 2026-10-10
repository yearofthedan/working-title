import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, test } from 'vite-plus/test';

const everyLocatorCall = [
  'getByRole',
  'getByLabel',
  'getByText',
  'getByPlaceholder',
  'getByAltText',
  'getByTitle',
  'getByTestId',
  'locator',
  'frameLocator',
  '$',
  '$$',
  '$eval',
  '$$eval',
  'waitForSelector',
];
const byRoleOrLabel = ['getByRole', 'getByLabel'];
const notByRoleOrLabel = everyLocatorCall.filter((call) => !byRoleOrLabel.includes(call));

const callingOnPage = (call: string) =>
  `import type { Page } from '@playwright/test';\nexport const sample = (page: Page) => page.${call}('x');\n`;

// Samples are linted where they sit, so they go in e2e/, as files Playwright does not collect.
let samples: string;
const lintErrors = new Map<string, string[]>();
const errorsIn = (file: string) => lintErrors.get(join(samples, file)) ?? [];

beforeAll(() => {
  samples = mkdtempSync('e2e/lint-sample-');
  const files: string[] = [];
  const write = (file: string, content: string) => {
    mkdirSync(join(samples, file, '..'), { recursive: true });
    writeFileSync(join(samples, file), content);
    files.push(join(samples, file));
  };
  for (const call of everyLocatorCall) {
    write(`spec-${call}.ts`, callingOnPage(call));
    write(`driver-${call}/writer.ts`, callingOnPage(call));
  }
  write('spec-no-locator.ts', callingOnPage('reload'));

  const run = spawnSync('vp', ['lint', '--format', 'json', ...files], { encoding: 'utf8' });
  const { diagnostics } = JSON.parse(run.stdout) as {
    diagnostics: { code: string; filename: string; help: string }[];
  };
  for (const { code, filename, help } of diagnostics) {
    if (code === 'eslint(no-restricted-properties)') {
      lintErrors.set(filename, [...(lintErrors.get(filename) ?? []), help]);
    }
  }
});

afterAll(() => rmSync(samples, { recursive: true, force: true }));

describe('e2e locators', { timeout: 60_000 }, () => {
  test.each(everyLocatorCall)('a spec calling %s fails lint, pointing to the driver', (call) => {
    expect(errorsIn(`spec-${call}.ts`)).toEqual([expect.stringContaining('e2e/writer.ts')]);
  });

  test('a spec with no locator passes lint', () => {
    expect(errorsIn('spec-no-locator.ts')).toEqual([]);
  });

  test.each(byRoleOrLabel)('the driver calling %s passes lint', (call) => {
    expect(errorsIn(`driver-${call}/writer.ts`)).toEqual([]);
  });

  test.each(notByRoleOrLabel)('the driver calling %s fails lint', (call) => {
    expect(errorsIn(`driver-${call}/writer.ts`)).toEqual([
      expect.stringContaining('by role or label'),
    ]);
  });
});
