import { describe, expect, it } from 'vite-plus/test';
import { snowflakeExtended } from '../methods/snowflake-extended';
import type { ProjectsFolder } from '../ports/projects-folder';
import { fileSystemFolders, type DirectoryPicker } from './file-system-folders';

const theFolderOnDisk = 'a folder on disk';

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

const entryNamesIn = async (folder: FileSystemDirectoryHandle): Promise<string[]> => {
  const names: string[] = [];
  for await (const entry of folder.values()) names.push(entry.name);
  return names.sort();
};

const projectFileIn = async (
  projects: FileSystemDirectoryHandle,
  name: string,
): Promise<string> => {
  const project = await projects.getDirectoryHandle(name);
  const file = await project.getFileHandle('project.md');
  return await (await file.getFile()).text();
};

const writingIn = async (
  folder: FileSystemDirectoryHandle,
  name: string,
  text: string,
): Promise<void> => {
  const writable = await (await folder.getFileHandle(name, { create: true })).createWritable();
  await writable.write(text);
  await writable.close();
};

describe('choosing where projects are kept', () => {
  it('gives the folder the picker returns, named as it is', async () => {
    const chosen = await choosing(await anEmptyFolder(theFolderOnDisk));
    expect(chosen.name).toBe(theFolderOnDisk);
  });

  it('asks the picker for a folder the app may write in', async () => {
    const asked: unknown[] = [];
    const picker: DirectoryPicker = {
      showDirectoryPicker: async (options) => {
        asked.push(options);
        return await anEmptyFolder(theFolderOnDisk);
      },
    };

    await fileSystemFolders(snowflakeExtended, picker).choose();

    expect(asked).toEqual([{ mode: 'readwrite' }]);
  });

  it('refuses where the browser has no folder picker', async () => {
    await expect(fileSystemFolders(snowflakeExtended, {}).choose()).rejects.toThrow(
      'this browser has no folder picker',
    );
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
    const onDisk = await anEmptyFolder(theFolderOnDisk);
    const chosen = await choosing(onDisk);

    expect(await chosen.freeNameFor('The Ferryman')).toBe('The Ferryman');
    await onDisk.getDirectoryHandle('The Ferryman', { create: true });
    expect(await chosen.freeNameFor('The Ferryman')).toBe('The Ferryman 2');
    await onDisk.getDirectoryHandle('The Ferryman 2', { create: true });
    expect(await chosen.freeNameFor('The Ferryman')).toBe('The Ferryman 3');
  });

  it.each([
    ['its case alone', 'The Ferryman', 'the ferryman'],
    ['the case of letters outside ASCII', '«Начало»', '«начало»'],
  ])(
    'counts a name as taken where an entry differs by %s, since macOS and Windows disks ignore case',
    async (_, taken, title) => {
      const onDisk = await anEmptyFolder(theFolderOnDisk);
      await onDisk.getDirectoryHandle(taken, { create: true });

      expect(await (await choosing(onDisk)).freeNameFor(title)).toBe(`${title} 2`);
    },
  );

  it('is the folder name for the title, not the title itself', async () => {
    const chosen = await choosing(await anEmptyFolder(theFolderOnDisk));
    expect(await chosen.freeNameFor('Salt/Year')).toBe('Salt Year');
  });

  it('counts a file holding the name as taken', async () => {
    const onDisk = await anEmptyFolder(theFolderOnDisk);
    const chosen = await choosing(onDisk);
    await writingIn(onDisk, 'The Ferryman', '');

    expect(await chosen.freeNameFor('The Ferryman')).toBe('The Ferryman 2');
    await chosen.start('The Ferryman');
    expect(await entryNamesIn(onDisk)).toEqual(['The Ferryman', 'The Ferryman 2']);
  });
});

describe('starting a project in the projects folder', () => {
  it('makes the project’s folder under the title and writes project.md holding the title, the method and the version', async () => {
    const onDisk = await anEmptyFolder(theFolderOnDisk);
    const chosen = await choosing(onDisk);

    await chosen.start('The Ferryman');

    expect(await entryNamesIn(onDisk)).toEqual(['The Ferryman']);
    expect(await projectFileIn(onDisk, 'The Ferryman')).toBe(
      '---\ntitle: "The Ferryman"\nmethod: snowflake-extended\nversion: 2\n---\n',
    );
  });

  it('makes the folder "Untitled project" holding an empty title where the writer gave none', async () => {
    const onDisk = await anEmptyFolder(theFolderOnDisk);
    const chosen = await choosing(onDisk);

    await chosen.start('');

    expect(await entryNamesIn(onDisk)).toEqual(['Untitled project']);
    expect(await projectFileIn(onDisk, 'Untitled project')).toBe(
      '---\ntitle: ""\nmethod: snowflake-extended\nversion: 2\n---\n',
    );
  });

  it.each([
    ['The Ferryman', ['The Ferryman', 'The Ferryman 2']],
    ['the ferryman', ['The Ferryman', 'the ferryman 2']],
  ])(
    'makes its folder beside a project named %s, leaving that project’s file as it was',
    async (title, names) => {
      const onDisk = await anEmptyFolder(theFolderOnDisk);
      const chosen = await choosing(onDisk);
      const taken = await onDisk.getDirectoryHandle('The Ferryman', { create: true });
      await writingIn(taken, 'project.md', '---\ntitle: "The Ferryman"\n---\n');

      await chosen.start(title);

      expect(await entryNamesIn(onDisk)).toEqual(names);
      expect(await projectFileIn(onDisk, 'The Ferryman')).toBe('---\ntitle: "The Ferryman"\n---\n');
    },
  );
});

describe('the title a chosen folder holds in its own project.md', () => {
  it.each([
    [
      'a project.md with Windows line endings',
      '---\r\ntitle: My Book\r\nmethod: snowflake-extended\r\nversion: 2\r\n---\r\n',
      'My Book',
    ],
    [
      'a project.md whose title was typed in by hand, with no quotes',
      '---\ntitle: My Book\n---\n',
      'My Book',
    ],
  ])('reads the title %s holds', async (what, file, title) => {
    const onDisk = await anEmptyFolder(theFolderOnDisk);
    await writingIn(onDisk, 'project.md', file);

    expect(await (await choosing(onDisk)).ownTitle()).toBe(title);
  });

  it('is the title the app wrote there', async () => {
    const onDisk = await anEmptyFolder(theFolderOnDisk);
    await (await choosing(onDisk)).start('The Ferryman');
    const project = await onDisk.getDirectoryHandle('The Ferryman');
    expect(await (await choosing(project)).ownTitle()).toBe('The Ferryman');
  });

  it('is empty where the project was started with no title', async () => {
    const onDisk = await anEmptyFolder(theFolderOnDisk);
    await (await choosing(onDisk)).start('');
    const project = await onDisk.getDirectoryHandle('Untitled project');
    expect(await (await choosing(project)).ownTitle()).toBe('');
  });

  it('is nothing where the folder holds no project.md', async () => {
    expect(await (await choosing(await anEmptyFolder(theFolderOnDisk))).ownTitle()).toBeUndefined();
  });
});
