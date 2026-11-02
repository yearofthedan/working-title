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

export const thePanel = (element: HTMLElement, hooks: PanelHooks): Panel => {
  let openOn: string | undefined;
  let fields = new Map<string, HTMLTextAreaElement>();

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

  element.inert = true;

  return {
    element,

    open: (piece) => {
      openOn = piece.id;
      fields = new Map();
      const name = document.createElement('h2');
      name.textContent = piece.name;
      element.setAttribute('aria-label', piece.name);
      const close = document.createElement('button');
      close.type = 'button';
      close.textContent = 'Close';
      close.addEventListener('click', () => hooks.close());
      element.replaceChildren(
        name,
        ...fieldsFor(piece).map((facet) => field(piece.id, facet)),
        close,
      );
      element.classList.add('open');
      element.inert = false;
      const opens = piece.longFacets[0] ?? piece.facets[0];
      if (opens !== undefined) fields.get(opens.id)?.focus();
    },

    close: () => {
      openOn = undefined;
      element.classList.remove('open');
      element.inert = true;
    },

    show: (facetId, text) => {
      const input = fields.get(facetId);
      if (input !== undefined && input.value !== text) input.value = text;
    },

    isOpenOn: (pieceId) => openOn === pieceId,
  };
};
