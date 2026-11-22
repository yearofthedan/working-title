import { aChosenFolderAt, anEmptyFolderNamed } from '../../test-helpers/folders';

export const aFolderHoldingProjects = async (
  name: string,
  titles: readonly string[],
): Promise<void> => {
  await anEmptyFolderNamed(name);
  const projects = await aChosenFolderAt(name);
  for (const title of titles) await projects.start(title);
};
