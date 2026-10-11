import { readScenarioFile, withObserved, type Scenario } from './scenario-file';
import { stepTable, type StepAction } from './steps';

export interface ScenarioSource {
  /** For a failure's message, and where an approved file goes. */
  readonly path: string;
  /** What the entry read from `path`, so an entry in a browser can pass it in. */
  readonly text: string;
}

/**
 * A runner sees what the writer sees. Both of ours hand the tree back — Playwright with
 * `ariaSnapshot()`, Vitest browser mode with `renderAriaTree(generateAriaTree(element))` — so
 * the harness compares it and shows a difference, and an approving run writes the file through
 * the runner: the Node side writes it, a browser sends it to the server.
 */
export interface Runner {
  /** What the page shows, as the runner prints it. */
  tree(): Promise<readonly string[]>;
  /** Write an approved scenario file. */
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

/**
 * Play a file's scenarios against a runner, in the order they are written. The entry gives each
 * scenario its own world; each plays its steps and is then compared with what the file records
 * — or, when approving, has that recording replaced and the file written.
 */
export const playScenarios = async (
  source: ScenarioSource,
  runner: Runner,
  actions: Readonly<Record<string, StepAction>>,
  options: { readonly only?: string; readonly approve?: boolean } = {},
): Promise<void> => {
  const file = readScenarioFile(source.text);
  const table = stepTable(actions);
  let approved = source.text;

  for (const scenario of file.scenarios) {
    if (options.only !== undefined && scenario.behaviour !== options.only) continue;
    for (const step of scenario.steps) await table.play(step);
    const observed = await runner.tree();

    if (options.approve) {
      approved = withObserved(approved, scenario.behaviour, observed);
      continue;
    }
    refuse(scenario, observed, source.path);
  }

  if (options.approve) await runner.write?.(source.path, approved);
};
