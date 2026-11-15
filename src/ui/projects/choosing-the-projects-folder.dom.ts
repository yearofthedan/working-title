interface ChoosingHooks {
  readonly choose: () => void;
}

export interface ChoosingTheProjectsFolder {
  readonly element: HTMLElement;
  refuse(because: string): void;
}

const paragraph = (text: string): HTMLParagraphElement => {
  const said = document.createElement('p');
  said.textContent = text;
  return said;
};

export const choosingTheProjectsFolder = (hooks: ChoosingHooks): ChoosingTheProjectsFolder => {
  const element = document.createElement('section');
  element.className = 'choosing-the-projects-folder';
  const heading = document.createElement('h2');
  heading.id = 'choosing-the-projects-folder-heading';
  heading.textContent = 'Choose where to keep your projects';
  element.setAttribute('aria-labelledby', heading.id);
  const choose = document.createElement('button');
  choose.type = 'button';
  choose.textContent = 'Choose a folder…';
  choose.addEventListener('click', () => hooks.choose());
  const refusal = document.createElement('p');
  refusal.setAttribute('role', 'alert');
  element.append(
    heading,
    paragraph(
      'working-title is for planning a story and writing it, one piece at a time. Each story is a project.',
    ),
    paragraph(
      'Your projects are kept in a folder on your computer. Choose or make a folder for them, such as Documents › Writing. If you’ve used working-title before, choose the folder you used then.',
    ),
    choose,
    paragraph('Chrome will ask you to let working-title edit files in that folder.'),
    refusal,
  );
  return {
    element,
    refuse: (because) => {
      refusal.textContent = because;
    },
  };
};
