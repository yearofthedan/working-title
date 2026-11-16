import { describe, expect, it } from 'vite-plus/test';
import {
  aChooserGivingTheFolder,
  aChooserThatFails,
  aChooserTheWriterCancels,
  aChooserWithNoPicker,
  aFolderHoldingProjects,
  theProjectsFolderName,
} from '../../../test-helpers/folders';
import { vitestBrowserDriver } from '../../../test-helpers/vitest-browser.driver';
import { folderQuestionSeesOn, folderQuestionWriterOn } from './folder-question.dsl';
import { mountFolderQuestion } from './folder-question.harness';
import { whereTheProjectsAreKept } from './folder-question.test-page';

const driver = vitestBrowserDriver();
const writer = folderQuestionWriterOn(driver);
const sees = folderQuestionSeesOn(driver);

const theRefusal =
  "“The Ferryman” is a project's own folder, so it can't hold other projects. Choose the folder it sits in instead.";

describe('choosing where the projects are kept', () => {
  it('leaves the first screen as it was when the writer cancels the folder picker', async () => {
    mountFolderQuestion({ chooser: aChooserTheWriterCancels() });
    const before = await sees.tree();

    await writer.choosesAFolder();

    await expect.element(whereTheProjectsAreKept().chooseAFolder).toBeInTheDocument();
    await expect.element(whereTheProjectsAreKept().refusal).toBeEmptyDOMElement();
    expect(await sees.tree()).toEqual(before);
  });

  it("tells the writer when a folder won't open", async () => {
    mountFolderQuestion({ chooser: aChooserThatFails() });

    await writer.choosesAFolder();

    await expect
      .element(whereTheProjectsAreKept().refusal)
      .toHaveTextContent("working-title couldn't open that folder. Try another one.");
    await expect.element(whereTheProjectsAreKept().chooseAFolder).toBeInTheDocument();
  });

  it('tells the writer this browser has no folders to keep projects in', async () => {
    mountFolderQuestion({ chooser: aChooserWithNoPicker() });

    await writer.choosesAFolder();

    await expect
      .element(whereTheProjectsAreKept().refusal)
      .toHaveTextContent(
        "This browser can't keep your projects in a folder. Open working-title in Chrome or Edge on a computer.",
      );
  });

  it('refuses the folder of a project with an icon only the sighted writer sees', async () => {
    await aFolderHoldingProjects(theProjectsFolderName, ['The Ferryman']);
    mountFolderQuestion({
      chooser: aChooserGivingTheFolder(theProjectsFolderName, 'The Ferryman'),
    });

    await writer.choosesAFolder();

    await expect.element(whereTheProjectsAreKept().refusal).toHaveTextContent(theRefusal);
    await expect
      .element(whereTheProjectsAreKept().refusalIcon)
      .toHaveAttribute('aria-hidden', 'true');
  });
});
