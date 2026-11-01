import { describe, expect, it } from 'vite-plus/test';
import type { Driver, Opening, Reads } from '../../test-helpers/driver';
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
  return { calls, driver, opening, reads };
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
