import { spawnSync } from 'node:child_process';
import { expect, test } from 'vite-plus/test';

// The scripts are shell, so their suite is too; this runs it with the rest.
test('the scripts suite passes', () => {
  const run = spawnSync('sh', ['tests/scripts.test.sh'], { encoding: 'utf8' });
  expect(run.status, run.stdout + run.stderr).toBe(0);
});
