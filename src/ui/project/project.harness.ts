import { expect } from 'vite-plus/test';
import { type Driver, type Opening } from '../../test-helpers/driver';
import { appReadsOnThePage } from './test-helpers/staging';
import { inMemory, type SeededProject } from '../../test-helpers/seed';
import {
  aPickerGivingWhatIsStaged,
  anEmptyFolderNamed,
  theProjectsFolderName,
} from '../../test-helpers/folders';
import { thePage } from '../../test-helpers/staging/staging';
import { openTheApp, reopenTheApp, type Staging } from '../../test-helpers/staging/the-app';
import { vitestBrowserDriver } from '../test-helpers/vitest-browser.driver';
import { type NewVersion } from '../header/header.dom';
import {
  projectSeesOn,
  projectSteps,
  projectWriterOn,
  type ProjectSees,
  type ProjectWriter,
  type Staged,
} from './project.dsl';
import { yourProjects } from '../your-projects/your-projects.test-page';
import { theHeader } from './project.test-page';
import { aFolderHoldingProjects } from '../test-helpers/folders';

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

const settlingOnTheProject = (writer: ProjectWriter): ProjectWriter => ({
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
  writer: ProjectWriter,
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

export const projectScenarioHarness = (driver: Driver) => {
  const path: string[] = [theProjectsFolderName];
  const where = (): readonly string[] => path;
  const at = (...segments: readonly string[]): void => {
    path.splice(0, path.length, ...segments);
  };
  const stage = (width: number, on: Staging): Promise<void> => stagingTheAppAt(where, width, on);
  const reopen = (): Promise<void> => reopenTheApp(aPickerGivingWhatIsStaged(where));
  const writer = projectWriterOn(
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
    sees: projectSeesOn(driver, appReadsOnThePage()),
    staged: stagedTheWritersMachine(driver, settling, { at, stage }),
  };
};

export const projectScenarioSteps = (driver: Driver) => {
  const { writer, sees, staged } = projectScenarioHarness(driver);
  return projectSteps(writer, sees, staged);
};

export const theAppWithoutAProject = (
  on: Staging = {},
): { stage: Opening; writer: ProjectWriter; sees: ProjectSees } => {
  const driver = vitestBrowserDriver(undefined, 'page');
  const stage: Opening = {
    fresh: () => stagingTheAppAt(theFolderThePickerGives, 1440, { store: inMemory(), ...on }),
    reopen: () => reopenTheApp(aPickerGivingWhatIsStaged(theFolderThePickerGives)),
  };
  return {
    stage,
    writer: projectWriterOn(driver, stage),
    sees: projectSeesOn(driver, appReadsOnThePage()),
  };
};

export const theAppWaitingForANewVersion = (
  newVersion: NewVersion,
  store = inMemory(),
): Promise<void> => theAppWithoutAProject({ newVersion, store }).stage.fresh();

export const pageWith = (project: SeededProject, width = 1440, store = inMemory()) => {
  const driver = vitestBrowserDriver(undefined, 'page');
  const stage: Opening = {
    fresh: async () => {
      if ((await store.load()) === undefined) {
        await store.save(project);
      }
      await stagingTheAppAt(theFolderThePickerGives, width, { store });
    },
    reopen: () => reopenTheApp(aPickerGivingWhatIsStaged(theFolderThePickerGives)),
  };
  return {
    stage,
    writer: projectWriterOn(driver, stage),
    sees: projectSeesOn(driver, appReadsOnThePage()),
    store,
  };
};
