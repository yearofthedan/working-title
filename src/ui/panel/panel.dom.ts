import type { FacetView, OpenProject, PieceView } from '../../application/project';
import { fieldsFor } from './panel';

interface PanelHooks {
  readonly elaborate: OpenProject['elaborate'];
  readonly close: () => void;
}

export interface Panel {
  readonly element: HTMLElement;
  open(piece: PieceView): void;
  close(): void;
  show(facetId: string, text: string): void;
  isOpenOn(pieceId: string): boolean;
}

export const thePanel = (hooks: PanelHooks): Panel => {
  const element = document.createElement('aside');
  let openOn: string | undefined;
  let fields = new Map<string, HTMLTextAreaElement>();

  element.addEventListener('keydown', (event) => {
    event.stopPropagation();
    if (event.key === 'Escape') hooks.close();
  });

  const field = (pieceId: string, { id, label, text }: FacetView): HTMLElement => {
    const wrapper = document.createElement('div');
    wrapper.className = 'facet';
    const fieldId = `panel-${pieceId}-${id}`;
    const name = document.createElement('label');
    name.htmlFor = fieldId;
    name.textContent = label;
    const input = document.createElement('textarea');
    input.id = fieldId;
    input.value = text;
    input.addEventListener('input', () => void hooks.elaborate(pieceId, id, input.value));
    fields.set(id, input);
    wrapper.append(name, input);
    return wrapper;
  };

  return {
    element,

    open: (piece) => {
      openOn = piece.id;
      fields = new Map();
      const name = document.createElement('h2');
      name.id = 'panel-name';
      name.textContent = piece.name;
      element.setAttribute('aria-labelledby', name.id);
      const close = document.createElement('button');
      close.type = 'button';
      close.textContent = 'Close';
      close.addEventListener('click', () => hooks.close());
      const heading = document.createElement('div');
      heading.className = 'heading';
      heading.append(name, close);
      const shown = fieldsFor(piece);
      const wrappers = shown.map((facet) => field(piece.id, facet));
      wrappers.at(-1)?.classList.add('fills');
      element.replaceChildren(heading, ...wrappers);
      element.classList.add('open');
      const opens = shown.find(({ text }) => text === '') ?? shown.at(-1);
      if (opens !== undefined) fields.get(opens.id)?.focus();
    },

    close: () => {
      openOn = undefined;
      element.classList.remove('open');
    },

    show: (facetId, text) => {
      const input = fields.get(facetId);
      if (input !== undefined) input.value = text;
    },

    isOpenOn: (pieceId) => openOn === pieceId,
  };
};
