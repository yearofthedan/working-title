import { readScenarioFile, withObserved, type Scenario } from './scenario-file';
import { stepTable, type StepAction } from './steps';

export interface ScenarioSource {
  /** For a failure's message. */
  readonly path: string;
  /** What the entry read from `path`, so an entry in a browser can pass it in. */
  readonly text: string;
  /** Where an approved file goes. Absent means the run compares and refuses a difference. */
  readonly write?: (text: string) => void;
}

export interface Runner {
  /** What the writer sees on the page, as the runner prints it. */
  observe(): Promise<readonly string[]>;
}

const difference = (recorded: readonly string[], observed: readonly string[]): string => {
  const lines: string[] = [];
  for (let at = 0; at < Math.max(recorded.length, observed.length); at += 1) {
    const was = recorded[at];
    const is = observed[at];
    if (was === is) {
      lines.push(` ${is ?? ''}`);
      continue;
    }
    if (was !== undefined) lines.push(`-${was}`);
    if (is !== undefined) lines.push(`+${is}`);
  }
  return lines.join('\n');
};

const refuse = (scenario: Scenario, observed: readonly string[], path: string): void => {
  const recorded = scenario.observed ?? [];
  if (recorded.join('\n') === observed.join('\n')) return;
  throw new Error(
    [
      `${path}: ${scenario.behaviour} does not see what is recorded:`,
      difference(recorded, observed),
      '',
      `Approve it with ./do approve ${path} if the change is the one you meant.`,
    ].join('\n'),
  );
};

/**
 * Play a file's scenarios against a runner, in the order they are written. Every scenario gets
 * the world the entry made for it, plays its steps, and is then compared with what the file
 * records — or, when the source carries a writer, has that recording replaced.
 */
export const playScenarios = async (
  source: ScenarioSource,
  runner: Runner,
  actions: Readonly<Record<string, StepAction>>,
): Promise<void> => {
  const file = readScenarioFile(source.text);
  const table = stepTable(actions);
  let approved = source.text;

  for (const scenario of file.scenarios) {
    for (const step of scenario.steps) await table.play(step);
    const observed = await runner.observe();
    if (source.write) {
      approved = withObserved(approved, scenario.behaviour, observed);
      continue;
    }
    refuse(scenario, observed, source.path);
  }

  source.write?.(approved);
};
