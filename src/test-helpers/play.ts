import { narrowing } from './narrowing';
import { OBSERVED, kindOf, readScenarioFile, withObserved, type Scenario } from './scenario-file';
import { stepTable, type Evidence, type StepAction } from './steps';

export interface ScenarioSource {
  readonly path: string;
  readonly text: string;
}

export interface Runner {
  tree(markFocus: boolean): Promise<readonly string[]>;
  pageMeta?(): Promise<string>;
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
  const recorded = scenario.steps.flatMap((step) => step.observed ?? []);
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

const print = async (evidence: Evidence, runner: Runner): Promise<readonly string[]> => {
  if (evidence.kind === 'pageMeta') {
    if (runner.pageMeta === undefined) {
      throw new Error(
        'This runner reads no page meta, and a step reported some: only the Playwright runner has a page to read it from.',
      );
    }
    return [`- page title: ${await runner.pageMeta()}`];
  }
  const lines = await runner.tree(evidence.kind === 'part' && evidence.focus === true);
  return evidence.kind === 'whole' ? lines : narrowing(lines, evidence.parts);
};

export const playScenarios = async (
  source: ScenarioSource,
  runner: Runner,
  actions: Readonly<Record<string, StepAction>>,
  options: { readonly only?: string; readonly approve?: boolean } = {},
): Promise<void> => {
  const file = readScenarioFile(source.text);
  const table = stepTable({ ...actions, [OBSERVED]: () => ({ kind: 'whole' }) });
  let approved = source.text;

  if (options.approve) {
    if (runner.read === undefined || runner.write === undefined) {
      throw new Error('Approving needs a runner that can read the file as it stands and write it');
    }
    approved = await runner.read(source.path);
  }

  for (const scenario of file.scenarios) {
    if (options.only !== undefined && scenario.behaviour !== options.only) continue;
    const observed: string[] = [];
    const blocks: string[][] = [];
    for (const [at, step] of scenario.steps.entries()) {
      const kind = kindOf(scenario.steps, at);
      const reported = await table.play(step);
      if (kind !== 'Then') {
        if (reported !== undefined) {
          throw new Error(
            `${scenario.behaviour}: "${step.keyword} ${step.phrase}" is a ${kind} and reports evidence, and only a Then reports the evidence it asserted on`,
          );
        }
        continue;
      }
      if (reported === undefined) {
        throw new Error(
          `${scenario.behaviour}: "${step.keyword} ${step.phrase}" is a Then and reports nothing, and a Then reports the evidence it asserted on`,
        );
      }
      const block = [...(await print(reported, runner))];
      blocks.push(block);
      observed.push(...block);
    }

    if (options.approve) {
      approved = withObserved(approved, scenario.behaviour, blocks);
      continue;
    }
    refuse(scenario, observed, source.path);
  }

  if (options.approve) await runner.write?.(source.path, approved);
};
