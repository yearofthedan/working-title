import {
  untitledProjectTitle,
  type ProjectsFolder,
  type ProjectsFolderChooser,
} from '../../application/project';
import { svgIn } from '../svg.dom';
import { couldNotMakeTheFolder, couldNotOpenTheFolder, refusalFor } from './your-projects';

export interface YourProjectsHooks {
  readonly chooser: ProjectsFolderChooser;
  readonly showingYourProjects: (draw: () => void) => Promise<void>;
  readonly start: (title: string) => Promise<void>;
}

export interface YourProjects {
  readonly element: HTMLElement;
}

const paragraph = (text: string): HTMLParagraphElement => {
  const said = document.createElement('p');
  said.textContent = text;
  return said;
};

const errorIcon = (): SVGElement => {
  const icon = svgIn('svg', {
    viewBox: '0 0 16 16',
    'aria-hidden': 'true',
    focusable: 'false',
  });
  icon.append(
    svgIn('circle', {
      cx: '8',
      cy: '8',
      r: '6.25',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '1.5',
    }),
    svgIn('line', {
      x1: '8',
      y1: '4.5',
      x2: '8',
      y2: '8.5',
      stroke: 'currentColor',
      'stroke-width': '1.5',
      'stroke-linecap': 'round',
    }),
    svgIn('circle', { cx: '8', cy: '11.25', r: '1.1', fill: 'currentColor' }),
  );
  return icon;
};

const heading = (text: string): HTMLHeadingElement => {
  const element = document.createElement('h2');
  element.id = 'your-projects-heading';
  element.textContent = text;
  return element;
};

export const yourProjects = (hooks: YourProjectsHooks): YourProjects => {
  const element = document.createElement('section');

  const drawTheFirstScreen = (): void => {
    element.className = 'your-projects';
    const name = heading('Choose where to keep your projects');
    element.setAttribute('aria-labelledby', name.id);
    const choose = document.createElement('button');
    choose.type = 'button';
    choose.textContent = 'Choose a folder…';
    const refusal = paragraph('');
    refusal.setAttribute('role', 'alert');
    choose.addEventListener('click', () => void chooseTheFolder(refusal));
    element.replaceChildren(
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
  };

  const drawTheList = (folder: ProjectsFolder): void => {
    element.className = 'your-projects listed';
    const name = heading(`In ${folder.name}`);
    element.setAttribute('aria-labelledby', name.id);
    const none = paragraph('No projects yet.');
    const row = document.createElement('li');
    const list = document.createElement('ul');
    list.append(row);
    element.replaceChildren(name, none, list);

    let starting = false;

    const startAProject = document.createElement('button');
    startAProject.type = 'button';
    startAProject.textContent = 'Start a project';
    startAProject.addEventListener('click', () => openTheRow());

    const backToTheButton = (): void => {
      none.hidden = false;
      row.replaceChildren(startAProject);
    };

    const openTheRow = (): void => {
      const form = document.createElement('form');
      const label = document.createElement('label');
      label.htmlFor = 'start-a-project-title';
      label.textContent = 'Title';
      const title = document.createElement('input');
      title.id = 'start-a-project-title';
      title.type = 'text';
      title.placeholder = untitledProjectTitle;
      title.autocomplete = 'off';
      const said = document.createElement('p');
      const named = document.createElement('b');
      said.append('working-title will make a folder named ', named, ` in ${folder.name}.`);
      const start = document.createElement('button');
      start.type = 'submit';
      start.textContent = 'Start project';
      const cancel = document.createElement('button');
      cancel.type = 'button';
      cancel.textContent = 'Cancel';
      const actions = document.createElement('div');
      actions.className = 'actions';
      actions.append(start, cancel);
      const failed = paragraph('');
      failed.setAttribute('role', 'alert');
      form.append(label, title, said, actions, failed);

      const nameFor = async (typed: string): Promise<void> => {
        const name = await folder.freeNameFor(typed);
        if (title.value === typed) named.textContent = name;
      };
      void nameFor('');
      title.addEventListener('input', () => void nameFor(title.value));

      const startTheProject = async (): Promise<void> => {
        starting = true;
        failed.replaceChildren();
        try {
          await folder.start(title.value.trim());
          await hooks.start(title.value.trim());
        } catch {
          failed.textContent = couldNotMakeTheFolder;
        } finally {
          starting = false;
        }
      };

      form.addEventListener('submit', (event) => {
        event.preventDefault();
        if (starting) return;
        void startTheProject();
      });
      cancel.addEventListener('click', () => {
        backToTheButton();
        startAProject.focus();
      });

      none.hidden = true;
      row.replaceChildren(form);
      title.focus();
    };

    backToTheButton();
  };

  const chooseTheFolder = async (refusal: HTMLParagraphElement): Promise<void> => {
    let chosen: ProjectsFolder | undefined;
    try {
      chosen = await hooks.chooser.choose();
    } catch {
      refusal.replaceChildren(errorIcon(), document.createTextNode(couldNotOpenTheFolder));
      return;
    }
    if (chosen === undefined) return;
    const folder = chosen;
    const ownTitle = await folder.ownTitle();
    if (ownTitle !== undefined) {
      refusal.replaceChildren(errorIcon(), document.createTextNode(refusalFor(ownTitle)));
      return;
    }
    await hooks.showingYourProjects(() => drawTheList(folder));
  };

  drawTheFirstScreen();
  return { element };
};
