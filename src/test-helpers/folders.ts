import { fileSystemFolders, type DirectoryPicker } from '../adapters/file-system-folders';
import { folderNameFor } from '../adapters/folder-name';
import { snowflakeExtended } from '../methods/snowflake-extended';
import type { ProjectsFolder } from '../ports/projects-folder';
import type { Entry } from './folder';

export const theProjectsFolderName = 'Writing';

const theFolderAt = async (path: readonly string[]): Promise<FileSystemDirectoryHandle> => {
  let folder = await navigator.storage.getDirectory();
  for (const name of path) folder = await folder.getDirectoryHandle(name, { create: true });
  return folder;
};

const emptied = async (folder: FileSystemDirectoryHandle): Promise<FileSystemDirectoryHandle> => {
  const names: string[] = [];
  for await (const name of folder.keys()) names.push(name);
  for (const name of names) await folder.removeEntry(name, { recursive: true });
  return folder;
};

export const theProjectsFolder = async (): Promise<FileSystemDirectoryHandle> =>
  await theFolderAt([theProjectsFolderName]);

export const anEmptyFolderNamed = async (name: string): Promise<FileSystemDirectoryHandle> =>
  await emptied(await theFolderAt([name]));

export const aFolderHoldingProjects = async (
  name: string,
  titles: readonly string[],
): Promise<void> => {
  await anEmptyFolderNamed(name);
  const projects = await aChosenFolderAt(name);
  for (const title of titles) await projects.start(title);
};

export const aPickerGivingTheFolder = (...path: readonly string[]): DirectoryPicker => ({
  showDirectoryPicker: () => theFolderAt(path),
});

export const aPickerTheWriterCancels: DirectoryPicker = {
  showDirectoryPicker: () => Promise.reject(new DOMException('nothing chosen', 'AbortError')),
};

export const aPickerThatFails: DirectoryPicker = {
  showDirectoryPicker: () => Promise.reject(new Error('the folder could not be opened')),
};

export const aChooserGivingTheFolder = (...path: readonly string[]) =>
  fileSystemFolders(snowflakeExtended, aPickerGivingTheFolder(...path));

export const aChosenFolderAt = async (...path: readonly string[]): Promise<ProjectsFolder> => {
  const chosen = await aChooserGivingTheFolder(...path).choose();
  if (chosen === undefined) throw new Error('the picker gave nothing');
  return chosen;
};

export const aChooserTheWriterCancels = () =>
  fileSystemFolders(snowflakeExtended, aPickerTheWriterCancels);

export const aChooserThatFails = () => fileSystemFolders(snowflakeExtended, aPickerThatFails);

export const aChooserWithNoPicker = () => fileSystemFolders(snowflakeExtended, {});

export const aProjectsFolder = (over: Partial<ProjectsFolder> = {}): ProjectsFolder => ({
  name: theProjectsFolderName,
  ownTitle: () => Promise.resolve(undefined),
  freeNameFor: (title) => Promise.resolve(folderNameFor(title)),
  start: (title) => Promise.resolve(folderNameFor(title)),
  ...over,
});

export const theEntriesIn = async (
  folder: FileSystemDirectoryHandle,
): Promise<readonly Entry[]> => {
  const entries: Entry[] = [];
  for await (const [name, handle] of folder.entries()) {
    if (handle.kind === 'directory') {
      entries.push({ role: 'folder', name, entries: await theEntriesIn(handle) });
      continue;
    }
    const lines = (await (await handle.getFile()).text()).split('\n');
    if (lines.at(-1) === '') lines.pop();
    entries.push({ role: 'file', name, text: lines });
  }
  return entries;
};
