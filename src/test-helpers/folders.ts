import { fileSystemFolders, type DirectoryPicker } from '../adapters/file-system-folders';
import { snowflakeExtended } from '../methods/snowflake-extended';
import type { Entry } from './folder';

export const theProjectsFolderName = 'Writing';

let given: readonly string[] = [theProjectsFolderName];

const folderAt = async (path: readonly string[]): Promise<FileSystemDirectoryHandle> => {
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
  await folderAt([theProjectsFolderName]);

export const anEmptyFolderNamed = async (name: string): Promise<FileSystemDirectoryHandle> =>
  await emptied(await folderAt([name]));

export const aFolderHoldingProjects = async (
  name: string,
  titles: readonly string[],
): Promise<void> => {
  const folder = await anEmptyFolderNamed(name);
  const projects = await fileSystemFolders(snowflakeExtended, {
    showDirectoryPicker: async () => folder,
  }).choose();
  if (projects === undefined) throw new Error('the picker gave nothing');
  for (const title of titles) await projects.start(title);
};

export const thePickerGivesTheFolderAt = (...path: readonly string[]): void => {
  given = path;
};

export const aPickerGivingTheFolder: DirectoryPicker = {
  showDirectoryPicker: () => folderAt(given),
};

export const aPickerTheWriterCancels: DirectoryPicker = {
  showDirectoryPicker: () => Promise.reject(new DOMException('nothing chosen', 'AbortError')),
};

export const aPickerThatFails: DirectoryPicker = {
  showDirectoryPicker: () => Promise.reject(new Error('the folder could not be opened')),
};

export const aChooserGivingTheFolder = () =>
  fileSystemFolders(snowflakeExtended, aPickerGivingTheFolder);

export const aChooserTheWriterCancels = () =>
  fileSystemFolders(snowflakeExtended, aPickerTheWriterCancels);

export const aChooserThatFails = () => fileSystemFolders(snowflakeExtended, aPickerThatFails);

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
