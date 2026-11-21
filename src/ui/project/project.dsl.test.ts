import { describe, expect, it } from 'vite-plus/test';
import { recording, storyDrawn } from '../../test-helpers/recording';
import { projectSeesOn, projectSteps, projectWriterOn } from './project.dsl';

describe('the app language', () => {
  it('goes to a piece first when adding a scene under it', async () => {
    const { calls, driver, opening, reads } = recording(storyDrawn);
    const add = projectSteps(projectWriterOn(driver, opening), projectSeesOn(driver, reads))[
      'the writer adds a {child} under {piece}'
    ]!;

    await add({ child: 'scene', piece: 'Beat 4' });

    expect(calls).toEqual([
      'click heading "Beat 4" in group "Beat 4"',
      'click button "Add a scene" in group "Beat 4"',
    ]);
  });

  it('reads a scene under a beat as the scene named for its place', async () => {
    for (const [words, name] of [
      ['scene 1 under beat 2', 'Scene 1'],
      ['scene 2 under beat 2', 'Scene 2'],
    ] as const) {
      const { calls, driver, opening, reads } = recording(storyDrawn);
      const opens = projectSteps(projectWriterOn(driver, opening), projectSeesOn(driver, reads))[
        'opens {piece} beside the graph'
      ]!;

      await opens({ piece: words });

      expect(calls).toEqual([
        'click button "The story" in navigation "Where you are"',
        `click heading "${name}" in group "${name}"`,
        `click button "Open beside" in group "${name}"`,
      ]);
    }
  });

  it('presses the path to a piece that is off the graph', async () => {
    const { calls, driver, opening } = recording(['- main:']);

    await projectWriterOn(driver, opening).makesCurrent('The story');

    expect(calls).toEqual([
      'click button "The story" in navigation "Where you are"',
      'click heading "The story" in group "The story"',
    ]);
  });

  it('refuses a scene that is not under the beat named', async () => {
    const { driver, opening, reads } = recording(storyDrawn);
    const type = projectSteps(projectWriterOn(driver, opening), projectSeesOn(driver, reads))[
      'types "{text}" as {scene}\'s list line under {beat}'
    ]!;

    await expect(
      Promise.resolve(type({ text: 'Maren rows out', scene: 'Scene 1', beat: 'Beat 2' })),
    ).rejects.toThrow('Scene 1 is not under Beat 2');
  });
});
