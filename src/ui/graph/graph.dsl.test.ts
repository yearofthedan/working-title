import { describe, expect, it } from 'vite-plus/test';
import type { Driver } from '../../test-helpers/driver';
import { graphSteps, seesOn, writerOn } from './graph.dsl';

const storyInFocus = [
  '- main:',
  '  - group "The story":',
  '    - heading "The story" [level=2]',
  '  - group "Beat 4":',
  '    - heading "Beat 4" [level=3]',
];

const recording = (tree: readonly string[]) => {
  const calls: string[] = [];
  const driver: Driver = {
    fresh: async () => {
      calls.push('fresh');
    },
    reopen: async () => {
      calls.push('reopen');
    },
    press: async (key) => {
      calls.push(`press ${key}`);
    },
    click: async (role, name, within) => {
      const root = within === undefined ? '' : ` in ${within.role} "${within.name}"`;
      calls.push(`click ${role} "${name}"${root}`);
    },
    type: async (_text, label, within) => {
      calls.push(`type ${label} in "${within.name}"`);
    },
    drawn: async () => [],
    tree: async () => tree,
  };
  return { calls, driver };
};

describe('the graph language', () => {
  it('clicks a piece where it is, without going to it through the path', async () => {
    const { calls, driver } = recording(storyInFocus);
    const click = graphSteps(writerOn(driver), seesOn(driver))['the writer clicks {piece}']!;

    await click({ piece: 'Scene 1' });

    expect(calls).toEqual(['click heading "Scene 1" in group "Scene 1"']);
  });

  it('goes to a piece first when adding a scene under it', async () => {
    const { calls, driver } = recording(storyInFocus);
    const add = graphSteps(writerOn(driver), seesOn(driver))[
      'the writer adds a scene under {beat}'
    ]!;

    await add({ beat: 'Beat 4' });

    expect(calls).toEqual([
      'click heading "Beat 4" in group "Beat 4"',
      'click button "Add a scene" in group "Beat 4"',
    ]);
  });

  it('presses the path to a piece that is off the graph', async () => {
    const { calls, driver } = recording(['- main:']);

    await writerOn(driver).focuses('The story');

    expect(calls).toEqual([
      'click button "The story" in navigation "Where you are"',
      'click heading "The story" in group "The story"',
    ]);
  });
});
