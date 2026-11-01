import type { FacetView, OpenProject, PieceView } from '../../application/project';
import { whileMeasuring } from '../transition';

interface CardHooks {
  readonly level: number;
  readonly current: () => boolean;
  readonly elaborate: OpenProject['elaborate'];
  readonly goTo: (into?: HTMLElement) => void;
  readonly addChild: () => void;
}

export interface Card {
  readonly element: HTMLElement;
  show(piece: PieceView, current: boolean): void;
  reachCard(on: boolean): void;
  reachFields(on: boolean): void;
  reachName(on: boolean): void;
  enter(): void;
  minWidth(): number;
  observe(watcher: ResizeObserver): void;
  placeAt(x: number, y: number): void;
  slideTo(x: number): void;
  setWidth(px: number): void;
  setHeight(px: number | undefined): void;
  size(): { w: number; h: number };
  startAt(other: Card): void;
  focus(): void;
  contains(node: Node | null): boolean;
  beforeMeasuring(hidden: boolean): void;
  afterMeasuring(): void;
}

const fieldsOf = (card: HTMLElement): readonly HTMLElement[] => [
  ...card.querySelectorAll<HTMLElement>('textarea, .facet button'),
];

const nameButtonIn = (card: HTMLElement): HTMLElement | null =>
  card.querySelector<HTMLElement>('legend button');

const nameButton = (piece: PieceView): HTMLElement => {
  const button = document.createElement('button');
  button.type = 'button';
  button.tabIndex = -1;
  button.textContent = piece.name;
  return button;
};

const setHeading = (card: HTMLElement, piece: PieceView, current: boolean): void => {
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

const keysOnTheCard = (card: Card, current: () => boolean): ((event: KeyboardEvent) => void) => {
  const onKeyDown = (event: KeyboardEvent): void => {
    const at = event.target;
    if (!(at instanceof HTMLElement) || !card.contains(at)) return;

    if (at === card.element) {
      if (event.key !== 'Enter' || !current()) return;
      event.preventDefault();
      card.enter();
      return;
    }

    if (event.key === 'Escape' && current()) {
      event.preventDefault();
      card.focus();
      return;
    }

    if (event.key !== 'Tab' || !current()) return;
    const fields = fieldsOf(card.element);
    const [first] = fields;
    const last = fields.at(-1);
    if (at !== (event.shiftKey ? first : last)) return;
    event.preventDefault();
    (event.shiftKey ? last : first)?.focus({ preventScroll: true });
  };
  return onKeyDown;
};

export const pieceCard = (piece: PieceView, hooks: CardHooks): Card => {
  const element = document.createElement('fieldset');
  element.tabIndex = -1;
  element.dataset.piece = piece.id;
  const legend = document.createElement('legend');
  const heading = document.createElement(`h${hooks.level + 2}`);
  heading.textContent = piece.name;
  legend.append(heading);
  const facets = piece.facets.map((facet) => field(piece.id, facet, hooks.elaborate));
  element.append(legend, ...facets);

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
    (facets.at(-1) ?? element).append(button);
  }

  element.addEventListener('click', (event) => {
    hooks.goTo(event.target instanceof HTMLTextAreaElement ? event.target : undefined);
  });

  const card: Card = {
    element,
    show: (shown, current) => setHeading(element, shown, current),
    reachCard: (on) => {
      element.tabIndex = on ? 0 : -1;
    },
    reachFields: (on) => {
      for (const one of fieldsOf(element)) one.tabIndex = on ? 0 : -1;
    },
    reachName: (on) => {
      const button = nameButtonIn(element);
      if (button !== null) button.tabIndex = on ? 0 : -1;
    },
    enter: () => element.querySelector('textarea')?.focus({ preventScroll: true }),
    minWidth: () => {
      const style = getComputedStyle(legend);
      return (
        heading.scrollWidth +
        parseFloat(style.paddingLeft) +
        parseFloat(style.paddingRight) +
        parseFloat(style.borderLeftWidth) +
        parseFloat(style.borderRightWidth)
      );
    },
    observe: (watcher) => {
      watcher.observe(element);
      for (const facet of element.querySelectorAll('.facet')) watcher.observe(facet);
    },
    placeAt: (x, y) => {
      element.style.left = `${x}px`;
      element.style.top = `${y}px`;
    },
    slideTo: (x) => {
      element.style.left = `${x}px`;
    },
    setWidth: (px) => {
      element.style.width = `${px}px`;
    },
    setHeight: (px) => {
      element.style.height = px === undefined ? '' : `${px}px`;
    },
    size: () => ({ w: element.offsetWidth, h: element.offsetHeight }),
    startAt: (other) => {
      element.style.left = other.element.style.left;
      element.style.top = other.element.style.top;
      element.style.width = other.element.style.width;
    },
    focus: () => element.focus({ preventScroll: true }),
    contains: (node) => element.contains(node),
    beforeMeasuring: (hidden) => {
      element.style.transitionProperty = whileMeasuring(
        getComputedStyle(element).transitionProperty,
        hidden,
      );
      element.style.height = '';
    },
    afterMeasuring: () => {
      element.style.transitionProperty = '';
    },
  };
  element.addEventListener('keydown', keysOnTheCard(card, hooks.current));
  return card;
};
