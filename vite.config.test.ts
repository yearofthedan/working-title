import { spawnSync } from 'node:child_process';
import { mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';

let testFileSamples: string;

beforeAll(() => {
  testFileSamples = realpathSync(mkdtempSync(join(tmpdir(), 'test-file-sample-')));
  for (const name of ['component-test.component.test.ts', 'mis-named-test.browser.test.ts'])
    writeFileSync(join(testFileSamples, name), 'export {};\n');
});

afterAll(() => rmSync(testFileSamples, { recursive: true, force: true }));

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
    const listed: { file: string; projectName: string }[] = JSON.parse(run.stdout);
    const projectOf = (file: string) =>
      listed.find((entry) => entry.file === resolve(testFileSamples, file))?.projectName;

    expect(projectOf('component-test.component.test.ts')).toBe('browser (chromium)');
    expect(projectOf('mis-named-test.browser.test.ts')).toBe('node');
  });
});
