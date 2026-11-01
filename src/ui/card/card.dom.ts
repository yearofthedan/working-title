import type { FacetView, OpenProject, PieceView } from '../../application/project';

export interface CardHooks {
  readonly level: number;
  readonly current: () => boolean;
  readonly elaborate: OpenProject['elaborate'];
  readonly goTo: (into?: HTMLElement) => void;
  readonly addChild: () => void;
}

export const fieldsOf = (card: HTMLElement): readonly HTMLElement[] => [
  ...card.querySelectorAll<HTMLElement>('textarea, .facet button'),
];

export const nameButtonIn = (card: HTMLElement): HTMLElement | null =>
  card.querySelector<HTMLElement>('legend button');

export const nameButton = (piece: PieceView): HTMLElement => {
  const button = document.createElement('button');
  button.type = 'button';
  button.tabIndex = -1;
  button.textContent = piece.name;
  return button;
};

export const setHeading = (card: HTMLElement, piece: PieceView, current: boolean): void => {
  const heading = card.querySelector('h2, h3, h4')!;
  if (
    (heading.querySelector('button') === null) === current &&
    heading.textContent === piece.name
  ) {
    return;
  }
  heading.replaceChildren(
    ...(current ? [document.createTextNode(piece.name)] : [nameButton(piece)]),
  );
};

const field = (
  pieceId: string,
  { id, label, text }: FacetView,
  elaborate: OpenProject['elaborate'],
): HTMLElement => {
  const wrapper = document.createElement('div');
  wrapper.className = 'facet';
  const fieldId = `facet-${pieceId}-${id}`;
  const name = document.createElement('label');
  name.htmlFor = fieldId;
  name.textContent = label;
  const input = document.createElement('textarea');
  input.id = fieldId;
  input.tabIndex = -1;
  input.value = text;
  const shown = document.createElement('div');
  shown.className = 'shown';
  shown.setAttribute('aria-hidden', 'true');
  shown.textContent = text;
  input.addEventListener('input', () => {
    shown.textContent = input.value;
    void elaborate(pieceId, id, input.value);
  });
  wrapper.append(name, input, shown);
  return wrapper;
};

const keysOnTheCard = (
  card: HTMLElement,
  current: () => boolean,
): ((event: KeyboardEvent) => void) => {
  const onKeyDown = (event: KeyboardEvent): void => {
    const at = event.target;
    if (!(at instanceof HTMLElement) || !card.contains(at)) return;

    if (at === card) {
      if (event.key !== 'Enter' || !current()) return;
      event.preventDefault();
      card.querySelector('textarea')?.focus({ preventScroll: true });
      return;
    }

    if (event.key === 'Escape' && current()) {
      event.preventDefault();
      card.focus({ preventScroll: true });
      return;
    }

    if (event.key !== 'Tab' || !current()) return;
    const fields = fieldsOf(card);
    const [first] = fields;
    const last = fields.at(-1);
    if (at !== (event.shiftKey ? first : last)) return;
    event.preventDefault();
    (event.shiftKey ? last : first)?.focus({ preventScroll: true });
  };
  return onKeyDown;
};

export const pieceCard = (piece: PieceView, hooks: CardHooks): HTMLElement => {
  const card = document.createElement('fieldset');
  card.tabIndex = -1;
  card.dataset.piece = piece.id;
  const name = document.createElement('legend');
  const heading = document.createElement(`h${hooks.level + 2}`);
  heading.textContent = piece.name;
  name.append(heading);
  const facets = piece.facets.map((facet) => field(piece.id, facet, hooks.elaborate));
  card.append(name, ...facets);

  if (piece.childKind !== undefined) {
    const button = document.createElement('button');
    button.type = 'button';
    button.tabIndex = -1;
    button.textContent = `Add a ${piece.childKind.toLowerCase()}`;
    button.addEventListener('mousedown', (event) => event.preventDefault());
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      hooks.addChild();
    });
    (facets.at(-1) ?? card).append(button);
  }

  card.addEventListener('click', (event) => {
    hooks.goTo(event.target instanceof HTMLTextAreaElement ? event.target : undefined);
  });
  card.addEventListener('keydown', keysOnTheCard(card, hooks.current));

  return card;
};
