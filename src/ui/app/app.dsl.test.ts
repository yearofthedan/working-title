import { describe, expect, it } from 'vite-plus/test';
import { recording, storyDrawn } from '../../test-helpers/recording';
import { appSeesOn, appSteps, appWriterOn } from './app.dsl';

describe('the app language', () => {
  it('goes to a piece first when adding a scene under it', async () => {
    const { calls, driver, opening, reads } = recording(storyDrawn);
    const add = appSteps(appWriterOn(driver, opening), appSeesOn(driver, reads))[
      'the writer adds a scene under {beat}'
    ]!;

    await add({ beat: 'Beat 4' });

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
      const opens = appSteps(appWriterOn(driver, opening), appSeesOn(driver, reads))[
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

    await appWriterOn(driver, opening).makesCurrent('The story');

    expect(calls).toEqual([
      'click button "The story" in navigation "Where you are"',
      'click heading "The story" in group "The story"',
    ]);
  });

  it('refuses a scene that is not under the beat named', async () => {
    const { driver, opening, reads } = recording(storyDrawn);
    const type = appSteps(appWriterOn(driver, opening), appSeesOn(driver, reads))[
      'types "{text}" as {scene}\'s list line under {beat}'
    ]!;

    await expect(
      Promise.resolve(type({ text: 'Maren rows out', scene: 'Scene 1', beat: 'Beat 2' })),
    ).rejects.toThrow('Scene 1 is not under Beat 2');
  });
});
