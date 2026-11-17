import type { ProjectsFolder, ProjectsFolderChooser } from '../../../application/project';
import { errorIcon } from '../../icons/error.dom';
import { strings } from '../../strings';
import { refusalFor } from './projects-folder';

export interface ProjectsFolderHooks {
  readonly chooser: ProjectsFolderChooser;
  readonly chosen: (folder: ProjectsFolder) => Promise<void>;
}

export interface ProjectsFolderQuestion {
  readonly element: HTMLElement;
}

const paragraph = (text: string): HTMLParagraphElement => {
  const said = document.createElement('p');
  said.textContent = text;
  return said;
};

export const renderProjectsFolder = (hooks: ProjectsFolderHooks): ProjectsFolderQuestion => {
  const element = document.createElement('section');
  element.className = 'projects-folder';
  const name = document.createElement('h2');
  name.id = 'projects-folder-heading';
  name.textContent = strings.projectsFolder.heading;
  element.setAttribute('aria-labelledby', name.id);
  const choose = document.createElement('button');
  choose.type = 'button';
  choose.textContent = strings.projectsFolder.chooseAFolder;
  const refusal = paragraph('');
  refusal.setAttribute('role', 'alert');

  const chooseTheFolder = async (): Promise<void> => {
    if (!hooks.chooser.canChoose) {
      refusal.replaceChildren(
        errorIcon(),
        document.createTextNode(strings.projectsFolder.noFolderPicker),
      );
      return;
    }
    let chosen: ProjectsFolder | undefined;
    try {
      chosen = await hooks.chooser.choose();
    } catch {
      refusal.replaceChildren(
        errorIcon(),
        document.createTextNode(strings.projectsFolder.couldNotOpenTheFolder),
      );
      return;
    }
    if (chosen === undefined) return;
    const ownTitle = await chosen.ownTitle();
    if (ownTitle !== undefined) {
      refusal.replaceChildren(errorIcon(), document.createTextNode(refusalFor(ownTitle)));
      return;
    }
    await hooks.chosen(chosen);
  };

  choose.addEventListener('click', () => void chooseTheFolder());
  element.append(
    name,
    paragraph(strings.projectsFolder.whatWorkingTitleIs),
    paragraph(strings.projectsFolder.whereProjectsAreKept),
    choose,
    refusal,
    paragraph(strings.projectsFolder.chromeWillAsk),
  );

  return { element };
};
