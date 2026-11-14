import { describe, expect, it } from 'vite-plus/test';
import { playScenarios, type Runner, type ScenarioSource } from './play';
import { reporting, reportingFocus, type StepAction } from './steps';

const theToy = { text: 'Nothing yet' };

const toyTree = (markFocus: boolean): readonly string[] => [
  '- group "A toy":',
  `  - text: ${theToy.text}`,
  ...(markFocus ? ['  - button "A toy" [active]'] : []),
  '- group "Another toy":',
  '  - text: Not this one',
];

const file = [
  'Rule: A toy rule.',
  '',
  '### Scenario: A toy behaviour',
  '',
  '```',
  'Given a toy',
  'When the writer types "the line"',
  'And reloads',
  'Then a named toy',
  '- group "A toy":',
  '  - text: the line',
  '```',
  '',
  '### Scenario: Another behaviour',
  '',
  '```',
  'Given a toy',
  'Then the writer sees',
  '- group "A toy":',
  '  - text: Nothing yet',
  '- group "Another toy":',
  '  - text: Not this one',
  '```',
  '',
].join('\n');

const runnerFor = (text: string) => {
  let held = text;
  const written: { path: string; text: string }[] = [];
  const marked: boolean[] = [];
  const runner: Runner & { written: typeof written; marked: typeof marked } = {
    tree: async (markFocus) => {
      marked.push(markFocus);
      return toyTree(markFocus);
    },
    read: async () => held,
    write: async (path, next) => {
      held = next;
      written.push({ path, text: next });
    },
    written,
    marked,
  };
  return runner;
};

const played: string[] = [];
const actions: Record<string, StepAction> = {
  'a toy': () => {
    played.push('a toy');
    theToy.text = 'Nothing yet';
  },
  'the writer types "{text}"': ({ text }) => {
    played.push(`types ${text}`);
    theToy.text = text ?? '';
  },
  reloads: () => {
    played.push('reloads');
  },
  'a named toy': () => reporting({ role: 'group', name: 'A toy' }),
  'another toy': () => reporting({ role: 'group', name: 'A toy' }),
};

const source = (path = 'a/toy.approved.md'): ScenarioSource => ({ path, text: file });

const aScenario = (...lines: readonly string[]): string =>
  ['Rule: A toy rule.', '', '### Scenario: A toy behaviour', '', '```', ...lines, '```', ''].join(
    '\n',
  );

describe('playing a scenario file', () => {
  it('plays each scenario to the world the runner made for it, in the order it is written', async () => {
    played.length = 0;
    await playScenarios(source(), runnerFor(file), actions);
    expect(played).toEqual(['a toy', 'types the line', 'reloads', 'a toy']);
  });

  it('passes when every scenario sees what the file records', async () => {
    await playScenarios(source(), runnerFor(file), actions);
  });

  it('reads the tree right after each assertion, so each block shows the page its steps left', async () => {
    const two = aScenario(
      'Given a toy',
      'When the writer types "Maren"',
      'Then a named toy',
      'And another toy',
    );
    const runner = runnerFor(two);

    await playScenarios({ path: 'a/toy.approved.md', text: two }, runner, actions, {
      approve: true,
    });

    expect(runner.marked).toEqual([false, false]);
    expect(runner.written.at(-1)?.text).toBe(
      aScenario(
        'Given a toy',
        'When the writer types "Maren"',
        'Then a named toy',
        '- group "A toy":',
        '  - text: Maren',
        'And another toy',
        '- group "A toy":',
        '  - text: Maren',
      ),
    );
  });

  it('asks for the marked tree only for the step that checks focus', async () => {
    const two = aScenario(
      'Given a toy',
      'Then a named toy',
      '- group "A toy":',
      '  - text: Nothing yet',
      'And the focus is on it',
      '- group "A toy":',
      '  - text: Nothing yet',
      '  - button "A toy" [active]',
    );
    const runner = runnerFor(two);

    await playScenarios({ path: 'a/toy.approved.md', text: two }, runner, {
      ...actions,
      'the focus is on it': () => reportingFocus({ role: 'group', name: 'A toy' }),
    });

    expect(runner.marked).toEqual([false, true]);
  });

  it('narrows a block to the parts that step reported', async () => {
    const named = aScenario('Given a toy', 'Then a named toy');
    const runner = runnerFor(named);

    await playScenarios({ path: 'a/toy.approved.md', text: named }, runner, actions, {
      approve: true,
    });

    expect(runner.written.at(-1)?.text).toBe(
      aScenario('Given a toy', 'Then a named toy', '- group "A toy":', '  - text: Nothing yet'),
    );
  });

  it('takes "the writer sees" as an assertion reporting the whole tree', async () => {
    const sees = aScenario('Given a toy', 'Then the writer sees');
    const runner = runnerFor(sees);

    await playScenarios({ path: 'a/toy.approved.md', text: sees }, runner, actions, {
      approve: true,
    });

    expect(runner.written.at(-1)?.text).toBe(
      aScenario(
        'Given a toy',
        'Then the writer sees',
        '- group "A toy":',
        '  - text: Nothing yet',
        '- group "Another toy":',
        '  - text: Not this one',
      ),
    );
  });

  it('takes "And the writer sees" under a Then as the whole tree too', async () => {
    const sees = aScenario('Given a toy', 'Then a named toy', 'And the writer sees');
    const runner = runnerFor(sees);

    await playScenarios({ path: 'a/toy.approved.md', text: sees }, runner, actions, {
      approve: true,
    });

    expect(runner.written.at(-1)?.text).toBe(
      aScenario(
        'Given a toy',
        'Then a named toy',
        '- group "A toy":',
        '  - text: Nothing yet',
        'And the writer sees',
        '- group "A toy":',
        '  - text: Nothing yet',
        '- group "Another toy":',
        '  - text: Not this one',
      ),
    );
  });

  it('refuses a difference, showing it as lines and naming the step', async () => {
    const wrong = aScenario(
      'Given a toy',
      'Then a named toy',
      '- group "A toy":',
      '  - text: Something else',
    );
    const message = await playScenarios(
      { path: 'a/toy.approved.md', text: wrong },
      runnerFor(wrong),
      actions,
    ).catch((error: Error) => error.message);

    expect(message).toBe(
      [
        'a/toy.approved.md: A toy behaviour does not see what is recorded for "Then a named toy":',
        ' - group "A toy":',
        '-  - text: Something else',
        '+  - text: Nothing yet',
        '',
        'Approve it with ./do approve a/toy.approved.md if the change is the one you meant.',
      ].join('\n'),
    );
  });

  it('refuses a block line a hand-edited file moved to another assertion', async () => {
    const moved = aScenario(
      'Given a toy',
      'Then a named toy',
      '- group "A toy":',
      'And another toy',
      '  - text: Nothing yet',
      '- group "A toy":',
      '  - text: Nothing yet',
    );
    const message = await playScenarios(
      { path: 'a/toy.approved.md', text: moved },
      runnerFor(moved),
      actions,
    ).catch((error: Error) => error.message);

    expect(message).toBe(
      [
        'a/toy.approved.md: A toy behaviour does not see what is recorded for "Then a named toy":',
        ' - group "A toy":',
        '+  - text: Nothing yet',
        '',
        'Approve it with ./do approve a/toy.approved.md if the change is the one you meant.',
      ].join('\n'),
    );
  });

  it('refuses a Then that reports nothing', async () => {
    const named = aScenario('Given a toy', 'Then a toy');

    await expect(
      playScenarios({ path: 'a/toy.approved.md', text: named }, runnerFor(named), actions),
    ).rejects.toThrow(
      'A toy behaviour: "Then a toy" is a Then and reports nothing, and a Then reports the evidence it asserted on',
    );
  });

  it('refuses a step under a Given or a When that reports evidence', async () => {
    const given = aScenario('Given a named toy', 'Then a named toy');

    await expect(
      playScenarios({ path: 'a/toy.approved.md', text: given }, runnerFor(given), actions),
    ).rejects.toThrow(
      'A toy behaviour: "Given a named toy" is a Given and reports evidence, and only a Then reports the evidence it asserted on',
    );
  });

  it('refuses an And under a When that reports evidence', async () => {
    const when = aScenario('Given a toy', 'When a named toy', 'Then a named toy');

    await expect(
      playScenarios({ path: 'a/toy.approved.md', text: when }, runnerFor(when), actions),
    ).rejects.toThrow('"When a named toy" is a When and reports evidence');
  });

  it('refuses an And under a Then that reports nothing', async () => {
    const nothing = aScenario('Given a toy', 'Then a named toy', 'And a toy');

    await expect(
      playScenarios({ path: 'a/toy.approved.md', text: nothing }, runnerFor(nothing), actions),
    ).rejects.toThrow('"And a toy" is a Then and reports nothing');
  });

  it('plays the one scenario it is asked for, and only that one', async () => {
    played.length = 0;
    await playScenarios(source(), runnerFor(file), actions, { only: 'Another behaviour' });
    expect(played).toEqual(['a toy']);
  });

  it('keeps both recorded blocks where two plays approve two scenarios of one file', async () => {
    const runner = runnerFor(file);
    await playScenarios(source(), runner, actions, { only: 'A toy behaviour', approve: true });
    await playScenarios(source(), runner, actions, { only: 'Another behaviour', approve: true });

    const written = runner.written.at(-1)?.text ?? '';
    expect(written).toContain('  - text: the line');
    expect(written).toContain('  - text: Not this one');
  });

  it('replaces what it saw where it is approving, and writes the file through the runner', async () => {
    const runner = runnerFor(file);
    await playScenarios(source('a/wanted.approved.md'), runner, actions, { approve: true });

    expect(runner.written).toEqual([{ path: 'a/wanted.approved.md', text: file }]);
  });
});
