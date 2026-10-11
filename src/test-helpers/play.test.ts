import { describe, expect, it } from 'vite-plus/test';
import { playScenarios, type Runner, type ScenarioSource } from './play';
import type { StepAction } from './steps';

const file = [
  'Rule: A toy rule.',
  '',
  '### Scenario: A toy behaviour',
  '',
  '```',
  'Given a toy',
  'When the writer types "the line"',
  ' └ and reloads',
  'Then the writer sees',
  '- main:',
  '  - text: A toy',
  '```',
  '',
  '### Scenario: Another behaviour',
  '',
  '```',
  'Given a toy',
  'Then the writer sees',
  '- main:',
  '```',
  '',
].join('\n');

// One tree per scenario, in the order the file holds them, with a place to record a write.
const runnerSeeing = (...trees: readonly (readonly string[])[]) => {
  let at = 0;
  const written: { path: string; text: string }[] = [];
  const runner: Runner & { written: typeof written } = {
    tree: async () => trees[at++] ?? [],
    write: async (path, text) => {
      written.push({ path, text });
    },
    written,
  };
  return runner;
};

const played: string[] = [];
const actions: Record<string, StepAction> = {
  'a toy': () => {
    played.push('a toy');
  },
  'the writer types {text}': ({ text }) => {
    played.push(`types ${text}`);
  },
  reloads: () => {
    played.push('reloads');
  },
  'the writer sees': () => {
    played.push('sees');
  },
};

const source = (path = 'a/toy.approved.md'): ScenarioSource => ({ path, text: file });

describe('playing a scenario file', () => {
  it('plays each scenario to the world the runner made for it, in the order it is written', async () => {
    played.length = 0;
    await playScenarios(
      source(),
      runnerSeeing(['- main:', '  - text: A toy'], ['- main:']),
      actions,
    );
    expect(played).toEqual(['a toy', 'types "the line"', 'reloads', 'sees', 'a toy', 'sees']);
  });

  it('passes when every scenario sees what the file records', async () => {
    await playScenarios(
      source(),
      runnerSeeing(['- main:', '  - text: A toy'], ['- main:']),
      actions,
    );
  });

  it('plays the one scenario it is asked for, and only that one', async () => {
    played.length = 0;
    await playScenarios(source(), runnerSeeing(['- main:']), actions, {
      only: 'Another behaviour',
    });
    expect(played).toEqual(['a toy', 'sees']);
  });

  it('refuses a difference, showing it as lines and naming the file', async () => {
    const message = await playScenarios(
      source(),
      runnerSeeing(['- main:', '  - text: Something else'], ['- main:']),
      actions,
    ).catch((error: Error) => error.message);

    expect(message).toBe(
      [
        'a/toy.approved.md: A toy behaviour does not see what is recorded:',
        ' - main:',
        '-  - text: A toy',
        '+  - text: Something else',
        '',
        'Approve it with ./do approve a/toy.approved.md if the change is the one you meant.',
      ].join('\n'),
    );
  });

  it('replaces what it saw where it is approving, and writes the file through the runner', async () => {
    const runner = runnerSeeing(['- main:', '  - text: A toy'], ['- main:']);
    await playScenarios(source('a/wanted.approved.md'), runner, actions, { approve: true });

    expect(runner.written).toEqual([{ path: 'a/wanted.approved.md', text: file }]);
  });
});
