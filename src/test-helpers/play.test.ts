import { describe, expect, it } from 'vite-plus/test';
import { playScenarios, type ScenarioSource } from './play';
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

// One observation per scenario, in the order the file holds them.
const runnerSeeing = (...observations: readonly (readonly string[])[]) => {
  let at = 0;
  return { observe: async () => observations[at++] ?? [] };
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

const source = (overrides: Partial<ScenarioSource> = {}): ScenarioSource => ({
  path: 'a/toy.approved.md',
  text: file,
  ...overrides,
});

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

  it('writes what it saw where the source carries a writer, leaving every other line alone', async () => {
    let written = '';
    await playScenarios(
      source({ write: (text) => (written = text) }),
      runnerSeeing(['- main:', '  - text: A toy'], ['- main:']),
      actions,
    );

    expect(written).toBe(file);
  });
});
