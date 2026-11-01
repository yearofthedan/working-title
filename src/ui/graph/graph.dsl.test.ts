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

const shapeOf = (project: SeededProject): readonly string[] =>
  project.pieces.map((piece) => {
    const parent = project.pieces.findIndex((other) => other.id === piece.parent);
    return `${piece.kind} ${piece.order} ${piece.parent === null ? 'root' : parent}`;
  });

const twoBeats = ['story 0 root', 'beat 0 0', 'beat 1 0'];
const aBeatWithTwoScenes = [...twoBeats, 'scene 0 2', 'scene 1 2'];

describe('a seeded Given', () => {
  const played = async (
    phrase: string,
    vars: Record<string, string> = {},
  ): Promise<{ calls: readonly string[]; worlds: readonly (readonly string[])[] }> => {
    const { calls, driver, opening, reads, startFrom, started } = recording(storyDrawn);
    const step = graphSteps(writerOn(driver, opening, startFrom), seesOn(driver, reads))[phrase]!;

    await step(vars);

    return { calls, worlds: started.map(shapeOf) };
  };

  it('starts from the beats the words name, with the scenes under the beat they name', async () => {
    for (const beat of ['beat two', 'beat 2']) {
      expect(await played('a project with two scenes under {beat}', { beat })).toEqual({
        calls: [],
        worlds: [aBeatWithTwoScenes],
      });
    }
  });

  it('refuses a beat a project has none of', async () => {
    await expect(
      played('a project with two scenes under {beat}', { beat: 'beat nine' }),
    ).rejects.toThrow('a project has no beat nine');
  });

  it('starts from two beats and makes the first current', async () => {
    expect(await played('two beats, the first current with tab focus')).toEqual({
      calls: ['click heading "Beat 1" in group "Beat 1"'],
      worlds: [twoBeats],
    });
  });

  it('starts from a beat with two scenes and makes the beat current', async () => {
    const clicks = ['click heading "Beat 2" in group "Beat 2"'];
    for (const phrase of [
      'a current beat with two scenes',
      'a beat with two scenes, the beat current',
    ]) {
      expect(await played(phrase)).toEqual({ calls: clicks, worlds: [aBeatWithTwoScenes] });
    }
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
