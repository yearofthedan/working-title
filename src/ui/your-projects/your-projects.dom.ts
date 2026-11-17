import type { ProjectsFolder, ProjectsFolderChooser } from '../../application/project';
import { renderProjectsFolder } from './projects-folder/projects-folder.dom';
import { renderProjectList } from './project-list/project-list.dom';

export interface YourProjectsHooks {
  readonly chooser: ProjectsFolderChooser;
  readonly showingYourProjects: (draw: () => void) => Promise<void>;
  readonly start: (title: string) => Promise<void>;
}

export interface YourProjects {
  readonly element: HTMLElement;
}

export const renderYourProjects = (hooks: YourProjectsHooks): YourProjects => {
  const element = document.createElement('div');
  element.className = 'your-projects';

  const showTheList = (folder: ProjectsFolder): void => {
    element.replaceChildren(renderProjectList({ folder, start: hooks.start }).element);
  };

  element.replaceChildren(
    renderProjectsFolder({
      chooser: hooks.chooser,
      chosen: (folder) => hooks.showingYourProjects(() => showTheList(folder)),
    }).element,
  );

  return { element };
};
