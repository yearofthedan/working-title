import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vite-plus/test';
import { expectApproved } from './src/test-helpers/approved';
import { Fixture, type Install, type Release } from './src/test-helpers/registry';
import { Scenario, printScenarios } from './src/test-helpers/scenario';

const RULE =
  "A dependency release is installed only when it is at least three days old and its publisher trust is no weaker than an earlier release's, unless an exception for it is recorded in a committed file.";

const days = (count: number): number => count * 24 * 60;
// Two days: inside this repo's three-day cutoff, and outside the one day pnpm
// falls back to when nothing sets one.
const recent = (version: string): Release => ({ version, publishedMinutesAgo: days(2) });
const mature = (version: string): Release => ({
  version,
  publishedMinutesAgo: days(5),
});

/**
 * A release carrying an attestation, then a later one without. The trusted one is
 * outside ^2.0.0, so the downgrade is the only release left to resolve.
 */
const downgradedTrust: Release[] = [
  { version: '1.0.0', publishedMinutesAgo: days(6), provenance: true },
  { version: '2.0.0', publishedMinutesAgo: days(5) },
];

/** The repo's settings plus one exception, so a case can write the lockfile it then rejects. */
const withException = (settings: string, list: string, entry: string): string =>
  settings.includes(`${list}:`)
    ? settings.replace(new RegExp(`^${list}:$`, 'm'), `${list}:\n  - ${entry}`)
    : `${settings}\n${list}:\n  - ${entry}\n`;

type Play = {
  releases: Record<string, Release[]>;
  dependencies: Record<string, string>;
  fixture?: Fixture;
  install?: Install;
};

type Step = (scenario: Scenario, play: Play) => void | Promise<void>;

const play = async (behaviour: string, steps: Step[]): Promise<Scenario> => {
  const scenario = new Scenario(behaviour);
  const state: Play = { releases: {}, dependencies: {} };
  try {
    for (const step of steps) await step(scenario, state);
  } finally {
    state.fixture?.remove();
  }
  return scenario;
};

const aDependencyWhoseNewestVersionInRangeIsLessThanThreeDaysOld = async (
  s: Scenario,
  play: Play,
) => {
  s.Given('a dependency whose newest version in range is less than three days old');
  play.releases.alpha = [recent('1.1.0')];
  play.dependencies.alpha = '^1.0.0';
  play.fixture = await Fixture.create({
    releases: play.releases,
    dependencies: play.dependencies,
  });
};

const anOlderVersionInRangeIsAtLeastThreeDaysOld = (s: Scenario, play: Play) => {
  s.And('an older version in range is at least three days old');
  play.releases.alpha = [mature('1.0.0'), ...play.releases.alpha];
  play.fixture?.publishes(play.releases);
};

const aDependencyWithNoVersionInRangeAtLeastThreeDaysOld = async (s: Scenario, play: Play) => {
  s.Given('a dependency with no version in range at least three days old');
  play.releases.alpha = [recent('1.1.0')];
  play.dependencies.alpha = '^1.0.0';
  play.fixture = await Fixture.create({
    releases: play.releases,
    dependencies: play.dependencies,
  });
};

const aDependencyVersionWithWeakerTrustEvidenceThanAnEarlierRelease = async (
  s: Scenario,
  play: Play,
) => {
  s.Given('a dependency version with weaker trust evidence than an earlier release');
  play.releases.beta = downgradedTrust;
  play.dependencies.beta = '^2.0.0';
  play.fixture = await Fixture.create({
    releases: play.releases,
    dependencies: play.dependencies,
  });
};

const theBuilderInstalls = async (s: Scenario, play: Play) => {
  s.When('the builder installs');
  play.install = await play.fixture?.install();
};

const theBuilderInstallsWithoutApprovingAnException = async (s: Scenario, play: Play) => {
  s.When('the builder installs without approving an exception');
  play.install = await play.fixture?.install();
};

const theBuilderInstallsFromATerminalAndApprovesIt = async (s: Scenario, play: Play) => {
  s.When('the builder installs from a terminal and approves it');
  play.install = await play.fixture?.approve();
};

const theOlderVersionIsInstalled = (s: Scenario, play: Play) => {
  s.Then('the older version is installed');
  expect(play.install?.status, play.install?.output).toBe(0);
  expect(play.fixture?.versionOf('alpha')).toBe('1.0.0');
};

const theInstallFailsAndNamesTheDependency = (s: Scenario, play: Play) => {
  s.Then('the install fails and names the dependency');
  expect(play.install?.status, play.install?.output).not.toBe(0);
  expect(play.install?.output).toContain('alpha@1.1.0');
  expect(play.fixture?.versionOf('alpha')).toBeUndefined();
};

const theInstallFailsAndNamesTheDependencyAndVersion = (s: Scenario, play: Play) => {
  s.Then('the install fails and names the dependency and version');
  expect(play.install?.status, play.install?.output).not.toBe(0);
  expect(play.install?.output).toContain('beta@2.0.0');
  expect(play.fixture?.versionOf('beta')).toBeUndefined();
};

const itIsInstalled = (s: Scenario, play: Play) => {
  s.Then('it is installed');
  expect(play.install?.status, play.install?.output).toBe(0);
  expect(play.fixture?.versionOf('alpha')).toBe('1.1.0');
};

const theExceptionIsRecordedInACommittedFile = (s: Scenario, play: Play) => {
  s.And('the exception is recorded in a committed file');
  const settings = play.fixture?.read('pnpm-workspace.yaml') ?? '';
  expect(settings).toContain('minimumReleaseAgeExclude:');
  expect(settings).toContain('- alpha@1.1.0');
};

describe('the install policy', { timeout: 300_000 }, () => {
  test('refuses risky releases', async () => {
    const cases: Array<[string, Step[]]> = [
      [
        'A newer version in range is passed over for an older one',
        [
          aDependencyWhoseNewestVersionInRangeIsLessThanThreeDaysOld,
          anOlderVersionInRangeIsAtLeastThreeDaysOld,
          theBuilderInstalls,
          theOlderVersionIsInstalled,
        ],
      ],
      [
        'No version in range is old enough',
        [
          aDependencyWithNoVersionInRangeAtLeastThreeDaysOld,
          theBuilderInstallsWithoutApprovingAnException,
          theInstallFailsAndNamesTheDependency,
        ],
      ],
      [
        'A version under three days old is approved as an exception',
        [
          aDependencyWithNoVersionInRangeAtLeastThreeDaysOld,
          theBuilderInstallsFromATerminalAndApprovesIt,
          itIsInstalled,
          theExceptionIsRecordedInACommittedFile,
        ],
      ],
      [
        'A release with weaker trust is refused',
        [
          aDependencyVersionWithWeakerTrustEvidenceThanAnEarlierRelease,
          theBuilderInstalls,
          theInstallFailsAndNamesTheDependencyAndVersion,
        ],
      ],
    ];
    const printed: Scenario[] = [];
    const failed: string[] = [];
    // Every case runs even when one fails, so the run names the cases a setting is
    // for rather than stopping at the first.
    for (const [behaviour, steps] of cases) {
      try {
        printed.push(await play(behaviour, steps));
      } catch (error) {
        failed.push(`${behaviour}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    expect(failed).toEqual([]);
    await expectApproved(printScenarios(RULE, printed));
  });

  test('a transitive dependency is held to the age check', async () => {
    const fixture = await Fixture.create({
      releases: {
        alpha: [mature('1.0.0'), recent('1.1.0')],
        gamma: [{ version: '1.0.0', publishedMinutesAgo: days(5), requires: { alpha: '^1.0.0' } }],
      },
      dependencies: { gamma: '^1.0.0' },
    });
    try {
      const install = await fixture.install();
      expect(install.status, install.output).toBe(0);
      expect(fixture.resolved('alpha')).toBe('1.0.0');
    } finally {
      fixture.remove();
    }
  });

  test('a transitive dependency is held to the trust check', async () => {
    const fixture = await Fixture.create({
      releases: {
        beta: downgradedTrust,
        delta: [{ version: '1.0.0', publishedMinutesAgo: days(5), requires: { beta: '^2.0.0' } }],
      },
      dependencies: { delta: '^1.0.0' },
    });
    try {
      const install = await fixture.install();
      expect(install.status, install.output).not.toBe(0);
      expect(install.output).toContain('beta@2.0.0');
    } finally {
      fixture.remove();
    }
  });

  test.each([
    [
      'age',
      { alpha: [recent('1.1.0')] },
      { alpha: '^1.0.0' },
      'minimumReleaseAgeExclude',
      'alpha@1.1.0',
    ],
    ['trust', { beta: downgradedTrust }, { beta: '^2.0.0' }, 'trustPolicyExclude', 'beta@2.0.0'],
  ])(
    'a lockfile entry that fails the %s check fails the install',
    async (_, releases, dependencies, list, entry) => {
      const settings = readFileSync('pnpm-workspace.yaml', 'utf8');
      const fixture = await Fixture.create({
        releases,
        dependencies,
        // The exception, the story's own escape hatch, is what gets the entry past the
        // checks and into a lockfile this case can then freeze.
        settings: withException(settings, list, entry),
      });
      try {
        const written = await fixture.install();
        expect(written.status, written.output).toBe(0);
        expect(fixture.read('pnpm-workspace.yaml')).toContain(entry);
        // The same frozen install passes while the entry is excepted, so what refuses
        // it next is the check and not the lockfile's shape.
        const control = await fixture.install({ frozen: true });
        expect(control.status, control.output).toBe(0);
        fixture.settings(settings);
        const install = await fixture.install({ frozen: true });
        expect(install.status, install.output).not.toBe(0);
        expect(install.output).toContain(entry);
      } finally {
        fixture.remove();
      }
    },
  );

  test('the install cutoff and the update schedule wait the same span', () => {
    const renovate = JSON.parse(readFileSync('renovate.json', 'utf8')) as {
      minimumReleaseAge: string;
    };
    const cutoff = /^minimumReleaseAge:\s*(\d+)$/m.exec(
      readFileSync('pnpm-workspace.yaml', 'utf8'),
    );
    const waited = /^(\d+) days?$/.exec(renovate.minimumReleaseAge);
    expect(cutoff?.[1], 'pnpm-workspace.yaml has no minimumReleaseAge').toBeDefined();
    expect(Number(waited?.[1]) * 24 * 60).toBe(Number(cutoff?.[1]));
  });
});
