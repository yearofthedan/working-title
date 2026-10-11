import { readFileSync } from 'node:fs';
import { expect, test } from 'vite-plus/test';

// The install cutoff (pnpm-workspace.yaml, in minutes) and the span Renovate waits
// before it offers an update (renovate.json, in days) are the same wait in two
// places that cannot share a value, so a test holds them together, as
// [the coding standard](docs/standards/coding.md) asks.
test('the install cutoff and the update schedule wait the same span', () => {
  const renovate = JSON.parse(readFileSync('renovate.json', 'utf8')) as {
    minimumReleaseAge: string;
  };
  const cutoff = /^minimumReleaseAge:\s*(\d+)$/m.exec(readFileSync('pnpm-workspace.yaml', 'utf8'));
  const waited = /^(\d+) days?$/.exec(renovate.minimumReleaseAge);
  expect(cutoff?.[1], 'pnpm-workspace.yaml has no minimumReleaseAge').toBeDefined();
  expect(Number(waited?.[1]) * 24 * 60).toBe(Number(cutoff?.[1]));
});
