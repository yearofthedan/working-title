import { describe, expect, test } from 'vite-plus/test';
import { Fixture } from './registry';

const HOUR = 60;
const DAY = 24 * HOUR;

describe('the fixture registry', { timeout: 120_000 }, () => {
  test('serves a release a policy would hold back, and pnpm installs it with none set', async () => {
    const fixture = await Fixture.create({
      releases: {
        'working-title-fixture-alpha': [
          { version: '1.0.0', publishedMinutesAgo: 5 * DAY },
          { version: '1.1.0', publishedMinutesAgo: 6 * HOUR },
        ],
      },
      dependencies: { 'working-title-fixture-alpha': '^1.0.0' },
      settings: 'minimumReleaseAge: 0\ntrustPolicy: off\n',
    });
    try {
      const install = await fixture.install();
      expect(install.status, install.output).toBe(0);
      expect(fixture.versionOf('working-title-fixture-alpha')).toBe('1.1.0');
      expect(fixture.resolved('working-title-fixture-alpha')).toBe('1.1.0');
    } finally {
      fixture.remove();
    }
  });
});
