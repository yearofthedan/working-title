import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import { findsAnyOtherWay, findsByRoleOrLabel, pageSelectorActions } from './vite.config';

const calls = [...findsByRoleOrLabel, ...findsAnyOtherWay, ...pageSelectorActions];

const callingOnPage = (call: string) =>
  `import type { Page } from '@playwright/test';\nexport const sample = (page: Page) => page.${call}('x');\n`;

// Samples are linted where they sit, so they go in e2e/, named so that Playwright's
// default testMatch does not collect them (https://playwright.dev/docs/api/class-testconfig#test-config-test-match).
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
  for (const call of calls) {
    write(`spec-${call}.ts`, callingOnPage(call));
    write(`driver-${call}/writer.ts`, callingOnPage(call));
  }
  write('spec-no-locator.ts', callingOnPage('reload'));
  write(
    'driver-acting-on-a-locator/writer.ts',
    "import type { Page } from '@playwright/test';\nexport const sample = (page: Page) => page.getByRole('button').click();\n",
  );

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
  it.each(calls)('a spec calling page.%s fails lint, pointing to the driver', (call) => {
    expect(errorsIn(`spec-${call}.ts`)).toEqual([expect.stringContaining('e2e/writer.ts')]);
  });

  it('a spec with no locator passes lint', () => {
    expect(errorsIn('spec-no-locator.ts')).toEqual([]);
  });

  it.each(findsByRoleOrLabel)('the driver calling page.%s passes lint', (call) => {
    expect(errorsIn(`driver-${call}/writer.ts`)).toEqual([]);
  });

  it('the driver acting on a locator it found passes lint', () => {
    expect(errorsIn('driver-acting-on-a-locator/writer.ts')).toEqual([]);
  });

  it.each([...findsAnyOtherWay, ...pageSelectorActions])(
    'the driver calling page.%s fails lint',
    (call) => {
      expect(errorsIn(`driver-${call}/writer.ts`)).toEqual([
        expect.stringContaining('by role or label'),
      ]);
    },
  );
});
