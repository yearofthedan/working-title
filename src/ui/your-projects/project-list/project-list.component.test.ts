import { describe, expect, it } from 'vite-plus/test';
import { theProjectsFolderName } from '../../test-helpers/folders';
import { vitestBrowserDriver } from '../../test-helpers/vitest-browser.driver';
import { projectListWriterOn } from './project-list.dsl';
import { mountProjectList } from './project-list.harness';
import { theProjectList } from './project-list.test-page';

const driver = vitestBrowserDriver();
const writer = projectListWriterOn(driver);

describe('the projects in the folder', () => {
  it('lists no projects, and puts the start row in their place until the writer cancels', async () => {
    mountProjectList();
    const list = theProjectList(theProjectsFolderName);

    await expect.element(list.noProjectsYet).toBeVisible();

    await writer.startsAProject();

    await expect.element(list.row.said).toBeInTheDocument();
    await expect.element(list.noProjectsYet).not.toBeVisible();

    await writer.cancelsTheStart();

    await expect.element(list.startAProject).toHaveFocus();
    await expect.element(list.noProjectsYet).toBeVisible();
  });
});
