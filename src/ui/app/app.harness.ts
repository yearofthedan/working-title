import { type Driver, type Opening } from '../../test-helpers/driver';
import { appReadsOnThePage } from '../../test-helpers/graph-page';
import { inMemory, type SeededProject } from '../../test-helpers/seed';
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

export const anExtraHeaderAbove = (): { given: HTMLElement; extra: HTMLElement } => {
  const given = document.querySelector<HTMLElement>('header')!;
  const extra = document.createElement('header');
  extra.style.gridArea = 'extra';
  document.body.style.gridTemplateRows = 'auto auto minmax(0, 1fr)';
  document.body.style.gridTemplateAreas = "'extra panel' 'header panel' 'main panel'";
  document.body.prepend(extra);
  return { given, extra };
};

export const pageWith = (scenes = 0, width = 1440) => {
  const driver = vitestBrowserDriver();
  const store = inMemory();
  const stage: Opening = {
    fresh: async () => {
      await thePage(width);
      await openTheApp(document, store);
      for (let at = 0; at < scenes; at += 1) await addASceneUnder(driver, 'Beat 4');
      if (scenes > 0) await openTheApp(document, store);
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
    store,
  };
};
