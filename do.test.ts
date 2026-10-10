import { spawnSync } from 'node:child_process';
import { expect, test } from 'vite-plus/test';

// ./do and its tasks are shell, so their suite is too; this runs it with the rest.
test('the ./do suite passes', () => {
  const run = spawnSync('sh', ['do.test.sh'], { encoding: 'utf8' });
  expect(run.status, run.stdout + run.stderr).toBe(0);
});
