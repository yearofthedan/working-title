import { describe, expect, it } from 'vite-plus/test';
import { playScenarios, type Runner, type ScenarioSource } from './play';
import { pageMeta, reporting, reportingFocus, type StepAction } from './steps';

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

const runnerFor = (
  text: string,
  trees: readonly (readonly string[])[],
  titles: readonly string[] = [],
) => {
  let at = 0;
  let page = 0;
  let held = text;
  const written: { path: string; text: string }[] = [];
  const marked: boolean[] = [];
  const runner: Runner & { written: typeof written; marked: typeof marked } = {
    tree: async (markFocus) => {
      marked.push(markFocus);
      return trees[at++] ?? [];
    },
    pageMeta: async () => titles[page++] ?? '',
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
  },
  'the writer types {text}': ({ text }) => {
    played.push(`types ${text}`);
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
    await playScenarios(
      source(),
      runnerFor(file, [['- group "A toy":', '  - text: A toy'], ['- main:']]),
      actions,
    );
    expect(played).toEqual(['a toy', 'types "the line"', 'reloads', 'a toy']);
  });

  it('passes when every scenario sees what the file records', async () => {
    await playScenarios(
      source(),
      runnerFor(file, [['- group "A toy":', '  - text: A toy'], ['- main:']]),
      actions,
    );
  });

  it('reads the tree right after each assertion, and prints its block under it', async () => {
    const two = aScenario('Given a toy', 'Then a named toy', 'And another toy');
    const runner = runnerFor(two, [
      ['- group "A toy":', '  - text: Before the next step'],
      ['- group "A toy":', '  - text: After the next step'],
    ]);

    await playScenarios({ path: 'a/toy.approved.md', text: two }, runner, actions, {
      approve: true,
    });

    expect(runner.marked).toEqual([false, false]);
    expect(runner.written.at(-1)?.text).toBe(
      aScenario(
        'Given a toy',
        'Then a named toy',
        '- group "A toy":',
        '  - text: Before the next step',
        'And another toy',
        '- group "A toy":',
        '  - text: After the next step',
      ),
    );
  });

  it('asks for the marked tree only for the step that checks focus', async () => {
    const two = aScenario(
      'Given a toy',
      'Then a named toy',
      '- group "A toy":',
      'And the focus is on it',
      '- group "A toy" [active]:',
    );
    const runner = runnerFor(two, [['- group "A toy":'], ['- group "A toy" [active]:']]);

    await playScenarios({ path: 'a/toy.approved.md', text: two }, runner, {
      ...actions,
      'the focus is on it': () => reportingFocus({ role: 'group', name: 'A toy' }),
    });

    expect(runner.marked).toEqual([false, true]);
  });

  it('narrows a block to the parts that step reported', async () => {
    const named = aScenario('Given a toy', 'Then a named toy', '- group "A toy":');
    const runner = runnerFor(named, [['- main:', '  - group "A toy":', '    - text: A toy']]);

    await playScenarios({ path: 'a/toy.approved.md', text: named }, runner, actions, {
      approve: true,
    });

    expect(runner.written.at(-1)?.text).toBe(
      aScenario('Given a toy', 'Then a named toy', '- group "A toy":', '  - text: A toy'),
    );
  });

  it('takes "the writer sees" as an assertion reporting the whole tree', async () => {
    const sees = aScenario('Given a toy', 'Then the writer sees', '- main:');
    const runner = runnerFor(sees, [['- main:', '  - group "A toy":']]);

    await playScenarios({ path: 'a/toy.approved.md', text: sees }, runner, actions, {
      approve: true,
    });

    expect(runner.written.at(-1)?.text).toBe(
      aScenario('Given a toy', 'Then the writer sees', '- main:', '  - group "A toy":'),
    );
  });

  it('takes "And the writer sees" under a Then as the whole tree too', async () => {
    const sees = aScenario('Given a toy', 'Then a named toy', 'And the writer sees');
    const runner = runnerFor(sees, [['- group "A toy":'], ['- main:']]);

    await playScenarios({ path: 'a/toy.approved.md', text: sees }, runner, actions, {
      approve: true,
    });

    expect(runner.written.at(-1)?.text).toBe(
      aScenario(
        'Given a toy',
        'Then a named toy',
        '- group "A toy":',
        'And the writer sees',
        '- main:',
      ),
    );
  });

  it('refuses a difference, showing it as lines and naming the file', async () => {
    const message = await playScenarios(
      source(),
      runnerFor(file, [['- group "A toy":', '  - text: Something else'], ['- main:']]),
      actions,
    ).catch((error: Error) => error.message);

    expect(message).toBe(
      [
        'a/toy.approved.md: A toy behaviour does not see what is recorded:',
        ' - group "A toy":',
        '-  - text: A toy',
        '+  - text: Something else',
        '',
        'Approve it with ./do approve a/toy.approved.md if the change is the one you meant.',
      ].join('\n'),
    );
  });

  it('refuses a Then that reports nothing', async () => {
    const named = aScenario('Given a toy', 'Then a toy');

    await expect(
      playScenarios(
        { path: 'a/toy.approved.md', text: named },
        runnerFor(named, [['- main:']]),
        actions,
      ),
    ).rejects.toThrow(
      'A toy behaviour: "Then a toy" is a Then and reports nothing, and a Then reports the evidence it asserted on',
    );
  });

  it('refuses a step under a Given or a When that reports evidence', async () => {
    const given = aScenario('Given a named toy', 'Then a named toy');

    await expect(
      playScenarios(
        { path: 'a/toy.approved.md', text: given },
        runnerFor(given, [['- group "A toy":'], ['- group "A toy":']]),
        actions,
      ),
    ).rejects.toThrow(
      'A toy behaviour: "Given a named toy" is a Given and reports evidence, and only a Then reports the evidence it asserted on',
    );
  });

  it('refuses an And under a When that reports evidence', async () => {
    const when = aScenario('Given a toy', 'When a named toy', 'Then a named toy');

    await expect(
      playScenarios(
        { path: 'a/toy.approved.md', text: when },
        runnerFor(when, [['- group "A toy":']]),
        actions,
      ),
    ).rejects.toThrow('"When a named toy" is a When and reports evidence');
  });

  it('refuses an And under a Then that reports nothing', async () => {
    const nothing = aScenario('Given a toy', 'Then a named toy', 'And a toy');

    await expect(
      playScenarios(
        { path: 'a/toy.approved.md', text: nothing },
        runnerFor(nothing, [['- group "A toy":']]),
        actions,
      ),
    ).rejects.toThrow('"And a toy" is a Then and reports nothing');
  });

  it('prints the page title a step reported where the file records it', async () => {
    const meta = aScenario(
      'Given a toy',
      'Then the app opens on the new version',
      '- page title: working-title (new version)',
    );
    const runner = runnerFor(meta, [], ['working-title (new version)']);

    await playScenarios({ path: 'a/toy.approved.md', text: meta }, runner, {
      ...actions,
      'the app opens on the new version': () => pageMeta(),
    });
  });

  it('refuses page meta where the runner reads none', async () => {
    const meta = aScenario(
      'Given a toy',
      'Then the app opens on the new version',
      '- page title: working-title (new version)',
    );
    const runner = runnerFor(meta, []);
    delete runner.pageMeta;

    await expect(
      playScenarios({ path: 'a/toy.approved.md', text: meta }, runner, {
        ...actions,
        'the app opens on the new version': () => pageMeta(),
      }),
    ).rejects.toThrow('reads no page meta');
  });

  it('plays the one scenario it is asked for, and only that one', async () => {
    played.length = 0;
    await playScenarios(source(), runnerFor(file, [['- main:']]), actions, {
      only: 'Another behaviour',
    });
    expect(played).toEqual(['a toy']);
  });

  it('keeps both recorded blocks where two plays approve two scenarios of one file', async () => {
    const runner = runnerFor(file, [
      ['- group "A toy":', '  - text: As it is now'],
      ['- main:', '  - text: A toy again'],
    ]);
    await playScenarios(source(), runner, actions, { only: 'A toy behaviour', approve: true });
    await playScenarios(source(), runner, actions, { only: 'Another behaviour', approve: true });

    const written = runner.written.at(-1)?.text ?? '';
    expect(written).toContain('  - text: As it is now');
    expect(written).toContain('  - text: A toy again');
  });

  it('replaces what it saw where it is approving, and writes the file through the runner', async () => {
    const runner = runnerFor(file, [['- group "A toy":', '  - text: A toy'], ['- main:']]);
    await playScenarios(source('a/wanted.approved.md'), runner, actions, { approve: true });

    expect(runner.written).toEqual([{ path: 'a/wanted.approved.md', text: file }]);
  });
});
