import { describe, expect, it } from 'vite-plus/test';
import type { ProjectsFolder } from '../../application/project';
import {
  aChooserGivingTheFolder,
  aChooserThatFails,
  aChooserTheWriterCancels,
  aFolderHoldingProjects,
  anEmptyFolderNamed,
  theEntriesIn,
  thePickerGivesTheFolderAt,
  theProjectsFolder,
  theProjectsFolderName,
} from '../../test-helpers/folders';
import { vitestBrowserDriver } from '../../test-helpers/vitest-browser.driver';
import { yourProjectsSeesOn, yourProjectsWriterOn } from './your-projects.dsl';
import { mountYourProjects } from './your-projects.harness';
import { whereTheProjectsAreKept, yourProjects } from './your-projects.test-page';

const driver = vitestBrowserDriver();
const writer = yourProjectsWriterOn(driver);
const sees = yourProjectsSeesOn(driver);

const theRefusal =
  "“The Ferryman” is a project's own folder, so it can't hold other projects. Choose the folder it sits in instead.";

const reachingYourProjects = async (): Promise<void> => {
  await anEmptyFolderNamed(theProjectsFolderName);
  thePickerGivesTheFolderAt(theProjectsFolderName);
  mountYourProjects();
  await writer.choosesAFolder();
};

describe('choosing where the projects are kept', () => {
  it('leaves the first screen as it was when the writer cancels the folder picker', async () => {
    mountYourProjects({ chooser: aChooserTheWriterCancels() });
    const before = await sees.tree();

    await writer.choosesAFolder();

    await expect.element(whereTheProjectsAreKept().chooseAFolder).toBeInTheDocument();
    await expect.element(whereTheProjectsAreKept().refusal).toBeEmptyDOMElement();
    expect(await sees.tree()).toEqual(before);
  });

  it("tells the writer when a folder won't open", async () => {
    mountYourProjects({ chooser: aChooserThatFails() });

    await writer.choosesAFolder();

    await expect
      .element(whereTheProjectsAreKept().refusal)
      .toHaveTextContent("working-title couldn't open that folder. Try another one.");
    await expect.element(whereTheProjectsAreKept().chooseAFolder).toBeInTheDocument();
  });

  it('refuses the folder of a project with an icon only the sighted writer sees', async () => {
    await aFolderHoldingProjects(theProjectsFolderName, ['The Ferryman']);
    thePickerGivesTheFolderAt(theProjectsFolderName, 'The Ferryman');
    mountYourProjects({ chooser: aChooserGivingTheFolder() });

    await writer.choosesAFolder();

    await expect.element(whereTheProjectsAreKept().refusal).toHaveTextContent(theRefusal);
    await expect
      .element(whereTheProjectsAreKept().refusalIcon)
      .toHaveAttribute('aria-hidden', 'true');
  });
});

describe('starting a project', () => {
  it('follows what is typed with the name of the folder it will make', async () => {
    await reachingYourProjects();
    await writer.startsAProject();

    await expect
      .element(yourProjects().said)
      .toHaveTextContent('working-title will make a folder named Untitled project in Writing.');

    await writer.typesTheTitle('The Ferryman');

    await expect
      .element(yourProjects().said)
      .toHaveTextContent('working-title will make a folder named The Ferryman in Writing.');
  });

  it('makes one project folder and starts one project when the writer presses Start twice', async () => {
    const started: string[] = [];
    const saving = Promise.withResolvers<void>();
    await anEmptyFolderNamed(theProjectsFolderName);
    thePickerGivesTheFolderAt(theProjectsFolderName);
    mountYourProjects({
      start: async (title) => {
        started.push(title);
        await saving.promise;
      },
    });
    await writer.choosesAFolder();
    await writer.startsAProject();

    await writer.pressesStart();
    await writer.pressesStart();
    saving.resolve();

    await expect
      .poll(async () => (await theEntriesIn(await theProjectsFolder())).map(({ name }) => name))
      .toEqual(['Untitled project']);
    expect(started).toEqual(['']);
  });

  it('tells the writer when a start fails, and lets them start again', async () => {
    const started: string[] = [];
    let refusing = true;
    const folder: ProjectsFolder = {
      name: theProjectsFolderName,
      ownTitle: () => Promise.resolve(undefined),
      freeNameFor: (title) => Promise.resolve(title),
      start: () =>
        refusing ? Promise.reject(new Error('the folder could not be made')) : Promise.resolve(),
    };
    mountYourProjects({
      chooser: { choose: () => Promise.resolve(folder) },
      start: async (title) => {
        started.push(title);
      },
    });
    await writer.choosesAFolder();
    await writer.startsAProject();

    await writer.pressesStart();

    await expect
      .element(yourProjects().startFailed)
      .toHaveTextContent("working-title couldn't make the project's folder. Try again.");

    refusing = false;
    await writer.pressesStart();

    await expect.element(yourProjects().startFailed).toBeEmptyDOMElement();
    expect(started).toEqual(['']);
  });

  it('starts the project under the title typed when Start was pressed, whatever is typed while it starts', async () => {
    const made: string[] = [];
    const started: string[] = [];
    const making = Promise.withResolvers<void>();
    const folder: ProjectsFolder = {
      name: theProjectsFolderName,
      ownTitle: () => Promise.resolve(undefined),
      freeNameFor: (title) => Promise.resolve(title),
      start: async (title) => {
        made.push(title);
        await making.promise;
      },
    };
    mountYourProjects({
      chooser: { choose: () => Promise.resolve(folder) },
      start: async (title) => {
        started.push(title);
      },
    });
    await writer.choosesAFolder();
    await writer.startsAProject();
    await writer.typesTheTitle('The Ferryman');

    await writer.pressesStart();
    await writer.typesTheTitle(' Returns');
    making.resolve();

    await expect.poll(() => started).toEqual(['The Ferryman']);
    expect(made).toEqual(['The Ferryman']);
  });

  it('makes the folder once when the project fails to open after it, and opens it on the next press', async () => {
    const made: string[] = [];
    const started: string[] = [];
    let opening = false;
    const folder: ProjectsFolder = {
      name: theProjectsFolderName,
      ownTitle: () => Promise.resolve(undefined),
      freeNameFor: (title) => Promise.resolve(title === '' ? 'Untitled project' : title),
      start: async (title) => {
        made.push(title);
      },
    };
    mountYourProjects({
      chooser: { choose: () => Promise.resolve(folder) },
      start: async (title) => {
        started.push(title);
        if (!opening) throw new Error('the project could not be opened');
      },
    });
    await writer.choosesAFolder();
    await writer.startsAProject();

    await writer.pressesStart();

    await expect
      .element(yourProjects().startFailed)
      .toHaveTextContent(
        "working-title made the project's folder but couldn't open the project. Try again.",
      );
    await expect.element(yourProjects().title).toHaveAttribute('readonly');
    await expect
      .element(yourProjects().said)
      .toHaveTextContent(
        `working-title made a folder named Untitled project in ${theProjectsFolderName}.`,
      );

    opening = true;
    await writer.pressesStart();

    await expect.element(yourProjects().startFailed).toBeEmptyDOMElement();
    expect(made).toEqual(['']);
    expect(started).toEqual(['', '']);
  });

  it('puts the focus back on "Start a project" when the writer cancels', async () => {
    await reachingYourProjects();
    await writer.startsAProject();

    await writer.cancelsTheStart();

    await expect.element(yourProjects().startAProject).toHaveFocus();
  });
});
