import type { ProjectsFolder } from '../../../application/project';
import { renderStartAProject } from '../start-a-project/start-a-project.dom';

export interface ProjectListHooks {
  readonly folder: ProjectsFolder;
  readonly start: (title: string) => Promise<void>;
}

export interface ProjectList {
  readonly element: HTMLElement;
}

export const renderProjectList = (hooks: ProjectListHooks): ProjectList => {
  const element = document.createElement('section');
  element.className = 'project-list';
  const name = document.createElement('h2');
  name.id = 'project-list-heading';
  name.textContent = `In ${hooks.folder.name}`;
  element.setAttribute('aria-labelledby', name.id);
  const none = document.createElement('p');
  none.textContent = 'No projects yet.';
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Start a project';
  const row = document.createElement('li');
  const list = document.createElement('ul');
  list.append(row);
  element.append(name, none, list);

  const backToTheButton = (): void => {
    none.hidden = false;
    row.replaceChildren(button);
  };

  const openTheRow = (): void => {
    const started = renderStartAProject({
      folder: hooks.folder,
      start: hooks.start,
      cancelled: () => {
        backToTheButton();
        button.focus();
      },
    });
    none.hidden = true;
    row.replaceChildren(started.element);
    started.focus();
  };

  button.addEventListener('click', () => openTheRow());
  backToTheButton();

  return { element };
};
