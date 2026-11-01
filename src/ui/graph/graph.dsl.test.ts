import { describe, expect, it } from 'vite-plus/test';
import type { Driver, Opening, Reads } from '../../test-helpers/driver';
import type { SeededProject } from '../../test-helpers/seed';
import { graphSteps, seesOn, writerOn } from './graph.dsl';

const storyDrawn = [
  '- main:',
  '  - group "The story":',
  '    - heading "The story" [level=2]',
  '  - group "Beat 4":',
  '    - heading "Beat 4" [level=3]',
];

const recording = (tree: readonly string[]) => {
  const calls: string[] = [];
  const started: SeededProject[] = [];
  const driver: Driver = {
    press: async (key) => {
      calls.push(`press ${key}`);
    },
    click: async (role, name, within) => {
      const root = within === undefined ? '' : ` in ${within.role} "${within.name}"`;
      calls.push(`click ${role} "${name}"${root}`);
    },
    focus: async (role, name, within) => {
      const root = within === undefined ? '' : ` in ${within.role} "${within.name}"`;
      calls.push(`focus ${role} "${name}"${root}`);
    },
    type: async (_text, label, within) => {
      calls.push(`type ${label} in "${within.name}"`);
    },
    clickAway: async () => {
      calls.push('clickAway');
    },
    value: async (label, within) => {
      calls.push(`value ${label} in "${within.name}"`);
      return '';
    },
    focusIs: async (role, name, within) => {
      const root = within === undefined ? '' : ` in ${within.role} "${within.name}"`;
      calls.push(`focusIs ${role} "${name}"${root}`);
      return false;
    },
    tree: async () => tree,
  };
  const opening: Opening = {
    fresh: async () => {
      calls.push('fresh');
    },
    reopen: async () => {
      calls.push('reopen');
    },
  };
  const reads: Reads = { drawn: async () => [], path: async () => '' };
  const startFrom = async (project: SeededProject): Promise<void> => {
    started.push(project);
  };
  return { calls, driver, opening, reads, startFrom, started };
};

describe('the graph language', () => {
  it('clicks a piece where it is, without going to it through the path', async () => {
    const { calls, driver, opening, reads } = recording(storyDrawn);
    const click = graphSteps(writerOn(driver, opening), seesOn(driver, reads))[
      'the writer clicks {piece}'
    ]!;

    await click({ piece: 'Scene 1' });

    expect(calls).toEqual(['click heading "Scene 1" in group "Scene 1"']);
  });

  it('goes to a piece first when adding a scene under it', async () => {
    const { calls, driver, opening, reads } = recording(storyDrawn);
    const add = graphSteps(writerOn(driver, opening), seesOn(driver, reads))[
      'the writer adds a scene under {beat}'
    ]!;

    await add({ beat: 'Beat 4' });

    expect(calls).toEqual([
      'click heading "Beat 4" in group "Beat 4"',
      'click button "Add a scene" in group "Beat 4"',
    ]);
  });

  it('presses the path to a piece that is off the graph', async () => {
    const { calls, driver, opening } = recording(['- main:']);

    await writerOn(driver, opening).makesCurrent('The story');

    expect(calls).toEqual([
      'click button "The story" in navigation "Where you are"',
      'click heading "The story" in group "The story"',
    ]);
  });
});

describe('a seeded Given', () => {
  it('starts from a project of the beats the words name, with the scenes under the beat they name', async () => {
    const { driver, opening, reads, startFrom, started } = recording(storyDrawn);
    const step = graphSteps(writerOn(driver, opening, startFrom), seesOn(driver, reads))[
      'a project with two scenes under {beat}'
    ]!;

    await step({ beat: 'beat two' });

    expect(started).toEqual([
      {
        method: 'snowflake-extended',
        version: 2,
        pieces: [
          { id: 'id-1', kind: 'story', parent: null, order: 0, facets: {} },
          { id: 'id-2', kind: 'beat', parent: 'id-1', order: 0, facets: {} },
          { id: 'id-3', kind: 'beat', parent: 'id-1', order: 1, facets: {} },
          { id: 'id-7', kind: 'scene', parent: 'id-3', order: 0, facets: {} },
          { id: 'id-8', kind: 'scene', parent: 'id-3', order: 1, facets: {} },
        ],
      },
    ]);
  });

  it('refuses when the writer was given no way to start from a seeded project', async () => {
    const { driver, opening, reads } = recording(storyDrawn);
    const step = graphSteps(writerOn(driver, opening), seesOn(driver, reads))[
      'two beats, the first current with tab focus'
    ]!;

    await expect(step({})).rejects.toThrow(
      'Only the page tier starts a scenario from a seeded world',
    );
  });
});
