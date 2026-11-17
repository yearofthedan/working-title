import type { ProjectsFolder } from '../../../application/project';
import { strings } from '../../strings/strings';

export const thePauseBeforeReading = 250;

export interface StartAProjectHooks {
  readonly folder: ProjectsFolder;
  readonly start: (title: string) => Promise<void>;
  readonly cancelled: () => void;
}

export interface StartAProject {
  readonly element: HTMLElement;
  focus(): void;
}

export const renderStartAProject = (hooks: StartAProjectHooks): StartAProject => {
  const { willMakeAFolder, madeAFolder } = strings.startAProject;
  const form = document.createElement('form');
  const label = document.createElement('label');
  label.htmlFor = 'start-a-project-title';
  label.textContent = strings.startAProject.title;
  const title = document.createElement('input');
  title.id = 'start-a-project-title';
  title.type = 'text';
  title.placeholder = strings.project.untitledTitle;
  title.autocomplete = 'off';
  const said = document.createElement('p');
  const named = document.createElement('b');
  said.append(willMakeAFolder.before, named, willMakeAFolder.after(hooks.folder.name));
  const start = document.createElement('button');
  start.type = 'submit';
  start.textContent = strings.startAProject.start;
  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.textContent = strings.startAProject.cancel;
  const actions = document.createElement('div');
  actions.className = 'actions';
  actions.append(start, cancel);
  const failed = document.createElement('p');
  failed.setAttribute('role', 'alert');
  form.append(label, title, said, actions, failed);

  let starting = false;
  let made: string | undefined;
  let scheduled: NodeJS.Timeout | undefined;
  let reading: Promise<void> | undefined;

  const showTheName = (name: string | undefined): void => {
    said.hidden = name === undefined;
    if (name !== undefined) named.textContent = name;
  };

  const readTheName = (): Promise<void> => {
    const typed = title.value;
    const read = (reading ?? Promise.resolve()).then(async () => {
      if (title.value !== typed) return;
      const name = await hooks.folder.freeNameFor(typed).catch(() => undefined);
      if (made === undefined && title.value === typed) showTheName(name);
    });
    reading = read;
    void read.then(() => {
      if (reading === read) reading = undefined;
    });
    return read;
  };

  const readAtOnce = (): Promise<void> => {
    if (scheduled === undefined) return reading ?? Promise.resolve();
    clearTimeout(scheduled);
    scheduled = undefined;
    return readTheName();
  };

  void readTheName();

  title.addEventListener('input', () => {
    clearTimeout(scheduled);
    scheduled = setTimeout(() => {
      scheduled = undefined;
      void readTheName();
    }, thePauseBeforeReading);
  });

  const startTheProject = async (): Promise<void> => {
    starting = true;
    failed.replaceChildren();
    const typed = made ?? title.value.trim();
    try {
      if (made === undefined) {
        title.readOnly = true;
        await readAtOnce();
        const name = await hooks.folder.start(typed);
        made = typed;
        title.value = made;
        said.replaceChildren(madeAFolder.before, named, madeAFolder.after(hooks.folder.name));
        showTheName(name);
      }
      try {
        await hooks.start(typed);
      } catch {
        failed.textContent = strings.startAProject.couldNotOpenTheProject;
      }
    } catch {
      failed.textContent = strings.startAProject.couldNotMakeTheFolder;
      title.readOnly = false;
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
