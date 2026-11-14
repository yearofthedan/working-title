import { narrowing, type Part } from './narrowing';
import { OBSERVED, readScenarioFile, withObserved, type Scenario } from './scenario-file';
import { stepTable, type StepAction } from './steps';

export interface ScenarioSource {
  readonly path: string;
  readonly text: string;
}

export interface Runner {
  tree(): Promise<readonly string[]>;
  read?(path: string): Promise<string>;
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

const distinct = (parts: readonly Part[]): readonly Part[] => {
  const named = new Set<string>();
  return parts.filter((part) => {
    const key = `${part.role} ${part.name}`.toLowerCase();
    if (named.has(key)) return false;
    named.add(key);
    return true;
  });
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

  if (options.approve) {
    if (runner.read === undefined || runner.write === undefined) {
      throw new Error('Approving needs a runner that can read the file as it stands and write it');
    }
    approved = await runner.read(source.path);
  }

  for (const scenario of file.scenarios) {
    if (options.only !== undefined && scenario.behaviour !== options.only) continue;
    const parts: Part[] = [];
    for (const step of scenario.steps) {
      if (step.phrase === OBSERVED) continue;
      parts.push(...(await table.play(step)));
    }
    const observed = scenario.steps.some((step) => step.phrase === OBSERVED)
      ? await runner.tree()
      : narrowing(await runner.tree(), distinct(parts));

    if (options.approve) {
      approved = withObserved(approved, scenario.behaviour, observed);
      continue;
    }
    refuse(scenario, observed, source.path);
  }

  if (options.approve) await runner.write?.(source.path, approved);
};
