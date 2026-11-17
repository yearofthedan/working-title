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
  aPickerGivingWhatIsStaged,
  anEmptyFolderNamed,
  theProjectsFolderName,
} from '../../test-helpers/folders';
import { thePage } from '../../test-helpers/staging';
import { openTheApp, reopenTheApp, type Staging } from '../../test-helpers/the-app';
import { vitestBrowserDriver } from '../../test-helpers/vitest-browser.driver';
import { type NewVersion } from '../../shell';
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

const stagingTheAppAt = async (
  where: () => readonly string[],
  width: number,
  on: Staging,
): Promise<void> => {
  await anEmptyFolderNamed(theProjectsFolderName);
  await thePage(width);
  await openTheApp(document, on, aPickerGivingWhatIsStaged(where));
};

const theFolderThePickerGives = (): readonly string[] => [theProjectsFolderName];

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

const stagedTheWritersMachine = (
  driver: Driver,
  writer: AppWriter,
  stages: {
    readonly at: (...segments: readonly string[]) => void;
    readonly stage: (width: number, on: Staging) => Promise<void>;
  },
): Staged => {
  const stage = async (on: Staging): Promise<void> => {
    stages.at(theProjectsFolderName);
    await stages.stage(1440, on);
  };

  return {
    hasNotChosenWhereToKeepProjects: () => stage({ store: inMemory() }),
    anEmptyFolderNamed: async (name) => {
      await anEmptyFolderNamed(name);
    },
    keepsProjectsInAFolderHolding: async (titles) => {
      await stage({ store: inMemory() });
      await aFolderHoldingProjects(theProjectsFolderName, titles);
      await reachingYourProjects(driver);
    },
    choosesTheFolderNamed: async (name) => {
      stages.at(name);
      await writer.choosesAFolder();
      await expect.element(theHeader().heading).toHaveTextContent('Your projects');
    },
    choosesTheProjectFolder: async (title) => {
      stages.at(theProjectsFolderName, title);
      await aFolderHoldingProjects(theProjectsFolderName, [title]);
      await writer.choosesAFolder();
      await expect
        .element(yourProjects().question.refusal)
        .toHaveTextContent(
          `“${title}” is a project's own folder, so it can't hold other projects. Choose the folder it sits in instead.`,
        );
    },
  };
};

export const appScenarioHarness = (driver: Driver) => {
  const path: string[] = [theProjectsFolderName];
  const where = (): readonly string[] => path;
  const at = (...segments: readonly string[]): void => {
    path.splice(0, path.length, ...segments);
  };
  const stage = (width: number, on: Staging): Promise<void> => stagingTheAppAt(where, width, on);
  const reopen = (): Promise<void> => reopenTheApp(aPickerGivingWhatIsStaged(where));
  const writer = appWriterOn(
    driver,
    {
      fresh: async () => {
        await stage(1440, { store: inMemory() });
        await reachingTheProject(driver);
      },
      reopen,
    },
    async (project: SeededProject) => {
      const store = inMemory();
      await store.save(project);
      await stage(1440, { store });
    },
  );
  const settling = settlingOnTheProject(writer);
  return {
    at,
    stage,
    reopen,
    writer: settling,
    sees: appSeesOn(driver, appReadsOnThePage()),
    staged: stagedTheWritersMachine(driver, settling, { at, stage }),
  };
};

export const appScenarioSteps = (driver: Driver) => {
  const { writer, sees, staged } = appScenarioHarness(driver);
  return appSteps(writer, sees, staged);
};

export const theAppWithoutAProject = (
  on: Staging = {},
): { stage: Opening; writer: AppWriter; sees: AppSees } => {
  const driver = vitestBrowserDriver(undefined, 'page');
  const stage: Opening = {
    fresh: () => stagingTheAppAt(theFolderThePickerGives, 1440, { store: inMemory(), ...on }),
    reopen: () => reopenTheApp(aPickerGivingWhatIsStaged(theFolderThePickerGives)),
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
      await stagingTheAppAt(theFolderThePickerGives, width, { store });
    },
    reopen: () => reopenTheApp(aPickerGivingWhatIsStaged(theFolderThePickerGives)),
  };
  return {
    stage,
    writer: appWriterOn(driver, stage),
    sees: appSeesOn(driver, appReadsOnThePage()),
    store,
  };
};
