import { svgIn } from '../svg.dom';

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
    refusal,
    paragraph('Chrome will ask you to let working-title edit files in that folder.'),
  );
  return {
    element,
    refuse: (because) => {
      refusal.replaceChildren(errorIcon(), document.createTextNode(because));
    },
  };
};
