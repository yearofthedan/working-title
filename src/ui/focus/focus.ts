import type { FacetView, Focus, PieceView } from '../../application/project';

const FOCUS_WIDTH = 560;
const CARD_WIDTH = [200, 180, 120];
const GAP = 32;
const ROW_GAP = 32;

const arrowKeys: Readonly<Record<string, 'up' | 'down' | 'left' | 'right'>> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
};

interface Entry {
  readonly piece: PieceView;
  readonly level: number;
  readonly parentId?: string;
}

interface State {
  readonly wrapper: HTMLElement;
  focus: Focus;
  at: string;
  readonly lastVisited: Map<string, string>;
  readonly cards: Map<string, HTMLElement>;
}

let state: State | undefined;
let listening = false;

const walked = (piece: PieceView, level = 0, parentId?: string): Entry[] => [
  { piece, level, ...(parentId === undefined ? {} : { parentId }) },
  ...piece.children.flatMap((child) => walked(child, level + 1, piece.id)),
];

const entriesOf = (st: State): readonly Entry[] => {
  const [story] = st.focus.pieces;
  return story === undefined ? [] : walked(story);
};

const entryOf = (st: State, id: string): Entry | undefined =>
  entriesOf(st).find((entry) => entry.piece.id === id);

const childrenOf = (st: State, id: string): readonly Entry[] =>
  entriesOf(st).filter((entry) => entry.parentId === id);

const kindOf = (st: State, id: string): string => {
  const parent = entryOf(st, st.at)?.parentId;
  if (id === st.at) return 'focus';
  if (id === parent || entryOf(st, id)?.parentId === st.at) return 'card';
  if (parent !== undefined && entryOf(st, id)?.parentId === parent) return 'chip';
  return 'hidden';
};

const shownAncestor = (st: State, id: string): Entry => {
  let entry = entryOf(st, id)!;
  while (kindOf(st, entry.piece.id) === 'hidden' && entry.parentId !== undefined) {
    entry = entryOf(st, entry.parentId)!;
  }
  return entry;
};

const widthOf = (st: State, id: string): number =>
  kindOf(st, id) === 'focus'
    ? FOCUS_WIDTH
    : (CARD_WIDTH[shownAncestor(st, id).level] ?? CARD_WIDTH.at(-1)!);

const goTo = (st: State, id: string, into?: HTMLElement): void => {
  if (id !== st.at) {
    const parent = entryOf(st, id)?.parentId;
    if (parent !== undefined) st.lastVisited.set(parent, id);
    st.at = id;
    place(st);
    pathNav(st);
  }
  (into ?? st.cards.get(id))?.focus({ preventScroll: true });
};

const move = (st: State, where: 'up' | 'down' | 'left' | 'right'): void => {
  const parent = entryOf(st, st.at)?.parentId;
  if (where === 'up') {
    if (parent !== undefined) goTo(st, parent);
    return;
  }
  if (where === 'down') {
    const children = childrenOf(st, st.at);
    const last = st.lastVisited.get(st.at);
    const child = children.find((entry) => entry.piece.id === last) ?? children.at(0);
    if (child !== undefined) goTo(st, child.piece.id);
    return;
  }
  if (parent === undefined) return;
  const siblings = childrenOf(st, parent);
  const here = siblings.findIndex((entry) => entry.piece.id === st.at);
  const next = siblings[here + (where === 'left' ? -1 : 1)];
  if (next !== undefined) goTo(st, next.piece.id);
};

const nameButton = (piece: PieceView): HTMLElement => {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = piece.name;
  return button;
};

const setHeading = (st: State, piece: PieceView): void => {
  const focused = piece.id === st.at;
  const tag = focused ? 'h2' : 'h3';
  const card = st.cards.get(piece.id)!;
  const found = card.querySelector('h2, h3');
  const heading =
    found !== null && found.tagName.toLowerCase() === tag ? found : document.createElement(tag);
  if (heading !== found) found?.replaceWith(heading);
  if (
    (heading.querySelector('button') === null) === focused &&
    heading.textContent === piece.name
  ) {
    return;
  }
  heading.replaceChildren(
    ...(focused ? [document.createTextNode(piece.name)] : [nameButton(piece)]),
  );
};

const field = (
  pieceId: string,
  { id, label, text }: FacetView,
  elaborate: Focus['elaborate'],
): HTMLElement => {
  const wrapper = document.createElement('div');
  wrapper.className = 'facet';
  const fieldId = `facet-${pieceId}-${id}`;
  const name = document.createElement('label');
  name.htmlFor = fieldId;
  name.textContent = label;
  const input = document.createElement('textarea');
  input.id = fieldId;
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

const pieceCard = (st: State, piece: PieceView): HTMLElement => {
  const card = document.createElement('fieldset');
  card.tabIndex = -1;
  const name = document.createElement('legend');
  const heading = document.createElement('h3');
  heading.textContent = piece.name;
  name.append(heading);
  card.append(name, ...piece.facets.map((facet) => field(piece.id, facet, st.focus.elaborate)));

  if (piece.childKind !== undefined) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = `Add a ${piece.childKind.toLowerCase()}`;
    button.addEventListener('mousedown', (event) => event.preventDefault());
    button.addEventListener('click', () => void addUnder(st, piece.id));
    card.append(button);
  }

  card.addEventListener('click', (event) => {
    const into = event.target instanceof HTMLTextAreaElement ? event.target : undefined;
    if (piece.id === st.at && into === undefined) return;
    goTo(st, piece.id, into);
  });

  return card;
};

const pathNav = (st: State): void => {
  const header = document.querySelector('header');
  if (header === null) return;
  let nav = header.querySelector('nav');
  if (nav === null) {
    nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'Where you are');
    header.append(nav);
  }

  const path: Entry[] = [];
  let entry = entryOf(st, st.at);
  while (entry !== undefined) {
    path.unshift(entry);
    entry = entry.parentId === undefined ? undefined : entryOf(st, entry.parentId);
  }

  const list = document.createElement('ol');
  for (const step of path) {
    const item = document.createElement('li');
    if (step.piece.id === st.at) {
      item.setAttribute('aria-current', 'location');
      item.textContent = step.piece.name;
    } else {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = step.piece.name;
      button.addEventListener('click', () => goTo(st, step.piece.id));
      item.append(button);
    }
    list.append(item);
  }
  nav.replaceChildren(list);
};

const place = (st: State): void => {
  const pieces = entriesOf(st);

  for (const { piece } of pieces) {
    const card = st.cards.get(piece.id);
    if (card === undefined) continue;
    card.className = kindOf(st, piece.id);
    card.style.width = `${widthOf(st, piece.id)}px`;
  }

  for (const { piece } of pieces) setHeading(st, piece);

  const centre = st.wrapper.clientWidth / 2;
  const parentId = entryOf(st, st.at)?.parentId;
  const focus = st.cards.get(st.at)!;

  let top = 0;
  if (parentId !== undefined) {
    const parent = st.cards.get(parentId)!;
    parent.style.left = `${centre - widthOf(st, parentId) / 2}px`;
    parent.style.top = '0px';
    top = parent.offsetHeight + ROW_GAP;
  }

  focus.style.left = `${centre - FOCUS_WIDTH / 2}px`;
  focus.style.top = `${top}px`;
  const focusHeight = focus.offsetHeight;
  const below = top + focusHeight + ROW_GAP;

  const children = childrenOf(st, st.at);
  const row =
    children.reduce((total, entry) => total + widthOf(st, entry.piece.id), 0) +
    GAP * (children.length - 1);
  let left = centre - row / 2;
  for (const child of children) {
    const card = st.cards.get(child.piece.id)!;
    card.style.left = `${left}px`;
    card.style.top = `${below}px`;
    left += widthOf(st, child.piece.id) + GAP;
  }

  const siblings = parentId === undefined ? [] : childrenOf(st, parentId);
  const here = siblings.findIndex((entry) => entry.piece.id === st.at);
  const sample = siblings.find((entry) => entry.piece.id !== st.at);
  if (sample !== undefined) {
    const chip = st.cards.get(sample.piece.id)!;
    const chipTop = top + (focusHeight - chip.offsetHeight) / 2;
    let before = centre - FOCUS_WIDTH / 2 - GAP;
    for (const entry of siblings.slice(0, here).reverse()) {
      const card = st.cards.get(entry.piece.id)!;
      before -= widthOf(st, entry.piece.id);
      card.style.left = `${before}px`;
      card.style.top = `${chipTop}px`;
      before -= GAP;
    }
    let after = centre + FOCUS_WIDTH / 2 + GAP;
    for (const entry of siblings.slice(here + 1)) {
      const card = st.cards.get(entry.piece.id)!;
      card.style.left = `${after}px`;
      card.style.top = `${chipTop}px`;
      after += widthOf(st, entry.piece.id) + GAP;
    }
  }

  for (const { piece } of pieces) {
    if (kindOf(st, piece.id) !== 'hidden') continue;
    const ancestor = shownAncestor(st, piece.id);
    if (ancestor.piece.id === piece.id) continue;
    const under = st.cards.get(ancestor.piece.id)!;
    const card = st.cards.get(piece.id)!;
    card.style.left = under.style.left;
    card.style.top = under.style.top;
    card.style.width = under.style.width;
  }
};

const draw = (st: State): void => {
  st.cards.clear();
  st.wrapper.replaceChildren(
    ...entriesOf(st).map(({ piece }) => {
      const card = pieceCard(st, piece);
      st.cards.set(piece.id, card);
      return card;
    }),
  );
  place(st);
  pathNav(st);
};

const addUnder = async (st: State, pieceId: string): Promise<void> => {
  const { focus: next, added } = await st.focus.branch(pieceId);
  st.focus = next;
  draw(st);
  st.cards.get(added)?.querySelector('textarea')?.focus({ preventScroll: true });
};

const onKeyDown = (event: KeyboardEvent): void => {
  const st = state;
  if (st === undefined) return;
  const target = event.target;

  if (target instanceof HTMLTextAreaElement) {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    st.cards.get(st.at)?.focus({ preventScroll: true });
    return;
  }
  if (target instanceof HTMLElement && target.closest('button') !== null) return;

  const where = arrowKeys[event.key];
  if (where !== undefined) {
    event.preventDefault();
    move(st, where);
    return;
  }
  if (event.key === 'Enter' && target === st.cards.get(st.at)) {
    event.preventDefault();
    st.cards.get(st.at)?.querySelector('textarea')?.focus({ preventScroll: true });
  }
};

export const renderFocus = (main: HTMLElement, focus: Focus): void => {
  const [story] = focus.pieces;
  if (story === undefined) return;
  const wrapper = document.createElement('div');
  wrapper.className = 'graph';
  main.replaceChildren(wrapper);
  if (!listening) {
    listening = true;
    document.addEventListener('keydown', onKeyDown);
  }
  state = { wrapper, focus, at: story.id, lastVisited: new Map(), cards: new Map() };
  draw(state);
};
