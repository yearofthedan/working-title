import type { ProjectsFolderChooser } from '../../application/project';
import { aChooserGivingTheFolder, theProjectsFolderName } from '../../test-helpers/folders';
import { root } from '../../test-helpers/staging';
import { yourProjects } from './your-projects.dom';

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
  const mounted = yourProjects({
    chooser: staged.chooser ?? aChooserGivingTheFolder(theProjectsFolderName),
    showingYourProjects: staged.showingYourProjects ?? theAppShowsTheScreenRightAway,
    start: staged.start ?? (() => Promise.resolve()),
  });
  root('main').append(mounted.element);
};
