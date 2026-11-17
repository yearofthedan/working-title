import type { ProjectsFolder, ProjectsFolderChooser } from '../../application/project';
import { folderQuestion } from './folder-question/folder-question.dom';
import { projectList } from './project-list/project-list.dom';

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
    element.replaceChildren(projectList({ folder, start: hooks.start }).element);
  };

  element.replaceChildren(
    folderQuestion({
      chooser: hooks.chooser,
      chosen: (folder) => hooks.showingYourProjects(() => showTheList(folder)),
    }).element,
  );

  return { element };
};
