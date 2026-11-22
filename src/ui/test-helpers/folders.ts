import {
  aChosenFolderAt,
  anEmptyFolderNamed,
  theFolderAt,
} from '../../test-helpers/folders/folders';

export const theProjectsFolderName = 'Writing';

export const theProjectsFolder = async (): Promise<FileSystemDirectoryHandle> =>
  await theFolderAt([theProjectsFolderName]);

export const aFolderHoldingProjects = async (
  name: string,
  titles: readonly string[],
): Promise<void> => {
  await anEmptyFolderNamed(name);
  const projects = await aChosenFolderAt(name);
  for (const title of titles) await projects.start(title);
};
