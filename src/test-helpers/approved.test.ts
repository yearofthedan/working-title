import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, test } from 'vite-plus/test';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
let sample: string;
let first: string;
let second: string;

// Each case runs a sample test file in a fresh Vitest, with the env of this one removed. A run
// that reaches this file again, as `./do approve -t <name>` with no file would, skips it.
const run = (task: string, firstText = 'first\n') => {
  const env = Object.fromEntries(
    Object.entries(process.env).filter(([key]) => !key.startsWith('VITEST') && key !== 'CI'),
  );
  const result = spawnSync('./do', [task, relative(root, sample)], {
    cwd: root,
    encoding: 'utf8',
    env: { ...env, FIRST: firstText, INSIDE_APPROVED_TEST: '1' },
  });
  return { status: result.status, output: result.stdout + result.stderr };
};

beforeAll(() => {
  const dir = mkdtempSync(join(root, 'src/test-helpers/fixture-'));
  sample = join(dir, 'sample.test.ts');
  first = join(dir, 'sample.first-scenario.approved.md');
  second = join(dir, 'sample.second-scenario.approved.md');
  writeFileSync(
    sample,
    [
      "import { test } from 'vite-plus/test';",
      "import { expectApproved } from '../approved';",
      "test('first scenario', () => expectApproved(process.env.FIRST ?? ''));",
      "test('second scenario', () => expectApproved('second\\n'));",
      '',
    ].join('\n'),
  );
});

afterAll(() => rmSync(dirname(sample), { recursive: true, force: true }));

describe.skipIf(process.env.INSIDE_APPROVED_TEST)('approved files', { timeout: 60_000 }, () => {
  test('a new scenario fails, shows what it printed, and writes no file', () => {
    const { status, output } = run('test');
    expect(status).not.toBe(0);
    expect(output).toContain('is not approved yet. The scenario printed:');
    expect(output).toContain('first');
    expect(existsSync(first)).toBe(false);
  });

  test('./do approve writes each test its own file, and the tests then pass', () => {
    expect(run('approve').status).toBe(0);
    expect(readFileSync(first, 'utf8')).toBe('first\n');
    expect(readFileSync(second, 'utf8')).toBe('second\n');
    expect(run('test').status).toBe(0);
  });

  test('a changed scenario fails with the difference and leaves the file alone', () => {
    const { status, output } = run('test', 'changed\n');
    expect(status).not.toBe(0);
    expect(output).toMatch(/- first/);
    expect(output).toMatch(/\+ changed/);
    expect(readFileSync(first, 'utf8')).toBe('first\n');
  });
});
