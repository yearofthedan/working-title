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
  readonly main: HTMLElement;
  readonly wrapper: HTMLElement;
  focus: Focus;
  at: string;
  readonly lastVisited: Map<string, string>;
  readonly cards: Map<string, HTMLElement>;
  entries: readonly Entry[];
  byId: Map<string, Entry>;
}

let state: State | undefined;
let listening = false;
let watcher: ResizeObserver | undefined;
let watching: HTMLElement | undefined;

const walked = (piece: PieceView, level = 0, parentId?: string): Entry[] => [
  { piece, level, ...(parentId === undefined ? {} : { parentId }) },
  ...piece.children.flatMap((child) => walked(child, level + 1, piece.id)),
];

const entriesOf = (st: State): readonly Entry[] => {
  const [story] = st.focus.pieces;
  return story === undefined ? [] : walked(story);
};

const remember = (st: State): void => {
  st.entries = entriesOf(st);
  st.byId = new Map(st.entries.map((entry) => [entry.piece.id, entry]));
};

const entryOf = (st: State, id: string): Entry | undefined => st.byId.get(id);

const childrenOf = (st: State, id: string): readonly Entry[] =>
  st.entries.filter((entry) => entry.parentId === id);

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

const chipWidth = (card: HTMLElement): number => {
  const legend = getComputedStyle(card.querySelector('legend')!);
  return (
    card.querySelector('h2, h3, h4')!.scrollWidth +
    parseFloat(legend.paddingLeft) +
    parseFloat(legend.paddingRight) +
    parseFloat(legend.borderLeftWidth) +
    parseFloat(legend.borderRightWidth)
  );
};

const widthOf = (st: State, id: string): number => {
  const kind = kindOf(st, id);
  if (kind === 'focus') return Math.min(FOCUS_WIDTH, st.main.clientWidth);
  if (kind === 'chip') return chipWidth(st.cards.get(id)!);
  return CARD_WIDTH[shownAncestor(st, id).level] ?? CARD_WIDTH.at(-1)!;
};

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
  const heading = st.cards.get(piece.id)!.querySelector('h2, h3, h4')!;
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
  const heading = document.createElement(`h${entryOf(st, piece.id)!.level + 2}`);
  heading.textContent = piece.name;
  name.append(heading);
  const facets = piece.facets.map((facet) => field(piece.id, facet, st.focus.elaborate));
  card.append(name, ...facets);

  if (piece.childKind !== undefined) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = `Add a ${piece.childKind.toLowerCase()}`;
    button.addEventListener('mousedown', (event) => event.preventDefault());
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      void addUnder(st, piece.id);
    });
    (facets.at(-1) ?? card).append(button);
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

const settle = (st: State): void => {
  for (const animation of st.wrapper.getAnimations({ subtree: true })) animation.finish();
};

let replacing = false;

const watch = (st: State): void => {
  const focus = st.cards.get(st.at)!;
  if (watcher !== undefined && watching === focus) return;
  watcher?.disconnect();
  watcher = new ResizeObserver(() => {
    const current = state;
    if (current === undefined || replacing) return;
    replacing = true;
    const placeWhenStill = (): void => {
      const running = current.wrapper
        .getAnimations({ subtree: true })
        .filter((animation) => animation.playState === 'running');
      if (running.length === 0) {
        replacing = false;
        if (state === current) {
          place(current);
          settle(current);
        }
        return;
      }
      void Promise.allSettled(running.map((animation) => animation.finished)).then(placeWhenStill);
    };
    placeWhenStill();
  });
  watcher.observe(st.main);
  watcher.observe(focus);
  for (const facet of focus.querySelectorAll('.facet')) watcher.observe(facet);
  watching = focus;
};

const place = (st: State): void => {
  const pieces = st.entries;

  const was = new Map(
    [...st.cards].map(([id, card]) => [id, { w: card.offsetWidth, h: card.offsetHeight }]),
  );

  for (const { piece } of pieces) {
    const card = st.cards.get(piece.id);
    if (card === undefined) continue;
    const kind = kindOf(st, piece.id);
    card.style.transitionProperty =
      kind === 'hidden' ? 'left, top, opacity, visibility' : 'left, top, opacity';
    card.style.height = '';
    card.className = kind;
    card.inert = kind === 'hidden';
    if (piece.id === st.at) card.setAttribute('aria-current', 'location');
    else card.removeAttribute('aria-current');
    for (const sentence of card.querySelectorAll('textarea')) {
      sentence.tabIndex = piece.id === st.at ? 0 : -1;
    }
  }

  for (const { piece } of pieces) setHeading(st, piece);

  for (const { piece } of pieces) {
    st.cards.get(piece.id)!.style.width = `${widthOf(st, piece.id)}px`;
  }
  const tall = new Map(pieces.map(({ piece }) => [piece.id, st.cards.get(piece.id)!.offsetHeight]));
  const heightOf = (id: string): number => tall.get(id)!;

  for (const { piece } of pieces) {
    const card = st.cards.get(piece.id)!;
    const from = was.get(piece.id)!;
    card.style.width = `${from.w}px`;
    card.style.height = `${from.h}px`;
  }
  void st.wrapper.offsetWidth;
  for (const { piece } of pieces) {
    const card = st.cards.get(piece.id)!;
    card.style.transitionProperty = '';
    card.style.width = `${widthOf(st, piece.id)}px`;
    card.style.height = `${heightOf(piece.id)}px`;
  }

  const centre = st.wrapper.clientWidth / 2;
  const parentId = entryOf(st, st.at)?.parentId;
  const focus = st.cards.get(st.at)!;
  const focusWidth = widthOf(st, st.at);

  const focusHeight = heightOf(st.at);
  const parent = parentId === undefined ? undefined : st.cards.get(parentId)!;
  const header = document.querySelector('header');
  const mainTop = st.main.getBoundingClientRect().top;
  const belowHeader =
    (header === null ? 0 : header.getBoundingClientRect().bottom) - mainTop + ROW_GAP;
  const top = Math.max(
    window.innerHeight / 2 - mainTop - focusHeight / 2,
    belowHeader + (parentId === undefined ? 0 : heightOf(parentId)),
  );

  focus.style.left = `${centre - focusWidth / 2}px`;
  focus.style.top = `${top}px`;

  if (parentId !== undefined && parent !== undefined) {
    parent.style.left = `${centre - widthOf(st, parentId) / 2}px`;
    parent.style.top = `${top - ROW_GAP - heightOf(parentId)}px`;
  }

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
    const chipTop = top + (focusHeight - heightOf(sample.piece.id)) / 2;
    let before = centre - focusWidth / 2 - GAP;
    for (const entry of siblings.slice(0, here).reverse()) {
      const card = st.cards.get(entry.piece.id)!;
      before -= widthOf(st, entry.piece.id);
      card.style.left = `${before}px`;
      card.style.top = `${chipTop}px`;
      before -= GAP;
    }
    let after = centre + focusWidth / 2 + GAP;
    for (const entry of siblings.slice(here + 1)) {
      const card = st.cards.get(entry.piece.id)!;
      card.style.left = `${after}px`;
      card.style.top = `${chipTop}px`;
      after += widthOf(st, entry.piece.id) + GAP;
    }
  }

  for (const { piece } of pieces) {
    if (kindOf(st, piece.id) === 'hidden') continue;
    const card = st.cards.get(piece.id)!;
    card.style.left = `${parseFloat(card.style.left) + widthOf(st, piece.id) / 2}px`;
    card.style.top = `${parseFloat(card.style.top) + heightOf(piece.id) / 2}px`;
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

  watch(st);
};

const draw = (st: State): void => {
  remember(st);
  st.cards.clear();
  st.wrapper.replaceChildren(
    ...st.entries.map(({ piece }) => {
      const card = pieceCard(st, piece);
      st.cards.set(piece.id, card);
      return card;
    }),
  );
  place(st);
  settle(st);
  pathNav(st);
};

const addUnder = async (st: State, pieceId: string): Promise<void> => {
  const { focus: next, added } = await st.focus.branch(pieceId);
  st.focus = next;
  remember(st);
  const entry = entryOf(st, added)!;
  const card = pieceCard(st, entry.piece);
  const under = entry.parentId === undefined ? undefined : st.cards.get(entry.parentId);
  if (under !== undefined) {
    card.style.left = under.style.left;
    card.style.top = under.style.top;
    card.style.width = under.style.width;
  }
  st.cards.set(added, card);
  const after = st.entries.findIndex((one) => one.piece.id === added) + 1;
  const following = st.entries[after];
  st.wrapper.insertBefore(card, following === undefined ? null : st.cards.get(following.piece.id)!);
  goTo(st, added, card.querySelector('textarea') ?? undefined);
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

  const where = arrowKeys[event.key];
  if (where !== undefined) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    event.preventDefault();
    move(st, where);
    return;
  }
  if (event.key === 'Enter' && target === st.cards.get(st.at)) {
    event.preventDefault();
    st.cards.get(st.at)?.querySelector('textarea')?.focus({ preventScroll: true });
  }
};

export const renderFocus = async (main: HTMLElement, focus: Focus): Promise<void> => {
  const [story] = focus.pieces;
  if (story === undefined) return;
  const wrapper = document.createElement('div');
  wrapper.className = 'graph';
  main.replaceChildren(wrapper);
  if (!listening) {
    listening = true;
    document.addEventListener('keydown', onKeyDown);
  }
  const st: State = {
    main,
    wrapper,
    focus,
    at: story.id,
    lastVisited: new Map(),
    cards: new Map(),
    entries: [],
    byId: new Map(),
  };
  state = st;
  await document.fonts.ready;
  if (state === st) draw(st);
};
