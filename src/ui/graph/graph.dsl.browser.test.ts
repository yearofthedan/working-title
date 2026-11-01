import { describe, expect, it } from 'vite-plus/test';
import { addASceneUnder, readsOnThePage } from '../../test-helpers/graph-page';
import type { Opening } from '../../test-helpers/driver';
import { thePage } from '../../test-helpers/staging';
import { openTheApp } from '../../test-helpers/the-app';
import { vitestBrowserDriver } from '../../test-helpers/vitest-browser.driver';
import { graphSteps, seesOn, writerOn } from './graph.dsl';

const typing = 'types "{text}" as {scene}\'s list line under {beat}';

const pageWithTwoScenesUnderBeat4 = () => {
  const driver = vitestBrowserDriver();
  const opening: Opening = {
    fresh: async () => {
      localStorage.clear();
      await thePage(1440);
      await openTheApp();
      for (let at = 0; at < 2; at += 1) await addASceneUnder(driver, 'Beat 4');
      await driver.click('heading', 'Beat 4', { role: 'group', name: 'Beat 4' });
    },
    reopen: async () => {
      await openTheApp();
    },
  };
  return { driver, opening, reads: readsOnThePage() };
};

describe('the graph page actions', () => {
  it('refuses a scene that is not under the beat named', async () => {
    const { driver, opening, reads } = pageWithTwoScenesUnderBeat4();
    await opening.fresh();
    const type = graphSteps(writerOn(driver, opening), seesOn(driver, reads))[typing]!;

    await expect(
      Promise.resolve(type({ text: 'Maren rows out', scene: 'Scene 1', beat: 'Beat 2' })),
    ).rejects.toThrow('Scene 1 is not under Beat 2');
  });
});
