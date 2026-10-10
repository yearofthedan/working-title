import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { expect, test } from 'vite-plus/test';

// ./do and its tasks are shell, so their tests are too; this runs each file with the rest.
// A file starts a few stubbed tasks, which takes seconds under load.
const suites = [
  'do.test.sh',
  ...readdirSync('scripts')
    .filter((name) => name.endsWith('.test.sh'))
    .map((name) => `scripts/${name}`),
];

test.each(suites)('%s passes', { timeout: 30_000 }, (suite) => {
  const run = spawnSync('sh', [suite], { encoding: 'utf8' });
  expect(run.status, run.stdout + run.stderr).toBe(0);
});
