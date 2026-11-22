import { describe, expect, it } from 'vite-plus/test';
import { anEmptyFolderNamed } from '../../test-helpers/folders';
import { vitestBrowserDriver } from '../test-helpers/vitest-browser.driver';
import { yourProjectsWriterOn } from './your-projects.dsl';
import { mountYourProjects } from './your-projects.harness';
import { yourProjects } from './your-projects.test-page';
import { theProjectsFolderName } from '../../test-helpers/folders';

const driver = vitestBrowserDriver();
const writer = yourProjectsWriterOn(driver);

describe('choosing where the projects are kept', () => {
  it('asks until the writer chooses a folder, then shows the list of projects in it', async () => {
    await anEmptyFolderNamed(theProjectsFolderName);
    mountYourProjects();

    await expect.element(yourProjects().question.chooseAFolder).toBeInTheDocument();
    await expect
      .element(yourProjects().list(theProjectsFolderName).noProjectsYet)
      .not.toBeInTheDocument();

    await writer.choosesAFolder();

    await expect
      .element(yourProjects().list(theProjectsFolderName).noProjectsYet)
      .toBeInTheDocument();
    await expect.element(yourProjects().question.chooseAFolder).not.toBeInTheDocument();
  });
});
