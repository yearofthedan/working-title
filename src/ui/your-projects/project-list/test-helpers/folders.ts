import { folderNameFor } from '../../../../adapters/folder-name';
import type { ProjectsFolder } from '../../../../ports/projects-folder';
import { theProjectsFolderName } from '../../../test-helpers/folders';

export const aProjectsFolder = (over: Partial<ProjectsFolder> = {}): ProjectsFolder => ({
  name: theProjectsFolderName,
  ownTitle: () => Promise.resolve(undefined),
  freeNameFor: (title) => Promise.resolve(folderNameFor(title)),
  start: (title) => Promise.resolve(folderNameFor(title)),
  ...over,
});
