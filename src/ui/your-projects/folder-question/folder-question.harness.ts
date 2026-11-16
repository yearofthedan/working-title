import type { ProjectsFolder, ProjectsFolderChooser } from '../../../application/project';
import { aChooserGivingTheFolder, theProjectsFolderName } from '../../../test-helpers/folders';
import { root } from '../../../test-helpers/staging';
import { folderQuestion } from './folder-question.dom';

export interface Staged {
  readonly chooser?: ProjectsFolderChooser;
  readonly chosen?: (folder: ProjectsFolder) => Promise<void>;
}

export const mountFolderQuestion = (staged: Staged = {}): void => {
  const mounted = folderQuestion({
    chooser: staged.chooser ?? aChooserGivingTheFolder(theProjectsFolderName),
    chosen: staged.chosen ?? (() => Promise.resolve()),
  });
  root('main').append(mounted.element);
};
