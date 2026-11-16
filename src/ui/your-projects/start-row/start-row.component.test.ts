import { describe, expect, it } from 'vite-plus/test';
import {
  aChooserGivingTheFolder,
  aProjectsFolder,
  anEmptyFolderNamed,
  theEntriesIn,
  thePickerGivesTheFolderAt,
  theProjectsFolder,
  theProjectsFolderName,
} from '../../../test-helpers/folders';
import { vitestBrowserDriver } from '../../../test-helpers/vitest-browser.driver';
import { startRowWriterOn } from './start-row.dsl';
import { mountStartRow } from './start-row.harness';
import { theStartRow } from './start-row.test-page';

const driver = vitestBrowserDriver();
const writer = startRowWriterOn(driver);

describe('starting a project', () => {
  it('follows what is typed with the name of the folder it will make', async () => {
    mountStartRow();

    await expect
      .element(theStartRow().said)
      .toHaveTextContent('working-title will make a folder named Untitled project in Writing.');

    await writer.typesTheTitle('The Ferryman');

    await expect
      .element(theStartRow().said)
      .toHaveTextContent('working-title will make a folder named The Ferryman in Writing.');
  });

  it('makes one project folder and starts one project when the writer presses Start twice', async () => {
    const started: string[] = [];
    const saving = Promise.withResolvers<void>();
    await anEmptyFolderNamed(theProjectsFolderName);
    thePickerGivesTheFolderAt(theProjectsFolderName);
    const chosen = await aChooserGivingTheFolder().choose();
    if (chosen === undefined) throw new Error('the picker gave nothing');
    mountStartRow({
      folder: chosen,
      start: async (title) => {
        started.push(title);
        await saving.promise;
      },
    });

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
    mountStartRow({
      folder: aProjectsFolder({
        start: () =>
          refusing ? Promise.reject(new Error('the folder could not be made')) : Promise.resolve(),
      }),
      start: async (title) => {
        started.push(title);
      },
    });

    await writer.pressesStart();

    await expect
      .element(theStartRow().failed)
      .toHaveTextContent("working-title couldn't make the project's folder. Try again.");

    refusing = false;
    await writer.pressesStart();

    await expect.element(theStartRow().failed).toBeEmptyDOMElement();
    expect(started).toEqual(['']);
  });

  it('starts the project under the title typed when Start was pressed, whatever is typed while it starts', async () => {
    const made: string[] = [];
    const started: string[] = [];
    const making = Promise.withResolvers<void>();
    mountStartRow({
      folder: aProjectsFolder({
        start: async (title) => {
          made.push(title);
          await making.promise;
        },
      }),
      start: async (title) => {
        started.push(title);
      },
    });
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
    mountStartRow({
      folder: aProjectsFolder({
        start: async (title) => {
          made.push(title);
        },
      }),
      start: async (title) => {
        started.push(title);
        if (!opening) throw new Error('the project could not be opened');
      },
    });

    await writer.pressesStart();

    await expect
      .element(theStartRow().failed)
      .toHaveTextContent(
        "working-title made the project's folder but couldn't open the project. Try again.",
      );
    await expect.element(theStartRow().title).toHaveAttribute('readonly');
    await expect
      .element(theStartRow().said)
      .toHaveTextContent(
        `working-title made a folder named Untitled project in ${theProjectsFolderName}.`,
      );

    opening = true;
    await writer.pressesStart();

    await expect.element(theStartRow().failed).toBeEmptyDOMElement();
    expect(made).toEqual(['']);
    expect(started).toEqual(['', '']);
  });
});
