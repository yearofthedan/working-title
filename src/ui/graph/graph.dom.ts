import type { FacetView, OpenProject, PieceView } from '../../application/project';
import {
  along,
  drawnAs,
  moveFrom,
  nameOfRow,
  pathTo,
  rowStop,
  rowsAround,
  shownAncestor,
  treeOf,
  type Entry,
  type Row,
} from './graph';
import {
  centresOf,
  slideFor,
  whileMeasuring,
  widthOf as layoutWidthOf,
  type Box,
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
  readonly rowElements: Map<string, HTMLElement>;
  rows: readonly Row[];
  showable: ReadonlySet<string>;
  places: ReadonlyMap<string, Box>;
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
  button.tabIndex = -1;
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

const pieceCard = (st: State, piece: PieceView): HTMLElement => {
  const card = document.createElement('fieldset');
  card.tabIndex = -1;
  card.dataset.piece = piece.id;
  const name = document.createElement('legend');
  const heading = document.createElement(`h${entryOf(st, piece.id)!.level + 2}`);
  heading.textContent = piece.name;
  name.append(heading);
  const facets = piece.facets.map((facet) => field(piece.id, facet, st.project.elaborate));
  card.append(name, ...facets);

  if (piece.childKind !== undefined) {
    const button = document.createElement('button');
    button.type = 'button';
    button.tabIndex = -1;
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

const rowElement = (st: State, row: Row): HTMLElement => {
  const name = nameOfRow(row);
  let element = st.rowElements.get(name);
  if (element === undefined) {
    element = document.createElement('div');
    element.setAttribute('role', 'toolbar');
    st.rowElements.set(name, element);
  }
  element.setAttribute('aria-label', name);
  return element;
};

const keepOrder = (container: HTMLElement, wanted: readonly HTMLElement[]): void => {
  let at = container.firstElementChild;
  for (const element of wanted) {
    if (element === at) {
      at = element.nextElementSibling;
      continue;
    }
    if (element.isConnected && container.isConnected) container.moveBefore(element, at);
    else container.insertBefore(element, at);
  }
};

const idOfCard = (card: HTMLElement): string | undefined => card.dataset.piece;

const fieldsOf = (card: HTMLElement): readonly HTMLElement[] => [
  ...card.querySelectorAll<HTMLElement>('textarea, .facet button'),
];

const rowOf = (st: State, card: HTMLElement): Row | undefined => {
  const id = idOfCard(card);
  return id === undefined ? undefined : st.rows.find((row) => row.ids.includes(id));
};

const nameButtonIn = (card: HTMLElement): HTMLElement | null =>
  card.querySelector<HTMLElement>('legend button');

const cursorCard = (st: State): HTMLElement | null => {
  const at = document.activeElement;
  const card = at instanceof Element ? at.closest('fieldset') : null;
  return card === null || card === st.cards.get(st.focus) ? null : card;
};

const slide = (st: State): void => {
  const card = cursorCard(st);
  const row = card === null ? undefined : rowOf(st, card);
  const here = card === null ? undefined : st.places.get(idOfCard(card) ?? '');
  const pane = { width: st.main.clientWidth, height: st.main.clientHeight };
  const offset = here === undefined ? 0 : (slideFor(here, pane) ?? 0);
  for (const [id, box] of st.places) {
    const target = st.cards.get(id);
    if (target === undefined) continue;
    const under = shownAncestor(st.entries, st.focus, id).piece.id;
    target.style.left = `${box.x + (row?.ids.includes(under) === true ? offset : 0)}px`;
  }
};

const cursorInCard = (st: State): boolean => {
  const card = st.cards.get(st.focus);
  const at = document.activeElement;
  return card !== undefined && at !== null && at !== card && card.contains(at);
};

const setFieldsTabIndex = (st: State): void => {
  const inside = cursorInCard(st) ? st.focus : undefined;
  for (const [id, card] of st.cards) {
    for (const field of fieldsOf(card)) field.tabIndex = id === inside ? 0 : -1;
  }
};

const setRoving = (st: State): void => {
  for (const row of st.rows) {
    const stop = row.ids.includes(st.focus) ? st.focus : rowStop(row, st.showable);
    for (const id of row.ids) {
      const card = st.cards.get(id);
      if (card === undefined) continue;
      const isStop = id === stop;
      card.tabIndex = isStop && id === st.focus ? 0 : -1;
      const button = nameButtonIn(card);
      if (button !== null) button.tabIndex = isStop && id !== st.focus ? 0 : -1;
    }
  }
};

const arrangeRows = (st: State, places: ReadonlyMap<string, Box>): void => {
  const pane = { width: st.main.clientWidth, height: st.main.clientHeight };
  const showable = new Set<string>();
  const off: HTMLElement[] = [];
  for (const { piece } of st.entries) {
    const card = st.cards.get(piece.id);
    if (card === undefined) continue;
    card.tabIndex = -1;
    if (drawnAs(st.entries, st.focus, piece.id) === 'hidden') {
      const button = nameButtonIn(card);
      if (button !== null) button.tabIndex = -1;
      off.push(card);
      continue;
    }
    const box = places.get(piece.id);
    if (box !== undefined && slideFor(box, pane) !== undefined) showable.add(piece.id);
  }
  st.showable = showable;
  st.places = places;
  st.rows = rowsAround(st.entries, st.focus);

  keepOrder(st.wrapper, [...st.rows.map((row) => rowElement(st, row)), ...off]);
  for (const row of st.rows) {
    keepOrder(
      rowElement(st, row),
      row.ids.flatMap((id) => st.cards.get(id) ?? []),
    );
  }
  for (const [name, element] of st.rowElements) {
    if (st.rows.some((row) => nameOfRow(row) === name)) continue;
    element.remove();
    st.rowElements.delete(name);
  }
  setRoving(st);
  slide(st);
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
  const places = new Map<string, Box>(
    [...centres].map(([id, at]) => [
      id,
      { x: at.x, y: at.y, width: widthOf(id), height: heightOf(id) },
    ]),
  );
  for (const { piece } of pieces) {
    const card = st.cards.get(piece.id)!;
    const at = places.get(piece.id);
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

  arrangeRows(st, places);
  setFieldsTabIndex(st);
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
  st.wrapper.append(card);
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
    const card = target instanceof Element ? target.closest('fieldset') : null;
    const focusCard = st.cards.get(st.focus);

    if (card !== null && card === focusCard && target !== focusCard) {
      if (event.key === 'Escape') {
        event.preventDefault();
        card.focus({ preventScroll: true });
        return;
      }
      if (event.key === 'Tab' && !event.shiftKey && target === fieldsOf(card).at(-1)) {
        event.preventDefault();
        card.focus({ preventScroll: true });
        return;
      }
    }

    if (target instanceof HTMLTextAreaElement) {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      focusCard?.focus({ preventScroll: true });
      return;
    }

    const where = arrowKeys[event.key];
    if (where !== undefined) {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      event.preventDefault();
      const row = card === null ? undefined : rowOf(st, card);
      if (card !== null && card !== focusCard && row !== undefined && !row.ids.includes(st.focus)) {
        if (where === 'up' || where === 'down') return;
        const id = idOfCard(card);
        const to = id === undefined ? undefined : along(row, id, where);
        if (to !== undefined) goTo(st, to);
        return;
      }
      const to = moveFrom(st.entries, st.focus, where, st.lastVisited);
      if (to !== undefined) goTo(st, to);
      return;
    }

    if (event.key !== 'Enter') return;

    if (target === focusCard) {
      event.preventDefault();
      focusCard?.querySelector('textarea')?.focus({ preventScroll: true });
    }
  };
  return onKeyDown;
};

const focusOn = (st: State): (() => void) => {
  const onFocusMove = (): void => {
    if (!st.wrapper.isConnected) {
      document.removeEventListener('focusin', onFocusMove);
      document.removeEventListener('focusout', onFocusMove);
      return;
    }
    setRoving(st);
    setFieldsTabIndex(st);
    slide(st);
  };
  return onFocusMove;
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
    rowElements: new Map(),
    rows: [],
    showable: new Set(),
    places: new Map(),
    entries: [],
    byId: new Map(),
    watcher: undefined,
    watching: undefined,
    replacing: false,
  };
  document.addEventListener('keydown', keysOn(st));
  const onFocusMove = focusOn(st);
  document.addEventListener('focusin', onFocusMove);
  document.addEventListener('focusout', onFocusMove);
  await document.fonts.ready;
  if (st.wrapper.isConnected) draw(st);
};
