import type { Method } from '../domain/project';
import type { ProjectsFolder, ProjectsFolderChooser } from '../ports/projects-folder';
import { folderNameFor } from './folder-name';

export interface DirectoryPicker {
  showDirectoryPicker(options: { readonly mode: 'readwrite' }): Promise<FileSystemDirectoryHandle>;
}

const projectFileName = 'project.md';

const projectFile = (method: Method, title: string): string =>
  `---\ntitle: ${JSON.stringify(title)}\nmethod: ${method.name}\nversion: ${method.version}\n---\n`;

// shortcut: a failed read of a name reads as free, until a failure must be told from a free name.
const aFreeName = async (parent: FileSystemDirectoryHandle, name: string): Promise<string> => {
  for (let number = 1; ; number += 1) {
    const candidate = number === 1 ? name : `${name} ${number}`;
    try {
      await parent.getDirectoryHandle(candidate);
    } catch {
      return candidate;
    }
  }
};

const parsed = (json: string): unknown => {
  try {
    return JSON.parse(json);
  } catch {
    return undefined;
  }
};

const ownTitleOf = async (folder: FileSystemDirectoryHandle): Promise<string | undefined> => {
  try {
    const file = await folder.getFileHandle(projectFileName);
    const written = /^title: (.*)$/m.exec(await (await file.getFile()).text())?.[1] ?? '';
    const title = parsed(written);
    return typeof title === 'string' ? title : '';
  } catch {
    return undefined;
  }
};

const projectsFolder = (method: Method, folder: FileSystemDirectoryHandle): ProjectsFolder => ({
  name: folder.name,

  ownTitle: () => ownTitleOf(folder),

  freeNameFor: (title) => aFreeName(folder, folderNameFor(title)),

  start: async (title) => {
    const made = await folder.getDirectoryHandle(await aFreeName(folder, folderNameFor(title)), {
      create: true,
    });
    const writable = await (
      await made.getFileHandle(projectFileName, { create: true })
    ).createWritable();
    await writable.write(projectFile(method, title));
    await writable.close();
    return made;
  },
});

export const fileSystemFolders = (
  method: Method,
  picker: DirectoryPicker,
): ProjectsFolderChooser => ({
  choose: async () => {
    let folder: FileSystemDirectoryHandle;
    try {
      folder = await picker.showDirectoryPicker({ mode: 'readwrite' });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return undefined;
      throw error;
    }
    return projectsFolder(method, folder);
  },
});
