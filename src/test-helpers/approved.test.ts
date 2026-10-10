import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vite-plus/test';
import { expectApproved } from './approved';
import { Scenario, printScenarios } from './scenario';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const printed = 'the first sample printed this\n';
const changed = 'the first sample changed\n';

// A test file with two scenario tests, in a folder of its own that only its runs collect.
class Sample {
  readonly file: string;
  readonly first: string;
  readonly second: string;
  prints = printed;
  status: number | null = null;
  output = '';

  constructor() {
    const dir = mkdtempSync(join(root, 'src/test-helpers/approved-sample-'));
    this.file = join(dir, 'sample.test.ts');
    this.first = join(dir, 'sample.first-scenario.approved.md');
    this.second = join(dir, 'sample.second-scenario.approved.md');
    writeFileSync(
      this.file,
      [
        "import { test } from 'vite-plus/test';",
        "import { expectApproved } from '../approved';",
        "test('first scenario', () => expectApproved(process.env.FIRST ?? ''));",
        "test('second scenario', () => expectApproved('second\\n'));",
        '',
      ].join('\n'),
    );
  }

  approve(): void {
    writeFileSync(this.first, printed);
    writeFileSync(this.second, 'second\n');
  }

  // CI is removed so the sample runs as on a builder's machine, where Vitest writes a
  // missing snapshot unless told not to.
  run(task: string): void {
    const { CI: _, ...env } = process.env;
    const result = spawnSync('./do', [task, relative(root, this.file)], {
      cwd: root,
      encoding: 'utf8',
      env: { ...env, APPROVED_SAMPLE: '1', FIRST: this.prints },
    });
    this.status = result.status;
    this.output = result.stdout + result.stderr;
  }

  remove(): void {
    rmSync(dirname(this.file), { recursive: true, force: true });
  }
}

const aScenarioTestWhosePrintedScenarioMatchesItsApprovedMd = (s: Scenario, sample: Sample) => {
  s.Given('a scenario test whose printed scenario matches its .approved.md');
  sample.approve();
};

const aScenarioTestWhosePrintedScenarioDiffersFromItsApprovedMd = (s: Scenario, sample: Sample) => {
  s.Given('a scenario test whose printed scenario differs from its .approved.md');
  sample.approve();
  sample.prints = changed;
};

const aScenarioTestWithNoApprovedMd = (s: Scenario) => {
  s.Given('a scenario test with no .approved.md');
};

const aFailingScenarioTestWhosePrintedScenarioIsTheOneAgreedInTheStory = (
  s: Scenario,
  sample: Sample,
) => {
  s.Given('a failing scenario test whose printed scenario is the one agreed in the story');
  sample.run('test');
  expect(sample.status).not.toBe(0);
};

const theTestsRun = (s: Scenario, sample: Sample) => {
  s.When('the tests run');
  sample.run('test');
};

const doApproveIsRunForIt = (s: Scenario, sample: Sample) => {
  s.When('./do approve is run for it');
  sample.run('approve');
};

const itPasses = (s: Scenario, sample: Sample) => {
  s.Then('it passes');
  expect(sample.status, sample.output).toBe(0);
};

const itFailsShowingTheDifferenceAsScenarioLines = (s: Scenario, sample: Sample) => {
  s.Then('it fails, showing the difference as scenario lines');
  expect(sample.status).not.toBe(0);
  expect(sample.output).toContain(`- ${printed.trim()}`);
  expect(sample.output).toContain(`+ ${changed.trim()}`);
  expect(sample.output).toContain('Verify the intent of the update before continuing.');
};

const theApprovedMdIsUnchanged = (s: Scenario, sample: Sample) => {
  s.And('the .approved.md is unchanged');
  expect(readFileSync(sample.first, 'utf8')).toBe(printed);
};

const itFailsShowsThePrintedScenarioAndWritesNoApprovedMd = (s: Scenario, sample: Sample) => {
  s.Then('it fails, shows the printed scenario, and writes no .approved.md');
  expect(sample.status).not.toBe(0);
  expect(sample.output).toContain(printed.trim());
  expect(sample.output).toContain('Verify the intent of the update before continuing.');
  expect(existsSync(sample.first)).toBe(false);
};

const itsApprovedMdHoldsThePrintedScenarioAndTheTestPasses = (s: Scenario, sample: Sample) => {
  s.Then('its .approved.md holds the printed scenario and the test passes');
  expect(readFileSync(sample.first, 'utf8')).toBe(printed);
  sample.run('test');
  expect(sample.status, sample.output).toBe(0);
};

const play = (behaviour: string, steps: (s: Scenario, sample: Sample) => void): Scenario => {
  const scenario = new Scenario(behaviour);
  const sample = new Sample();
  try {
    steps(scenario, sample);
  } finally {
    sample.remove();
  }
  return scenario;
};

describe('approved files', { timeout: 120_000 }, () => {
  test('the harness approves its own scenarios', async () => {
    const scenarios = [
      play('A matching scenario passes', (s, sample) => {
        aScenarioTestWhosePrintedScenarioMatchesItsApprovedMd(s, sample);
        theTestsRun(s, sample);
        itPasses(s, sample);
      }),
      play('A changed behaviour fails with a readable difference', (s, sample) => {
        aScenarioTestWhosePrintedScenarioDiffersFromItsApprovedMd(s, sample);
        theTestsRun(s, sample);
        itFailsShowingTheDifferenceAsScenarioLines(s, sample);
        theApprovedMdIsUnchanged(s, sample);
      }),
      play('A new scenario fails until approved', (s, sample) => {
        aScenarioTestWithNoApprovedMd(s);
        theTestsRun(s, sample);
        itFailsShowsThePrintedScenarioAndWritesNoApprovedMd(s, sample);
      }),
      play('Approving a wanted change', (s, sample) => {
        aFailingScenarioTestWhosePrintedScenarioIsTheOneAgreedInTheStory(s, sample);
        doApproveIsRunForIt(s, sample);
        itsApprovedMdHoldsThePrintedScenarioAndTheTestPasses(s, sample);
      }),
    ];
    await expectApproved(
      printScenarios(
        'A scenario test passes only when the scenario it prints matches its approved file, and only `./do approve` changes that file.',
        scenarios,
      ),
    );
  });

  test('two scenario tests in one file each have their own approved file', () => {
    const sample = new Sample();
    try {
      sample.run('approve');
      expect(readFileSync(sample.first, 'utf8')).toBe(printed);
      expect(readFileSync(sample.second, 'utf8')).toBe('second\n');
    } finally {
      sample.remove();
    }
  });
});
