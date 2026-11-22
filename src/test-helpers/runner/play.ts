import { narrowing as narrowingTheFolder, namingIds } from '../folders/folder';
import { narrowing } from '../drivers/narrowing';
import { OBSERVED, kindOf, readScenarioFile, withObserved, type Scenario } from './scenario-file';
import { stepTable, type Evidence, type StepAction } from './steps';

export interface ScenarioSource {
  readonly path: string;
  readonly text: string;
}

export interface Runner {
  tree(markFocus: boolean): Promise<readonly string[]>;
  folder?(): Promise<readonly string[]>;
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

const refuse = (scenario: Scenario, blocks: readonly (readonly string[])[], path: string): void => {
  const assertions = scenario.steps.filter((_, at) => kindOf(scenario.steps, at) === 'Then');
  for (const [at, step] of assertions.entries()) {
    const recorded = step.observed ?? [];
    const observed = blocks[at] ?? [];
    if (recorded.join('\n') === observed.join('\n')) continue;
    throw new Error(
      [
        `${path}: ${scenario.behaviour} does not see what is recorded for "${step.keyword} ${step.phrase}":`,
        difference(recorded, observed),
        '',
        `Approve it with ./do approve ${path} if the change is the one you meant.`,
      ].join('\n'),
    );
  }
};

const print = async (
  evidence: Evidence,
  runner: Runner,
  said: string,
): Promise<readonly string[]> => {
  if (evidence.kind === 'whole') return await runner.tree(false);
  const inTheFolder = evidence.parts.filter(
    (part) => part.role === 'folder' || part.role === 'file',
  );
  if (inTheFolder.length === 0) {
    return narrowing(await runner.tree(evidence.focus === true), evidence.parts);
  }
  if (inTheFolder.length !== evidence.parts.length) {
    throw new Error(
      `${said} reports a page part and a folder part, and one step reports one or the other`,
    );
  }
  if (runner.folder === undefined) {
    throw new Error(`${said} reports the folder, and this runner reads no folder`);
  }
  return namingIds(narrowingTheFolder(await runner.folder(), evidence.parts));
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
    const blocks: string[][] = [];
    for (const [at, step] of scenario.steps.entries()) {
      const kind = kindOf(scenario.steps, at);
      const said = `${scenario.behaviour}: "${step.keyword} ${step.phrase}"`;
      const reported = await table.play(step);
      if (kind !== 'Then') {
        if (reported !== undefined) {
          throw new Error(
            `${said} is a ${kind} and reports evidence, and only a Then reports the evidence it asserted on`,
          );
        }
        continue;
      }
      if (reported === undefined) {
        throw new Error(
          `${said} is a Then and reports nothing, and a Then reports the evidence it asserted on`,
        );
      }
      const block = [...(await print(reported, runner, said))];
      blocks.push(block);
    }

    if (options.approve) {
      approved = withObserved(approved, scenario.behaviour, blocks);
      continue;
    }
    refuse(scenario, blocks, source.path);
  }

  if (options.approve) await runner.write?.(source.path, approved);
};
