import type { ProjectsFolderChooser } from '../../application/project';
import { aChooserGivingTheFolder } from '../../test-helpers/folders/folders';
import { root } from '../test-helpers/staging';
import { renderYourProjects } from './your-projects.dom';
import { theProjectsFolderName } from '../test-helpers/folders';

export interface Staged {
  readonly chooser?: ProjectsFolderChooser;
  readonly showingYourProjects?: (draw: () => void) => Promise<void>;
  readonly start?: (title: string) => Promise<void>;
}

const theAppShowsTheScreenRightAway = (draw: () => void): Promise<void> => {
  draw();
  return Promise.resolve();
};

export const mountYourProjects = (staged: Staged = {}): void => {
  const mounted = renderYourProjects({
    chooser: staged.chooser ?? aChooserGivingTheFolder(theProjectsFolderName),
    showingYourProjects: staged.showingYourProjects ?? theAppShowsTheScreenRightAway,
    start: staged.start ?? (() => Promise.resolve()),
  });
  root('main').append(mounted.element);
};
