import { describe, expect, it } from 'vite-plus/test';
import { openTheApp } from '../../test-helpers/the-app';
import { vitestBrowserDriver } from '../../test-helpers/vitest-browser.driver';
import { graphSteps, seesOn, writerOn } from './graph.dsl';
import { thePage } from '../../test-helpers/staging';

const typing = 'types "{text}" as {scene}\'s list line under {beat}';

const pageWithTwoScenesUnderBeat4 = () => {
  const driver = vitestBrowserDriver(async () => {
    localStorage.clear();
    await thePage(1440);
    await openTheApp();
    const writer = writerOn(driver);
    for (let at = 0; at < 2; at += 1) {
      await writer.addsASceneUnder('Beat 4');
    }
    await writer.focuses('Beat 4');
  });
  return driver;
};

describe('the graph page actions', () => {
  it('refuses a scene that is not under the beat named', async () => {
    const driver = pageWithTwoScenesUnderBeat4();
    await driver.fresh();
    const type = graphSteps(writerOn(driver), seesOn(driver))[typing]!;

    await expect(
      Promise.resolve(type({ text: 'Maren rows out', scene: 'Scene 1', beat: 'Beat 2' })),
    ).rejects.toThrow('Scene 1 is not under Beat 2');
  });
});
