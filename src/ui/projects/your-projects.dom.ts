import { untitledProjectTitle } from '../../application/project';

export interface YourProjectsHooks {
  readonly freeNameFor: (title: string) => Promise<string>;
  readonly start: (title: string) => Promise<void>;
}

export interface YourProjects {
  readonly element: HTMLElement;
}

export const yourProjects = (folderName: string, hooks: YourProjectsHooks): YourProjects => {
  const element = document.createElement('section');
  element.className = 'your-projects';
  const heading = document.createElement('h2');
  heading.id = 'your-projects-heading';
  heading.textContent = `In ${folderName}`;
  element.setAttribute('aria-labelledby', heading.id);
  const none = document.createElement('p');
  none.textContent = 'No projects yet.';
  const list = document.createElement('ul');
  const row = document.createElement('li');
  list.append(row);
  element.append(heading, none, list);

  let starting = false;

  const theStartButton = (): HTMLButtonElement => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Start a project';
    button.addEventListener('click', () => openTheRow());
    return button;
  };

  const backToTheButton = (): void => {
    none.hidden = false;
    row.replaceChildren(theStartButton());
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
    said.append('working-title will make a folder named ', named, ` in ${folderName}.`);
    const start = document.createElement('button');
    start.type = 'submit';
    start.textContent = 'Start';
    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.textContent = 'Cancel';
    const actions = document.createElement('div');
    actions.className = 'actions';
    actions.append(start, cancel);
    form.append(label, title, said, actions);

    const nameFor = async (typed: string): Promise<void> => {
      const name = await hooks.freeNameFor(typed);
      if (title.value === typed) named.textContent = name;
    };
    void nameFor('');
    title.addEventListener('input', () => void nameFor(title.value));

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (starting) return;
      starting = true;
      void hooks.start(title.value.trim());
    });
    cancel.addEventListener('click', () => backToTheButton());

    none.hidden = true;
    row.replaceChildren(form);
    title.focus();
  };

  backToTheButton();
  return { element };
};
