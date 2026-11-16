import { describe, expect, it } from 'vite-plus/test';
import {
  aChosenFolderAt,
  aProjectsFolder,
  anEmptyFolderNamed,
  theEntriesIn,
  theProjectsFolder,
  theProjectsFolderName,
} from '../../../test-helpers/folders';
import { settled } from '../../../test-helpers/driver';
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
    const chosen = await aChosenFolderAt(theProjectsFolderName);
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

  it('names the folder it made rather than the next free name', async () => {
    await anEmptyFolderNamed(theProjectsFolderName);
    mountStartRow({
      folder: await aChosenFolderAt(theProjectsFolderName),
      start: () => Promise.reject(new Error('the project could not be opened')),
    });
    await writer.typesTheTitle('The Ferryman');

    await writer.pressesStart();

    await expect
      .element(theStartRow().said)
      .toHaveTextContent(
        `working-title made a folder named The Ferryman in ${theProjectsFolderName}.`,
      );
  });

  it('opens the project under the title its folder was made from when the writer types while it is made and the open fails', async () => {
    const made: string[] = [];
    const started: string[] = [];
    const making = Promise.withResolvers<void>();
    let opening = false;
    mountStartRow({
      folder: aProjectsFolder({
        start: async (title) => {
          made.push(title);
          await making.promise;
        },
      }),
      start: async (title) => {
        started.push(title);
        if (!opening) throw new Error('the project could not be opened');
      },
    });
    await writer.typesTheTitle('The Ferryman');

    await writer.pressesStart();
    await writer.typesTheTitle(' Returns');
    making.resolve();

    await expect
      .element(theStartRow().failed)
      .toHaveTextContent(
        "working-title made the project's folder but couldn't open the project. Try again.",
      );
    await expect
      .element(theStartRow().said)
      .toHaveTextContent(
        `working-title made a folder named The Ferryman in ${theProjectsFolderName}.`,
      );
    await expect.element(theStartRow().title).toHaveValue('The Ferryman');

    opening = true;
    await writer.pressesStart();

    await expect.element(theStartRow().failed).toBeEmptyDOMElement();
    expect(made).toEqual(['The Ferryman']);
    expect(started).toEqual(['The Ferryman', 'The Ferryman']);
  });

  it('hides the line while the folder cannot be read for a name', async () => {
    mountStartRow({
      folder: aProjectsFolder({
        freeNameFor: () => Promise.reject(new Error('the folder could not be read')),
      }),
    });

    await expect.element(theStartRow().said).not.toBeVisible();
  });

  it('shows the line again once the folder can be read', async () => {
    const folder = aProjectsFolder();
    let refusing = true;
    mountStartRow({
      folder: {
        ...folder,
        freeNameFor: (title) =>
          refusing
            ? Promise.reject(new Error('the folder could not be read'))
            : folder.freeNameFor(title),
      },
    });
    await expect.element(theStartRow().said).not.toBeVisible();

    refusing = false;
    await writer.typesTheTitle('The Ferryman');

    await expect.element(theStartRow().said).toBeVisible();
    await expect
      .element(theStartRow().said)
      .toHaveTextContent(
        `working-title will make a folder named The Ferryman in ${theProjectsFolderName}.`,
      );
  });

  it('keeps the line hidden when an older scan answers after the latest one failed', async () => {
    const theOlderScanAnswered = Promise.withResolvers<void>();
    const folder = aProjectsFolder();
    mountStartRow({
      folder: {
        ...folder,
        freeNameFor: async (title) => {
          if (title === 'The Ferryman') await theOlderScanAnswered.promise;
          if (title === 'The Ferryman 2') throw new Error('the folder could not be read');
          return folder.freeNameFor(title);
        },
      },
    });

    await writer.typesTheTitle('The Ferryman');
    await writer.typesTheTitle('The Ferryman 2');
    await expect.element(theStartRow().said).not.toBeVisible();

    theOlderScanAnswered.resolve();
    await settled();

    await expect.element(theStartRow().said).not.toBeVisible();
  });

  it('keeps the line shown when a stale scan fails after the latest one answered', async () => {
    const theLatestScanLanded = Promise.withResolvers<void>();
    const folder = aProjectsFolder();
    mountStartRow({
      folder: {
        ...folder,
        freeNameFor: async (title) => {
          if (title === 'The Ferryman') {
            await theLatestScanLanded.promise;
            throw new Error('the folder could not be read');
          }
          return folder.freeNameFor(title);
        },
      },
    });

    await writer.typesTheTitle('The Ferryman');
    await writer.typesTheTitle('The Ferryman 2');
    await expect
      .element(theStartRow().said)
      .toHaveTextContent(
        `working-title will make a folder named The Ferryman 2 in ${theProjectsFolderName}.`,
      );

    theLatestScanLanded.resolve();
    await settled();

    await expect.element(theStartRow().said).toBeVisible();
    await expect
      .element(theStartRow().said)
      .toHaveTextContent(
        `working-title will make a folder named The Ferryman 2 in ${theProjectsFolderName}.`,
      );
  });
});
