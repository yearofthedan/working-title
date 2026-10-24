import { OBSERVED, readScenarioFile, withObserved, type Scenario } from './scenario-file';
import { stepTable, type StepAction } from './steps';

export interface ScenarioSource {
  readonly path: string;
  readonly text: string;
}

export interface Runner {
  tree(): Promise<readonly string[]>;
  write?(path: string, text: string): Promise<void>;
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

export const playScenarios = async (
  source: ScenarioSource,
  runner: Runner,
  actions: Readonly<Record<string, StepAction>>,
  options: { readonly only?: string; readonly approve?: boolean } = {},
): Promise<void> => {
  const file = readScenarioFile(source.text);
  const table = stepTable(actions);
  let approved = source.text;

  if (options.approve && runner.write === undefined) {
    throw new Error('Approving needs a runner that can write the file it read');
  }

  for (const scenario of file.scenarios) {
    if (options.only !== undefined && scenario.behaviour !== options.only) continue;
    for (const step of scenario.steps) {
      if (step.phrase === OBSERVED) continue;
      await table.play(step);
    }
    const observed = await runner.tree();

    if (options.approve) {
      approved = withObserved(approved, scenario.behaviour, observed);
      continue;
    }
    refuse(scenario, observed, source.path);
  }

  if (options.approve) await runner.write?.(source.path, approved);
};
