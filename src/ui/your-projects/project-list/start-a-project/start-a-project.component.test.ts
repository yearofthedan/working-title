import { afterEach, describe, expect, it, vi } from 'vite-plus/test';
import {
  aChosenFolderAt,
  anEmptyFolderNamed,
  theEntriesIn,
} from '../../../../test-helpers/folders/folders';
import { vitestBrowserDriver } from '../../../test-helpers/vitest-browser.driver';
import { thePauseBeforeReading } from './start-a-project';
import { startAProjectWriterOn } from './start-a-project.dsl';
import { mountStartRow } from './start-a-project.harness';
import { theStartRow } from './start-a-project.test-page';
import { aProjectsFolder } from '../test-helpers/folders';
import { theProjectsFolder, theProjectsFolderName } from '../../../test-helpers/folders';

const driver = vitestBrowserDriver();
const writer = startAProjectWriterOn(driver);

afterEach(() => {
  vi.useRealTimers();
});

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

  it('reads the folder once when the writer types several letters inside the pause', async () => {
    vi.useFakeTimers();
    const asked: string[] = [];
    const folder = aProjectsFolder();
    mountStartRow({
      folder: {
        ...folder,
        freeNameFor: (title) => {
          asked.push(title);
          return folder.freeNameFor(title);
        },
      },
    });

    await writer.typesTheTitle('The Fer');
    await writer.typesTheTitle('The Ferryman');
    expect(asked).toEqual(['']);

    await vi.advanceTimersByTimeAsync(thePauseBeforeReading);

    await expect
      .element(theStartRow().said)
      .toHaveTextContent('working-title will make a folder named The Ferryman in Writing.');
    expect(asked).toEqual(['', 'The Ferryman']);
  });

  it('reads the folder at once when the writer presses Start inside the pause, and starts the project after it lands', async () => {
    vi.useFakeTimers();
    const asked: string[] = [];
    const started: string[] = [];
    const theRead = Promise.withResolvers<string>();
    const folder = aProjectsFolder();
    mountStartRow({
      folder: {
        ...folder,
        freeNameFor: (title) => {
          asked.push(title);
          return title === 'The Ferryman' ? theRead.promise : folder.freeNameFor(title);
        },
      },
      start: async (title) => {
        started.push(title);
      },
    });

    await writer.typesTheTitle('The Ferryman');
    await writer.pressesStart();

    expect(asked).toEqual(['', 'The Ferryman']);
    expect(started).toEqual([]);

    theRead.resolve('The Ferryman');

    await expect
      .element(theStartRow().said)
      .toHaveTextContent('working-title made a folder named The Ferryman in Writing.');
    expect(started).toEqual(['The Ferryman']);
  });

  it('does not name the older text when a held read lands after the writer types again', async () => {
    vi.useFakeTimers();
    const theHeldRead = Promise.withResolvers<string>();
    const theLaterRead = Promise.withResolvers<string>();
    const theLaterReadBegun = Promise.withResolvers<void>();
    const folder = aProjectsFolder();
    mountStartRow({
      folder: {
        ...folder,
        freeNameFor: (title) => {
          if (title === 'The Ferryman') return theHeldRead.promise;
          if (title === 'The Ghost') {
            theLaterReadBegun.resolve();
            return theLaterRead.promise;
          }
          return folder.freeNameFor(title);
        },
      },
    });

    await writer.typesTheTitle('The Ferryman');
    await vi.advanceTimersByTimeAsync(thePauseBeforeReading);

    await writer.typesTheTitle('The Ghost');
    await vi.advanceTimersByTimeAsync(thePauseBeforeReading);
    theHeldRead.resolve('The Ferryman 2');
    await theLaterReadBegun.promise;

    await expect
      .element(theStartRow().said)
      .toHaveTextContent(
        `working-title will make a folder named Untitled project in ${theProjectsFolderName}.`,
      );
  });

  it('reads the folder once when a press inside the pause is followed by the pause passing', async () => {
    vi.useFakeTimers();
    const asked: string[] = [];
    const folder = aProjectsFolder();
    mountStartRow({
      folder: {
        ...folder,
        freeNameFor: (title) => {
          asked.push(title);
          return folder.freeNameFor(title);
        },
      },
      start: async () => undefined,
    });

    await writer.typesTheTitle('The Ferryman');
    await writer.pressesStart();
    await vi.advanceTimersByTimeAsync(thePauseBeforeReading);

    expect(asked).toEqual(['', 'The Ferryman']);
  });

  it('waits for the read in hand before starting, when the writer presses Start while the folder is read', async () => {
    vi.useFakeTimers();
    const asked: string[] = [];
    const started: string[] = [];
    const theRead = Promise.withResolvers<string>();
    const folder = aProjectsFolder();
    mountStartRow({
      folder: {
        ...folder,
        freeNameFor: (title) => {
          asked.push(title);
          return title === 'The Ferryman' ? theRead.promise : folder.freeNameFor(title);
        },
      },
      start: async (title) => {
        started.push(title);
      },
    });

    await writer.typesTheTitle('The Ferryman');
    await vi.advanceTimersByTimeAsync(thePauseBeforeReading);
    expect(asked).toEqual(['', 'The Ferryman']);

    await writer.pressesStart();

    expect(asked).toEqual(['', 'The Ferryman']);
    expect(started).toEqual([]);

    theRead.resolve('The Ferryman');

    await expect
      .element(theStartRow().said)
      .toHaveTextContent('working-title made a folder named The Ferryman in Writing.');
    expect(started).toEqual(['The Ferryman']);
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
    const folder = aProjectsFolder();
    mountStartRow({
      folder: {
        ...folder,
        start: (title) =>
          refusing
            ? Promise.reject(new Error('the folder could not be made'))
            : folder.freeNameFor(title),
      },
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

  it('starts the project under the title typed when Start was pressed, with the field read-only while it starts', async () => {
    const made: string[] = [];
    const started: string[] = [];
    const asked: string[] = [];
    const making = Promise.withResolvers<void>();
    const folder = aProjectsFolder();
    mountStartRow({
      folder: {
        ...folder,
        freeNameFor: (title) => {
          asked.push(title);
          return folder.freeNameFor(title);
        },
        start: async (title) => {
          made.push(title);
          await making.promise;
          return await folder.freeNameFor(title);
        },
      },
      start: async (title) => {
        started.push(title);
      },
    });
    await writer.typesTheTitle('The Ferryman');

    await writer.pressesStart();

    await expect.element(theStartRow().title).toHaveAttribute('readonly');
    expect(asked).toEqual(['', 'The Ferryman']);

    making.resolve();

    await expect.poll(() => started).toEqual(['The Ferryman']);
    expect(made).toEqual(['The Ferryman']);
    await expect.element(theStartRow().title).toHaveValue('The Ferryman');
  });

  it('names the field’s text on the line after a start fails', async () => {
    const made: string[] = [];
    const theRead = Promise.withResolvers<string>();
    const theMake = Promise.withResolvers<string>();
    const folder = aProjectsFolder();
    mountStartRow({
      folder: {
        ...folder,
        freeNameFor: (title) =>
          title === 'The Ferryman' ? theRead.promise : folder.freeNameFor(title),
        start: (title) => {
          made.push(title);
          return theMake.promise;
        },
      },
    });
    await writer.typesTheTitle('The Ferryman');

    await writer.pressesStart();
    theRead.resolve('The Ferryman');

    await expect
      .element(theStartRow().said)
      .toHaveTextContent(
        `working-title will make a folder named The Ferryman in ${theProjectsFolderName}.`,
      );

    theMake.reject(new Error('the folder could not be made'));

    await expect
      .element(theStartRow().failed)
      .toHaveTextContent("working-title couldn't make the project's folder. Try again.");
    await expect.element(theStartRow().title).not.toHaveAttribute('readonly');
    await expect
      .element(theStartRow().said)
      .toHaveTextContent(
        `working-title will make a folder named The Ferryman in ${theProjectsFolderName}.`,
      );
    expect(made).toEqual(['The Ferryman']);
  });

  it('makes the folder once when the project fails to open after it, and opens it on the next press', async () => {
    const made: string[] = [];
    const started: string[] = [];
    let opening = false;
    const folder = aProjectsFolder();
    mountStartRow({
      folder: {
        ...folder,
        start: async (title) => {
          made.push(title);
          return await folder.freeNameFor(title);
        },
      },
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

  it('opens the project under the title its folder was made from when the open fails', async () => {
    const made: string[] = [];
    const started: string[] = [];
    const making = Promise.withResolvers<void>();
    let opening = false;
    const folder = aProjectsFolder();
    mountStartRow({
      folder: {
        ...folder,
        start: async (title) => {
          made.push(title);
          await making.promise;
          return await folder.freeNameFor(title);
        },
      },
      start: async (title) => {
        started.push(title);
        if (!opening) throw new Error('the project could not be opened');
      },
    });
    await writer.typesTheTitle('The Ferryman');

    await writer.pressesStart();
    await expect.element(theStartRow().title).toHaveAttribute('readonly');
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

  it('names the folder it made when the folder could not be read before the writer pressed Start', async () => {
    const folder = aProjectsFolder();
    mountStartRow({
      folder: {
        ...folder,
        freeNameFor: () => Promise.reject(new Error('the folder could not be read')),
      },
      start: () => Promise.reject(new Error('the project could not be opened')),
    });
    await writer.typesTheTitle('The Ferryman');
    await expect.element(theStartRow().said).not.toBeVisible();

    await writer.pressesStart();

    await expect.element(theStartRow().said).toBeVisible();
    await expect
      .element(theStartRow().said)
      .toHaveTextContent(
        `working-title made a folder named The Ferryman in ${theProjectsFolderName}.`,
      );
    await expect
      .element(theStartRow().failed)
      .toHaveTextContent(
        "working-title made the project's folder but couldn't open the project. Try again.",
      );
  });
});
