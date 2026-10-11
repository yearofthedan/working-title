import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vite-plus/test';
import { expectApproved } from './approved';
import { Scenario, printScenarios } from './scenario';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
// The sample's first test prints a scenario ending in the outcome $FIRST names; its
// second is always approved, so a failure is the first test's.
const outcome = 'the first sample does this';
const changedOutcome = 'the first sample does that';
const sampleScenario = (then: string) =>
  printScenarios('A sample rule.', [
    new Scenario('A sample behaviour').Given('a sample').Then(then),
  ]);
const printed = sampleScenario(outcome);
const secondPrinted = printScenarios('A sample rule.', [new Scenario('Another').Given('another')]);

class Sample {
  readonly file: string;
  readonly first: string;
  readonly second: string;
  prints = outcome;
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
        "import { Scenario, printScenarios } from '../scenario';",
        "const print = (s: Scenario) => printScenarios('A sample rule.', [s]);",
        "test('first scenario', () =>",
        "  expectApproved(print(new Scenario('A sample behaviour').Given('a sample').Then(process.env.FIRST ?? ''))));",
        "test('second scenario', () => expectApproved(print(new Scenario('Another').Given('another'))));",
        '',
      ].join('\n'),
    );
  }

  approveFirst(): void {
    writeFileSync(this.first, printed);
  }

  approveSecond(): void {
    writeFileSync(this.second, secondPrinted);
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
  sample.approveFirst();
  sample.approveSecond();
};

const aScenarioTestWhosePrintedScenarioDiffersFromItsApprovedMd = (s: Scenario, sample: Sample) => {
  s.Given('a scenario test whose printed scenario differs from its .approved.md');
  sample.approveFirst();
  sample.approveSecond();
  sample.prints = changedOutcome;
};

const aScenarioTestWithNoApprovedMd = (s: Scenario, sample: Sample) => {
  s.Given('a scenario test with no .approved.md');
  sample.approveSecond();
};

const aFailingScenarioTestWhosePrintedScenarioIsTheOneAgreedInTheStory = (
  s: Scenario,
  sample: Sample,
) => {
  s.Given('a failing scenario test whose printed scenario is the one agreed in the story');
  sample.approveFirst();
  sample.approveSecond();
  sample.prints = changedOutcome;
  sample.run('test');
  expect(sample.status).not.toBe(0);
  expect(sample.output).toContain('FAIL');
  expect(sample.output).toContain('first scenario');
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
  expect(sample.output).toContain(`- Then ${outcome}`);
  expect(sample.output).toContain(`+ Then ${changedOutcome}`);
  expect(sample.output).toContain('Verify the intent of the update before continuing.');
};

const theApprovedMdIsUnchanged = (s: Scenario, sample: Sample) => {
  s.And('the .approved.md is unchanged');
  expect(readFileSync(sample.first, 'utf8')).toBe(printed);
};

const itFailsShowsThePrintedScenarioAndWritesNoApprovedMd = (s: Scenario, sample: Sample) => {
  s.Then('it fails, shows the printed scenario, and writes no .approved.md');
  expect(sample.status).not.toBe(0);
  expect(sample.output).toContain('sample.first-scenario.approved.md is not approved yet');
  expect(sample.output).toContain(printed.trim());
  expect(sample.output).toContain('Verify the intent of the update before continuing.');
  expect(existsSync(sample.first)).toBe(false);
};

const itsApprovedMdHoldsThePrintedScenarioAndTheTestPasses = (s: Scenario, sample: Sample) => {
  s.Then('its .approved.md holds the printed scenario and the test passes');
  expect(readFileSync(sample.first, 'utf8')).toBe(sampleScenario(changedOutcome));
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
  it('the harness approves its own scenarios', async () => {
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
        aScenarioTestWithNoApprovedMd(s, sample);
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

  it('two scenario tests in one file each have their own approved file', () => {
    const sample = new Sample();
    try {
      sample.run('approve');
      expect(readFileSync(sample.first, 'utf8')).toBe(printed);
      expect(readFileSync(sample.second, 'utf8')).toBe(secondPrinted);
    } finally {
      sample.remove();
    }
  });
});
