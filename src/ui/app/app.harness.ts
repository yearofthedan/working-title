import { expect } from 'vite-plus/test';
import { type Driver, type Opening } from '../../test-helpers/driver';
import { appReadsOnThePage } from '../../test-helpers/graph-page';
import {
  aProjectWithScenesUnderBeatFour,
  inMemory,
  type SeededProject,
} from '../../test-helpers/seed';
import { aPickerGivingThePlace, thePage } from '../../test-helpers/staging';
import { openTheApp, reopenTheApp, type Staging } from '../../test-helpers/the-app';
import { vitestBrowserDriver } from '../../test-helpers/vitest-browser.driver';
import { type NewVersion } from './app.dom';
import { appSeesOn, appSteps, appWriterOn, type AppSees, type AppWriter } from './app.dsl';
import { theHeader } from './app.test-page';

const stageTheApp = async (width: number, on: Staging): Promise<void> => {
  await thePage(width);
  await openTheApp(document, { picker: aPickerGivingThePlace, ...on });
};

const reachingTheProject = async (driver: Driver): Promise<void> => {
  await driver.click('button', 'Choose a folder…');
  await driver.click('button', 'Start a project');
  await driver.press('Enter');
  await expect.element(theHeader().path).toBeInTheDocument();
};

export const appScenarioSteps = (driver: Driver) =>
  appSteps(
    appWriterOn(
      driver,
      {
        fresh: async () => {
          await stageTheApp(1440, { store: inMemory() });
          await reachingTheProject(driver);
        },
        reopen: reopenTheApp,
      },
      async (project: SeededProject) => {
        const store = inMemory();
        await store.save(project);
        await stageTheApp(1440, { store });
      },
    ),
    appSeesOn(driver, appReadsOnThePage()),
  );

export const theAppWithoutAProject = (
  on: Staging = {},
): { stage: Opening; writer: AppWriter; sees: AppSees } => {
  const driver = vitestBrowserDriver(undefined, 'page');
  const stage: Opening = {
    fresh: () => stageTheApp(1440, { store: inMemory(), ...on }),
    reopen: reopenTheApp,
  };
  return {
    stage,
    writer: appWriterOn(driver, stage),
    sees: appSeesOn(driver, appReadsOnThePage()),
  };
};

export const theAppWaitingForANewVersion = (newVersion: NewVersion): Promise<void> =>
  theAppWithoutAProject({ newVersion }).stage.fresh();

export const pageWith = (scenes = 0, width = 1440, store = inMemory()) => {
  const driver = vitestBrowserDriver(undefined, 'page');
  const stage: Opening = {
    fresh: async () => {
      if ((await store.load()) === undefined) {
        await store.save(aProjectWithScenesUnderBeatFour(scenes));
      }
      await stageTheApp(width, { store });
    },
    reopen: reopenTheApp,
  };
  return {
    stage,
    writer: appWriterOn(driver, stage),
    sees: appSeesOn(driver, appReadsOnThePage()),
    store,
  };
};
