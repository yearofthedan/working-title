import { expect } from 'vite-plus/test';
import { type Driver, type Opening } from '../../test-helpers/driver';
import { appReadsOnThePage } from '../../test-helpers/graph-page';
import {
  aProjectWithScenesUnderBeatFour,
  inMemory,
  type SeededProject,
} from '../../test-helpers/seed';
import {
  aFolderHoldingProjects,
  anEmptyFolderNamed,
  theFolderAt,
  theProjectsFolderName,
} from '../../test-helpers/folders';
import { thePage } from '../../test-helpers/staging';
import { openTheApp, reopenTheApp, type Staging } from '../../test-helpers/the-app';
import { vitestBrowserDriver } from '../../test-helpers/vitest-browser.driver';
import { type NewVersion } from './app.dom';
import {
  appSeesOn,
  appSteps,
  appWriterOn,
  type AppSees,
  type AppWriter,
  type Staged,
} from './app.dsl';
import { yourProjects } from '../your-projects/your-projects.test-page';
import { theHeader } from './app.test-page';

let theFolderThePickerGives: readonly string[] = [theProjectsFolderName];

const thePicker = () => ({
  showDirectoryPicker: (): Promise<FileSystemDirectoryHandle> =>
    theFolderAt(theFolderThePickerGives),
});

const stageTheApp = async (width: number, on: Staging): Promise<void> => {
  theFolderThePickerGives = [theProjectsFolderName];
  await anEmptyFolderNamed(theProjectsFolderName);
  await thePage(width);
  await openTheApp(document, { ...on, picker: thePicker() });
};

const reachingYourProjects = async (driver: Driver): Promise<void> => {
  await driver.click('button', 'Choose a folder…');
  await expect
    .element(yourProjects().list(theProjectsFolderName).startAProject)
    .toBeInTheDocument();
};

const reachingTheProject = async (driver: Driver): Promise<void> => {
  await reachingYourProjects(driver);
  await driver.click('button', 'Start a project');
  await driver.press('Enter');
  await expect.element(theHeader().path).toBeInTheDocument();
};

const theAppInAFolder = async (driver: Driver, titles: readonly string[] = []): Promise<void> => {
  await stageTheApp(1440, { store: inMemory() });
  if (titles.length > 0) await aFolderHoldingProjects(theProjectsFolderName, titles);
  await reachingYourProjects(driver);
};

const settlingOnTheProject = (writer: AppWriter): AppWriter => ({
  ...writer,
  startsAProjectTitled: async (title) => {
    await writer.startsAProjectTitled(title);
    await expect.element(theHeader().path).toBeInTheDocument();
  },
  startsAProjectWithNoTitle: async () => {
    await writer.startsAProjectWithNoTitle();
    await expect.element(theHeader().path).toBeInTheDocument();
  },
});

const stagedTheWritersMachine = (driver: Driver, writer: AppWriter): Staged => ({
  hasNotChosenWhereToKeepProjects: () => stageTheApp(1440, { store: inMemory() }),
  anEmptyFolderNamed: async (name) => {
    await anEmptyFolderNamed(name);
  },
  keepsProjectsInAFolderHolding: (titles) => theAppInAFolder(driver, titles),
  choosesTheFolderNamed: async (name) => {
    theFolderThePickerGives = [name];
    await writer.choosesAFolder();
    await expect.element(theHeader().heading).toHaveTextContent('Your projects');
  },
  choosesTheProjectFolder: async (title) => {
    theFolderThePickerGives = [theProjectsFolderName, title];
    await aFolderHoldingProjects(theProjectsFolderName, [title]);
    await writer.choosesAFolder();
    await expect
      .element(yourProjects().question.refusal)
      .toHaveTextContent(
        `“${title}” is a project's own folder, so it can't hold other projects. Choose the folder it sits in instead.`,
      );
  },
});

export const appScenarioSteps = (driver: Driver) => {
  const writer = appWriterOn(
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
  );
  const settling = settlingOnTheProject(writer);
  return appSteps(
    settling,
    appSeesOn(driver, appReadsOnThePage()),
    stagedTheWritersMachine(driver, settling),
  );
};

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

export const theAppWaitingForANewVersion = (
  newVersion: NewVersion,
  store = inMemory(),
): Promise<void> => theAppWithoutAProject({ newVersion, store }).stage.fresh();

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
