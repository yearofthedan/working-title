import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, test } from 'vite-plus/test';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const printed = 'the first sample printed this\n';
let sample: string;
let first: string;
let second: string;

// CI is removed so the sample runs as on a builder's machine, where Vitest writes a
// missing snapshot unless told not to.
const run = (task: string, firstText = printed) => {
  const { CI: _, ...env } = process.env;
  const result = spawnSync('./do', [task, relative(root, sample)], {
    cwd: root,
    encoding: 'utf8',
    env: { ...env, APPROVED_SAMPLE: '1', FIRST: firstText },
  });
  return { status: result.status, output: result.stdout + result.stderr };
};

beforeEach(() => {
  const dir = mkdtempSync(join(root, 'src/test-helpers/approved-sample-'));
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

afterEach(() => rmSync(dirname(sample), { recursive: true, force: true }));

describe('approved files', { timeout: 60_000 }, () => {
  test('a new scenario fails, shows what it printed, and writes no file', () => {
    const { status, output } = run('test');
    expect(status).not.toBe(0);
    expect(output).toContain(printed.trim());
    expect(output).toContain('Verify the intent of the update before continuing.');
    expect(existsSync(first)).toBe(false);
  });

  test('./do approve writes each test its own file, and the tests then pass', () => {
    expect(run('approve').status).toBe(0);
    expect(readFileSync(first, 'utf8')).toBe(printed);
    expect(readFileSync(second, 'utf8')).toBe('second\n');
    expect(run('test').status).toBe(0);
  });

  test('a changed scenario fails with the difference and leaves the file alone', () => {
    writeFileSync(first, printed);
    writeFileSync(second, 'second\n');
    const { status, output } = run('test', 'the first sample changed\n');
    expect(status).not.toBe(0);
    expect(output).toContain('- the first sample printed this');
    expect(output).toContain('+ the first sample changed');
    expect(output).toContain('Verify the intent of the update before continuing.');
    expect(readFileSync(first, 'utf8')).toBe(printed);
  });
});
