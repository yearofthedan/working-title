import * as browser from 'vite-plus/test/browser';
import { wholeNameAnyCase, type Driver, type Opening } from '../../test-helpers/driver';
import { appReadsIn, appReadsOnThePage } from '../../test-helpers/graph-page';
import { storesTheProject, type SeededProject } from '../../test-helpers/seed';
import { thePage } from '../../test-helpers/staging';
import { openTheApp, reopenTheApp } from '../../test-helpers/the-app';
import { vitestBrowserDriver } from '../../test-helpers/vitest-browser.driver';
import { appSeesOn, appSteps, appWriterOn, type AppSees, type AppWriter } from '../app/app.dsl';

export const graphScenarioSteps = (driver: Driver) =>
  appSteps(
    appWriterOn(driver, { fresh: stageTheGraph, reopen: reopenTheApp }, stageTheSeededGraph),
    appSeesOn(driver, appReadsOnThePage()),
  );

export const stageTheGraph = async (): Promise<void> => {
  localStorage.clear();
  await thePage(1440);
  await openTheApp();
};

export const stageTheSeededGraph = async (project: SeededProject): Promise<void> => {
  localStorage.clear();
  await thePage(1440);
  await storesTheProject(project);
  await openTheApp();
};

export const addASceneUnder = async (driver: Driver, beat: string): Promise<void> => {
  await driver.click('heading', beat, { role: 'group', name: beat });
  await driver.click('button', 'Add a scene', { role: 'group', name: beat });
};

export const pageWith = (
  scenes = 0,
  width = 1440,
): { driver: Driver; stage: Opening; writer: AppWriter; sees: AppSees } => {
  const driver = vitestBrowserDriver();
  const stage: Opening = {
    fresh: async () => {
      localStorage.clear();
      await thePage(width);
      await openTheApp();
      for (let at = 0; at < scenes; at += 1) await addASceneUnder(driver, 'Beat 4');
      if (scenes > 0) await openTheApp();
    },
    reopen: async () => {
      await reopenTheApp();
    },
  };
  return {
    driver,
    stage,
    writer: appWriterOn(driver, stage),
    sees: appSeesOn(driver, appReadsOnThePage()),
  };
};

export const graphOn = (
  name: string,
  opening: Opening,
): { driver: Driver; writer: AppWriter; sees: AppSees } => {
  const driver = vitestBrowserDriver(name);
  const main = browser.page.getByRole('main', { name: wholeNameAnyCase(name) });
  return {
    driver,
    writer: appWriterOn(driver, opening),
    sees: appSeesOn(
      driver,
      appReadsIn(() => main.element()),
    ),
  };
};
