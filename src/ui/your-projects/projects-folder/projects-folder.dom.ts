import type { ProjectsFolder, ProjectsFolderChooser } from '../../../application/project';
import { errorIcon } from '../../icons/error.dom';
import { couldNotOpenTheFolder, noFolderPicker, refusalFor } from './projects-folder';

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
  name.textContent = 'Choose where to keep your projects';
  element.setAttribute('aria-labelledby', name.id);
  const choose = document.createElement('button');
  choose.type = 'button';
  choose.textContent = 'Choose a folder…';
  const refusal = paragraph('');
  refusal.setAttribute('role', 'alert');

  const chooseTheFolder = async (): Promise<void> => {
    if (!hooks.chooser.canChoose) {
      refusal.replaceChildren(errorIcon(), document.createTextNode(noFolderPicker));
      return;
    }
    let chosen: ProjectsFolder | undefined;
    try {
      chosen = await hooks.chooser.choose();
    } catch {
      refusal.replaceChildren(errorIcon(), document.createTextNode(couldNotOpenTheFolder));
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
    paragraph(
      'working-title is for planning a story and writing it, one piece at a time. Each story is a project.',
    ),
    paragraph(
      'Your projects are kept in a folder on your computer. Choose or make a folder for them, such as Documents › Writing. If you’ve used working-title before, choose the folder you used then.',
    ),
    choose,
    refusal,
    paragraph('Chrome will ask you to let working-title edit files in that folder.'),
  );

  return { element };
};
