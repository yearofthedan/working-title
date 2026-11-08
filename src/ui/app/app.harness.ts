import { type Driver, type Opening } from '../../test-helpers/driver';
import { appReadsOnThePage } from '../../test-helpers/graph-page';
import {
  aProjectWithScenesUnderBeatFour,
  inMemory,
  type SeededProject,
} from '../../test-helpers/seed';
import { thePage } from '../../test-helpers/staging';
import { openTheApp, reopenTheApp } from '../../test-helpers/the-app';
import { vitestBrowserDriver } from '../../test-helpers/vitest-browser.driver';
import { appSeesOn, appSteps, appWriterOn } from './app.dsl';

export const addASceneUnder = async (driver: Driver, beat: string): Promise<void> => {
  await driver.click('heading', beat, { role: 'group', name: beat });
  await driver.click('button', 'Add a scene', { role: 'group', name: beat });
};

const stageTheApp = async (): Promise<void> => {
  await thePage(1440);
  await openTheApp(document, inMemory());
};

const stageTheSeededApp = async (project: SeededProject): Promise<void> => {
  await thePage(1440);
  const store = inMemory();
  await store.save(project);
  await openTheApp(document, store);
};

export const appScenarioSteps = (driver: Driver) =>
  appSteps(
    appWriterOn(driver, { fresh: stageTheApp, reopen: reopenTheApp }, stageTheSeededApp),
    appSeesOn(driver, appReadsOnThePage()),
  );

export const pageWith = (scenes = 0, width = 1440, store = inMemory()) => {
  const driver = vitestBrowserDriver(undefined, 'page');
  const stage: Opening = {
    fresh: async () => {
      await thePage(width);
      if (scenes > 0) await store.save(aProjectWithScenesUnderBeatFour(scenes));
      await openTheApp(document, store);
    },
    reopen: async () => {
      await reopenTheApp();
    },
  };
  return {
    stage,
    writer: appWriterOn(driver, stage),
    sees: appSeesOn(driver, appReadsOnThePage()),
    store,
  };
};
