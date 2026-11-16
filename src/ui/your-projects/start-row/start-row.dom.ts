import { untitledProjectTitle, type ProjectsFolder } from '../../../application/project';
import { couldNotMakeTheFolder, couldNotOpenTheProject } from './start-row';

export interface StartRowHooks {
  readonly folder: ProjectsFolder;
  readonly start: (title: string) => Promise<void>;
  readonly cancelled: () => void;
}

export interface StartRow {
  readonly element: HTMLElement;
  focus(): void;
}

export const startRow = (hooks: StartRowHooks): StartRow => {
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
  said.append('working-title will make a folder named ', named, ` in ${hooks.folder.name}.`);
  const start = document.createElement('button');
  start.type = 'submit';
  start.textContent = 'Start project';
  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.textContent = 'Cancel';
  const actions = document.createElement('div');
  actions.className = 'actions';
  actions.append(start, cancel);
  const failed = document.createElement('p');
  failed.setAttribute('role', 'alert');
  form.append(label, title, said, actions, failed);

  let starting = false;
  let made: string | undefined;

  const showTheName = (name: string | undefined): void => {
    said.hidden = name === undefined;
    if (name !== undefined) named.textContent = name;
  };

  const nameFor = async (typed: string): Promise<void> => {
    const name = await hooks.folder.freeNameFor(typed).catch(() => undefined);
    if (title.value !== typed) return;
    showTheName(name);
  };
  void nameFor('');
  title.addEventListener('input', () => void nameFor(title.value));

  const startTheProject = async (): Promise<void> => {
    starting = true;
    failed.replaceChildren();
    const typed = made ?? title.value.trim();
    try {
      if (made === undefined) {
        const theNameItWillBeGiven = await hooks.folder.freeNameFor(typed).catch(() => undefined);
        await hooks.folder.start(typed);
        made = typed;
        title.readOnly = true;
        title.value = made;
        said.replaceChildren(
          'working-title made a folder named ',
          named,
          ` in ${hooks.folder.name}.`,
        );
        showTheName(theNameItWillBeGiven);
      }
    } catch {
      failed.textContent = couldNotMakeTheFolder;
      starting = false;
      return;
    }
    try {
      await hooks.start(typed);
    } catch {
      failed.textContent = couldNotOpenTheProject;
    } finally {
      starting = false;
    }
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (starting) return;
    void startTheProject();
  });
  cancel.addEventListener('click', () => hooks.cancelled());

  return { element: form, focus: () => title.focus() };
};
