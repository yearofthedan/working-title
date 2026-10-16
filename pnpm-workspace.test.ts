import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { expect, it } from 'vite-plus/test';

// One wait in two files that cannot share a value: minutes here, days there.
it('the install cutoff and the update schedule wait the same span', () => {
  const renovate = JSON.parse(readFileSync('renovate.json', 'utf8')) as {
    minimumReleaseAge: string;
  };
  const cutoff = /^minimumReleaseAge:\s*(\d+)$/m.exec(readFileSync('pnpm-workspace.yaml', 'utf8'));
  const waited = /^(\d+) days?$/.exec(renovate.minimumReleaseAge);
  expect(cutoff?.[1], 'pnpm-workspace.yaml has no minimumReleaseAge').toBeDefined();
  expect(Number(waited?.[1]) * 24 * 60).toBe(Number(cutoff?.[1]));
});

// As pnpm reads them, not as the file spells them.
it('pnpm reads the install policy this repository sets', () => {
  const read = (setting: string) => {
    const result = spawnSync('pnpm', ['config', 'get', setting], { encoding: 'utf8' });
    expect(result.status, result.stderr).toBe(0);
    return result.stdout.trim();
  };
  expect(read('minimumReleaseAge')).toBe(String(3 * 24 * 60));
  expect(read('trustPolicy')).toBe('no-downgrade');
});

// pnpm's own approval prompt writes an exception without a reason above it.
it.each(['minimumReleaseAgeExclude', 'trustPolicyExclude'])(
  'every entry in %s is named by a reason above it',
  (list) => {
    const lines = readFileSync('pnpm-workspace.yaml', 'utf8').split('\n');
    const key = lines.indexOf(`${list}:`);
    if (key === -1) return;
    const reasons: string[] = [];
    for (let above = key - 1; above >= 0 && lines[above].startsWith('#'); above -= 1) {
      reasons.push(lines[above]);
    }
    for (let entry = key + 1; lines[entry]?.startsWith('  - '); entry += 1) {
      const named = lines[entry].replace(/^ {2}- '?|'$/g, '');
      expect(
        reasons.some((reason) => reason.includes(named)),
        `${named} is in ${list} with no reason above it`,
      ).toBe(true);
    }
  },
);
