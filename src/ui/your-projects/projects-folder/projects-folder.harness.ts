import type { ProjectsFolder, ProjectsFolderChooser } from '../../../application/project';
import { aChooserGivingTheFolder } from '../../../test-helpers/folders/folders';
import { root } from '../../test-helpers/staging';
import { renderProjectsFolder } from './projects-folder.dom';
import { theProjectsFolderName } from '../../test-helpers/folders';

export interface Staged {
  readonly chooser?: ProjectsFolderChooser;
  readonly chosen?: (folder: ProjectsFolder) => Promise<void>;
}

export const mountFolderQuestion = (staged: Staged = {}): void => {
  const mounted = renderProjectsFolder({
    chooser: staged.chooser ?? aChooserGivingTheFolder(theProjectsFolderName),
    chosen: staged.chosen ?? (() => Promise.resolve()),
  });
  root('main').append(mounted.element);
};
