import { describe, expect, it } from 'vite-plus/test';
import { snowflakeExtended } from '../methods/snowflake-extended';
import type { ProjectsFolder } from '../ports/projects-folder';
import { fileSystemFolders, type DirectoryPicker } from './file-system-folders';

const writing = 'Writing';

const anEmptyFolder = async (name: string): Promise<FileSystemDirectoryHandle> => {
  const root = await navigator.storage.getDirectory();
  await root.removeEntry(name, { recursive: true }).catch(() => undefined);
  return await root.getDirectoryHandle(name, { create: true });
};

const picking = (folder: FileSystemDirectoryHandle): DirectoryPicker => ({
  showDirectoryPicker: async () => folder,
});

const choosing = async (onDisk: FileSystemDirectoryHandle): Promise<ProjectsFolder> => {
  const chosen = await fileSystemFolders(snowflakeExtended, picking(onDisk)).choose();
  if (chosen === undefined) throw new Error('the picker gave nothing');
  return chosen;
};

const projectFileIn = async (
  projects: FileSystemDirectoryHandle,
  name: string,
): Promise<string> => {
  const project = await projects.getDirectoryHandle(name);
  const file = await project.getFileHandle('project.md');
  return await (await file.getFile()).text();
};

describe('choosing where projects are kept', () => {
  it('gives the folder the picker returns, named as it is', async () => {
    const chosen = await choosing(await anEmptyFolder(writing));
    expect(chosen.name).toBe(writing);
  });

  it('asks the picker for a folder the app may write in', async () => {
    const asked: unknown[] = [];
    const picker: DirectoryPicker = {
      showDirectoryPicker: async (options) => {
        asked.push(options);
        return await anEmptyFolder(writing);
      },
    };

    await fileSystemFolders(snowflakeExtended, picker).choose();

    expect(asked).toEqual([{ mode: 'readwrite' }]);
  });

  it('gives nothing where the writer cancels the picker', async () => {
    const cancelled: DirectoryPicker = {
      showDirectoryPicker: async () => {
        throw new DOMException('the writer cancelled', 'AbortError');
      },
    };

    expect(await fileSystemFolders(snowflakeExtended, cancelled).choose()).toBeUndefined();
  });

  it('refuses to read a picker that failed for another reason as a cancel', async () => {
    const refused: DirectoryPicker = {
      showDirectoryPicker: async () => {
        throw new DOMException('the writer did not allow it', 'NotAllowedError');
      },
    };

    await expect(fileSystemFolders(snowflakeExtended, refused).choose()).rejects.toThrow(
      'the writer did not allow it',
    );
  });
});

describe('a free name for a project in the projects folder', () => {
  it('is the name itself where nothing holds it, " 2" where that is taken, and " 3" where both are', async () => {
    const onDisk = await anEmptyFolder(writing);
    const chosen = await choosing(onDisk);

    expect(await chosen.freeNameFor('The Ferryman')).toBe('The Ferryman');
    await onDisk.getDirectoryHandle('The Ferryman', { create: true });
    expect(await chosen.freeNameFor('The Ferryman')).toBe('The Ferryman 2');
    await onDisk.getDirectoryHandle('The Ferryman 2', { create: true });
    expect(await chosen.freeNameFor('The Ferryman')).toBe('The Ferryman 3');
  });

  it('is the folder name for the title, not the title itself', async () => {
    const chosen = await choosing(await anEmptyFolder(writing));
    expect(await chosen.freeNameFor('Salt/Year')).toBe('Salt Year');
  });

  it('counts a file holding the name as taken', async () => {
    const onDisk = await anEmptyFolder(writing);
    const chosen = await choosing(onDisk);
    const writable = await (
      await onDisk.getFileHandle('The Ferryman', { create: true })
    ).createWritable();
    await writable.close();

    expect(await chosen.freeNameFor('The Ferryman')).toBe('The Ferryman 2');
    expect((await chosen.start('The Ferryman')).name).toBe('The Ferryman 2');
  });
});

describe('starting a project in the projects folder', () => {
  it('makes the project’s folder under the title and writes project.md holding the title, the method and the version', async () => {
    const onDisk = await anEmptyFolder(writing);
    const chosen = await choosing(onDisk);

    const made = await chosen.start('The Ferryman');

    expect(made.name).toBe('The Ferryman');
    expect(await projectFileIn(onDisk, 'The Ferryman')).toBe(
      '---\ntitle: "The Ferryman"\nmethod: snowflake-extended\nversion: 2\n---\n',
    );
  });

  it('makes the folder "Untitled project" holding an empty title where the writer gave none', async () => {
    const onDisk = await anEmptyFolder(writing);
    const chosen = await choosing(onDisk);

    const made = await chosen.start('');

    expect(made.name).toBe('Untitled project');
    expect(await projectFileIn(onDisk, 'Untitled project')).toBe(
      '---\ntitle: ""\nmethod: snowflake-extended\nversion: 2\n---\n',
    );
  });

  it('makes its folder beside a project of that name, leaving that project’s file as it was', async () => {
    const onDisk = await anEmptyFolder(writing);
    const chosen = await choosing(onDisk);
    const taken = await onDisk.getDirectoryHandle('The Ferryman', { create: true });
    const writable = await (
      await taken.getFileHandle('project.md', { create: true })
    ).createWritable();
    await writable.write('---\ntitle: "The Ferryman"\n---\n');
    await writable.close();

    const made = await chosen.start('The Ferryman');

    expect(made.name).toBe('The Ferryman 2');
    expect(await projectFileIn(onDisk, 'The Ferryman')).toBe('---\ntitle: "The Ferryman"\n---\n');
  });
});

describe('the title a chosen folder holds in its own project.md', () => {
  it('is the title the app wrote there', async () => {
    const made = await (await choosing(await anEmptyFolder(writing))).start('The Ferryman');
    expect(await (await choosing(made)).ownTitle()).toBe('The Ferryman');
  });

  it('is empty where the project was started with no title', async () => {
    const made = await (await choosing(await anEmptyFolder(writing))).start('');
    expect(await (await choosing(made)).ownTitle()).toBe('');
  });

  it('is nothing where the folder holds no project.md', async () => {
    expect(await (await choosing(await anEmptyFolder(writing))).ownTitle()).toBeUndefined();
  });
});
