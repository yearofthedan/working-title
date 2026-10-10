import { spawnSync } from 'node:child_process';
import { expect, test } from 'vite-plus/test';

// ./do and its tasks are shell, so their suite is too; this runs it with the rest.
// The suite starts a dozen stubbed tasks, which takes seconds under load.
test('the ./do suite passes', { timeout: 30_000 }, () => {
  const run = spawnSync('sh', ['do.test.sh'], { encoding: 'utf8' });
  expect(run.status, run.stdout + run.stderr).toBe(0);
});
