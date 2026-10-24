import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { expect, it } from 'vite-plus/test';

const suites = [
  'do.test.sh',
  ...readdirSync('scripts')
    .filter((name) => name.endsWith('.test.sh'))
    .map((name) => `scripts/${name}`),
];

it.each(suites)('%s passes', { timeout: 30_000 }, (suite) => {
  const run = spawnSync('sh', [suite], { encoding: 'utf8' });
  expect(run.status, run.stdout + run.stderr).toBe(0);
});
