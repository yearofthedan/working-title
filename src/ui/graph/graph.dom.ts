import type { FacetView, OpenProject, PieceView } from '../../application/project';
import { drawnAs, moveFrom, pathTo, shownAncestor, treeOf, type Entry } from './graph';
import {
  centresOf,
  whileMeasuring,
  widthOf as layoutWidthOf,
  type Pane,
  type Sizes,
} from './layout';

const arrowKeys: Readonly<Record<string, 'up' | 'down' | 'left' | 'right'>> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
};

interface State {
  readonly header: HTMLElement;
  readonly main: HTMLElement;
  readonly wrapper: HTMLElement;
  project: OpenProject;
  focus: string;
  readonly lastVisited: Map<string, string>;
  readonly cards: Map<string, HTMLElement>;
  entries: readonly Entry[];
  byId: Map<string, Entry>;
  watcher: ResizeObserver | undefined;
  watching: HTMLElement | undefined;
  replacing: boolean;
}

const remember = (st: State): void => {
  st.entries = treeOf(st.project.root);
  st.byId = new Map(st.entries.map((entry) => [entry.piece.id, entry]));
};

const entryOf = (st: State, id: string): Entry | undefined => st.byId.get(id);

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

const sizes: Sizes = { focus: 560, cards: [200, 180, 120], gap: 32 };

const paneOf = (st: State): Pane => {
  const mainTop = st.main.getBoundingClientRect().top;
  return {
    width: st.wrapper.clientWidth,
    mainWidth: st.main.clientWidth,
    middle: window.innerHeight / 2 - mainTop,
    top: st.header.getBoundingClientRect().bottom - mainTop,
  };
};

const goTo = (st: State, id: string, into?: HTMLElement): void => {
  if (id !== st.focus) {
    const parent = entryOf(st, id)?.parentId;
    if (parent !== undefined) st.lastVisited.set(parent, id);
    st.focus = id;
    place(st);
    pathNav(st);
  }
  (into ?? st.cards.get(id))?.focus({ preventScroll: true });
};
const nameButton = (piece: PieceView): HTMLElement => {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = piece.name;
  return button;
};

const setHeading = (st: State, piece: PieceView): void => {
  const focused = piece.id === st.focus;
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
  const facets = piece.facets.map((facet) => field(piece.id, facet, st.project.elaborate));
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
    if (piece.id === st.focus && into === undefined) return;
    goTo(st, piece.id, into);
  });

  return card;
};

const pathNav = (st: State): void => {
  let nav = st.header.querySelector('nav');
  if (nav === null) {
    nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'Where you are');
    st.header.append(nav);
  }

  const path = pathTo(st.entries, st.focus);

  const list = document.createElement('ol');
  for (const step of path) {
    const item = document.createElement('li');
    if (step.piece.id === st.focus) {
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

const skipToEnd = (st: State): void => {
  for (const animation of st.wrapper.getAnimations({ subtree: true })) animation.finish();
};

const watch = (st: State): void => {
  const focus = st.cards.get(st.focus)!;
  if (st.watcher !== undefined && st.watching === focus) return;
  st.watcher?.disconnect();
  st.watcher = new ResizeObserver(() => {
    if (st.replacing) return;
    st.replacing = true;
    const placeWhenStill = (): void => {
      if (!st.wrapper.isConnected) {
        st.watcher?.disconnect();
        return;
      }
      const running = st.wrapper
        .getAnimations({ subtree: true })
        .filter((animation) => animation.playState === 'running');
      if (running.length === 0) {
        st.replacing = false;
        place(st);
        skipToEnd(st);
        return;
      }
      void Promise.allSettled(running.map((animation) => animation.finished)).then(placeWhenStill);
    };
    placeWhenStill();
  });
  st.watcher.observe(st.main);
  st.watcher.observe(focus);
  for (const facet of focus.querySelectorAll('.facet')) st.watcher.observe(facet);
  st.watching = focus;
};

const place = (st: State): void => {
  const pieces = st.entries;
  const pane = paneOf(st);
  const widthOf = (id: string): number =>
    layoutWidthOf(st.entries, st.focus, id, pane, sizes, (chip) => chipWidth(st.cards.get(chip)!));

  const was = new Map(
    [...st.cards].map(([id, card]) => [id, { w: card.offsetWidth, h: card.offsetHeight }]),
  );

  for (const { piece } of pieces) {
    const card = st.cards.get(piece.id);
    if (card === undefined) continue;
    const kind = drawnAs(st.entries, st.focus, piece.id);
    card.style.transitionProperty = whileMeasuring(getComputedStyle(card).transitionProperty, kind);
    card.style.height = '';
    card.className = kind;
    card.inert = kind === 'hidden';
    if (piece.id === st.focus) card.setAttribute('aria-current', 'location');
    else card.removeAttribute('aria-current');
    for (const sentence of card.querySelectorAll('textarea')) {
      sentence.tabIndex = piece.id === st.focus ? 0 : -1;
    }
  }

  for (const { piece } of pieces) setHeading(st, piece);

  for (const { piece } of pieces) {
    st.cards.get(piece.id)!.style.width = `${widthOf(piece.id)}px`;
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
    card.style.width = `${widthOf(piece.id)}px`;
    card.style.height = `${heightOf(piece.id)}px`;
  }

  const centres = centresOf(
    st.entries,
    st.focus,
    (id) => ({ width: widthOf(id), height: heightOf(id) }),
    pane,
    sizes,
  );
  for (const { piece } of pieces) {
    const card = st.cards.get(piece.id)!;
    const at = centres.get(piece.id);
    if (at !== undefined) {
      card.style.left = `${at.x}px`;
      card.style.top = `${at.y}px`;
    }
    if (drawnAs(st.entries, st.focus, piece.id) !== 'hidden') continue;
    const ancestor = shownAncestor(st.entries, st.focus, piece.id).piece.id;
    if (ancestor === piece.id) continue;
    const under = st.cards.get(ancestor)!;
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
  skipToEnd(st);
  pathNav(st);
};

const addUnder = async (st: State, pieceId: string): Promise<void> => {
  const { project, added } = await st.project.branch(pieceId);
  st.project = project;
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

const keysOn = (st: State): ((event: KeyboardEvent) => void) => {
  const onKeyDown = (event: KeyboardEvent): void => {
    if (!st.wrapper.isConnected) {
      document.removeEventListener('keydown', onKeyDown);
      st.watcher?.disconnect();
      return;
    }
    const target = event.target;
    const inside = target instanceof Element ? target.closest('main') : null;
    if (inside !== null && inside !== st.main) return;

    if (target instanceof HTMLTextAreaElement) {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      st.cards.get(st.focus)?.focus({ preventScroll: true });
      return;
    }

    const where = arrowKeys[event.key];
    if (where !== undefined) {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      event.preventDefault();
      const to = moveFrom(st.entries, st.focus, where, st.lastVisited);
      if (to !== undefined) goTo(st, to);
      return;
    }
    if (event.key === 'Enter' && target === st.cards.get(st.focus)) {
      event.preventDefault();
      st.cards.get(st.focus)?.querySelector('textarea')?.focus({ preventScroll: true });
    }
  };
  return onKeyDown;
};

export const renderGraph = async (
  { header, main }: { header: HTMLElement; main: HTMLElement },
  project: OpenProject,
): Promise<void> => {
  const wrapper = document.createElement('div');
  wrapper.className = 'graph';
  main.replaceChildren(wrapper);
  const st: State = {
    header,
    main,
    wrapper,
    project,
    focus: project.root.id,
    lastVisited: new Map(),
    cards: new Map(),
    entries: [],
    byId: new Map(),
    watcher: undefined,
    watching: undefined,
    replacing: false,
  };
  document.addEventListener('keydown', keysOn(st));
  await document.fonts.ready;
  if (st.wrapper.isConnected) draw(st);
};
