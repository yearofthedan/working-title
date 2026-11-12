import type { OpenProject, PieceView } from '../../application/project';
import { pieceCard, type Card } from '../card/card.dom';
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
  widthOf as layoutWidthOf,
  type Box,
  type Pane,
  type Sizes,
} from './layout';

export interface GraphHooks {
  moved(path: readonly PieceView[]): void;
  elaborate: OpenProject['elaborate'];
  branch(pieceId: string): Promise<{ root: PieceView; added: string }>;
  toggleBeside(pieceId: string): void;
}

export interface Graph {
  readonly element: HTMLElement;
  draw(): Promise<void>;
  keys(event: KeyboardEvent): void;
  goTo(pieceId: string): void;
  show(pieceId: string, facetId: string, text: string): void;
  showOpen(pieceId: string): void;
  closedBeside(pieceId: string): void;
  stop(): void;
}

const arrowKeys: Readonly<Record<string, 'up' | 'down' | 'left' | 'right'>> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
};

interface State {
  readonly hooks: GraphHooks;
  readonly element: HTMLElement;
  readonly signal: AbortSignal;
  root: PieceView;
  current: string;
  readonly lastVisited: Map<string, string>;
  readonly cards: Map<string, Card>;
  readonly rowElements: Map<string, HTMLElement>;
  rows: readonly Row[];
  showable: ReadonlySet<string>;
  places: ReadonlyMap<string, Box>;
  entries: readonly Entry[];
  byId: Map<string, Entry>;
  watcher: ResizeObserver | undefined;
  watching: Card | undefined;
  replacing: boolean;
}

const remember = (st: State): void => {
  st.entries = treeOf(st.root);
  st.byId = new Map(st.entries.map((entry) => [entry.piece.id, entry]));
};

const entryOf = (st: State, id: string): Entry | undefined => st.byId.get(id);

const sizes: Sizes = { current: 560, gap: 32 };

const paneOf = (st: State): Pane => {
  const top = st.element.getBoundingClientRect().top;
  return {
    width: st.element.clientWidth,
    middle: window.innerHeight / 2 - top,
  };
};

const moveTo = (st: State, id: string): void => {
  if (id !== st.current) {
    const parent = entryOf(st, id)?.parentId;
    if (parent !== undefined) st.lastVisited.set(parent, id);
    st.current = id;
    place(st);
    moved(st);
  }
};

const goTo = (st: State, id: string, into?: HTMLElement): void => {
  moveTo(st, id);
  if (into !== undefined) into.focus({ preventScroll: true });
  else st.cards.get(id)?.focus();
};
const cardFor = (st: State, piece: PieceView): Card =>
  pieceCard(piece, {
    level: entryOf(st, piece.id)!.level,
    current: () => st.current === piece.id,
    elaborate: st.hooks.elaborate,
    goTo: (into) => goTo(st, piece.id, into),
    addChild: () => void addUnder(st, piece.id),
    openBeside: () => st.hooks.toggleBeside(piece.id),
  });

const moved = (st: State): void => {
  st.hooks.moved(pathTo(st.entries, st.current).map(({ piece }) => piece));
};

const skipToEnd = (st: State): void => {
  for (const animation of st.element.getAnimations({ subtree: true })) animation.finish();
};

const watch = (st: State): void => {
  const current = st.cards.get(st.current)!;
  if (st.watcher !== undefined && st.watching === current) return;
  st.watcher?.disconnect();
  st.watcher = new ResizeObserver(() => {
    if (st.replacing) return;
    st.replacing = true;
    const placeWhenStill = (): void => {
      if (st.signal.aborted) return;
      const running = st.element
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
  st.watcher.observe(st.element);
  current.observe(st.watcher);
  st.watching = current;
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

const rowOf = (st: State, id: string | undefined): Row | undefined =>
  id === undefined ? undefined : st.rows.find((row) => row.ids.includes(id));

const pieceHolding = (st: State, node: EventTarget | null): string | undefined => {
  if (!(node instanceof Node)) return undefined;
  for (const [id, card] of st.cards) if (card.contains(node)) return id;
  return undefined;
};

const cursorPiece = (st: State): string | undefined => {
  const id = pieceHolding(st, document.activeElement);
  return id === st.current ? undefined : id;
};

const slide = (st: State): void => {
  const id = cursorPiece(st);
  const row = rowOf(st, id);
  const here = id === undefined ? undefined : st.places.get(id);
  const pane = { width: st.element.clientWidth, height: st.element.clientHeight };
  const offset = here === undefined ? 0 : (slideFor(here, pane) ?? 0);
  for (const [pieceId, box] of st.places) {
    const target = st.cards.get(pieceId);
    if (target === undefined) continue;
    const under = shownAncestor(st.entries, st.current, pieceId).piece.id;
    target.slideTo(box.x + (row?.ids.includes(under) === true ? offset : 0));
  }
};

const cursorInCard = (st: State): boolean => {
  const card = st.cards.get(st.current);
  const at = document.activeElement;
  return card !== undefined && at !== null && at !== card.element && card.contains(at);
};

const setFieldsTabIndex = (st: State): void => {
  const inside = cursorInCard(st) ? st.current : undefined;
  for (const [id, card] of st.cards) card.reachFields(id === inside);
};

const setRoving = (st: State): void => {
  for (const row of st.rows) {
    const stop = row.ids.includes(st.current) ? st.current : rowStop(row, st.showable);
    for (const id of row.ids) {
      const card = st.cards.get(id);
      if (card === undefined) continue;
      const isStop = id === stop;
      card.reachCard(isStop && id === st.current);
      card.reachName(isStop && id !== st.current);
    }
  }
};

const arrangeRows = (st: State, places: ReadonlyMap<string, Box>): void => {
  const pane = { width: st.element.clientWidth, height: st.element.clientHeight };
  const showable = new Set<string>();
  const off: Card[] = [];
  for (const { piece } of st.entries) {
    const card = st.cards.get(piece.id);
    if (card === undefined) continue;
    card.reachCard(false);
    if (drawnAs(st.entries, st.current, piece.id) === 'hidden') {
      card.reachName(false);
      off.push(card);
      continue;
    }
    const box = places.get(piece.id);
    if (box !== undefined && slideFor(box, pane) !== undefined) showable.add(piece.id);
  }
  st.showable = showable;
  st.places = places;
  st.rows = rowsAround(st.entries, st.current);

  keepOrder(st.element, [
    ...st.rows.map((row) => rowElement(st, row)),
    ...off.map((card) => card.element),
  ]);
  for (const row of st.rows) {
    keepOrder(
      rowElement(st, row),
      row.ids.flatMap((id) => st.cards.get(id)?.element ?? []),
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
    layoutWidthOf(st.entries, st.current, id, pane, sizes, {
      chip: (chip) => st.cards.get(chip)!.minWidth(),
      card: (card) => st.cards.get(card)!.ownWidth(),
    });

  const was = new Map([...st.cards].map(([id, card]) => [id, card.size()]));

  for (const { piece } of pieces) {
    const card = st.cards.get(piece.id);
    if (card === undefined) continue;
    card.settle(piece, drawnAs(st.entries, st.current, piece.id));
  }

  for (const { piece } of pieces) {
    st.cards.get(piece.id)!.setWidth(widthOf(piece.id));
  }
  const tall = new Map(pieces.map(({ piece }) => [piece.id, st.cards.get(piece.id)!.size().h]));
  const heightOf = (id: string): number => tall.get(id)!;

  for (const { piece } of pieces) {
    const card = st.cards.get(piece.id)!;
    const from = was.get(piece.id)!;
    card.setWidth(from.w);
    card.setHeight(from.h);
  }
  void st.element.offsetWidth;
  for (const { piece } of pieces) {
    const card = st.cards.get(piece.id)!;
    card.afterMeasuring();
    card.setWidth(widthOf(piece.id));
    card.setHeight(heightOf(piece.id));
  }

  const centres = centresOf(
    st.entries,
    st.current,
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
    if (at !== undefined) card.placeAt(at.x, at.y);
    if (drawnAs(st.entries, st.current, piece.id) !== 'hidden') continue;
    const ancestor = shownAncestor(st.entries, st.current, piece.id).piece.id;
    if (ancestor === piece.id) continue;
    card.startAt(st.cards.get(ancestor)!);
  }

  arrangeRows(st, places);
  setFieldsTabIndex(st);
  watch(st);
};

const draw = (st: State): void => {
  remember(st);
  st.cards.clear();
  st.element.replaceChildren(
    ...st.entries.map(({ piece }) => {
      const card = cardFor(st, piece);
      st.cards.set(piece.id, card);
      return card.element;
    }),
  );
  place(st);
  skipToEnd(st);
  moved(st);
};

const addUnder = async (st: State, pieceId: string): Promise<void> => {
  const { root, added } = await st.hooks.branch(pieceId);
  st.root = root;
  remember(st);
  const entry = entryOf(st, added)!;
  const card = cardFor(st, entry.piece);
  const under = entry.parentId === undefined ? undefined : st.cards.get(entry.parentId);
  if (under !== undefined) card.startAt(under);
  st.cards.set(added, card);
  st.element.append(card.element);
  moveTo(st, added);
  card.enter();
};

const keysOn = (st: State): ((event: KeyboardEvent) => void) => {
  const onKeyDown = (event: KeyboardEvent): void => {
    const target = event.target;
    if (target instanceof HTMLTextAreaElement) return;

    const where = arrowKeys[event.key];
    if (where === undefined) return;
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    event.preventDefault();
    const focused = pieceHolding(st, target);
    const row = rowOf(st, focused);
    if (
      focused !== undefined &&
      focused !== st.current &&
      row !== undefined &&
      !row.ids.includes(st.current)
    ) {
      if (where === 'up' || where === 'down') return;
      const to = along(row, focused, where);
      if (to !== undefined) goTo(st, to);
      return;
    }
    const to = moveFrom(st.entries, st.current, where, st.lastVisited);
    if (to !== undefined) goTo(st, to);
  };
  return onKeyDown;
};

const focusOn = (st: State): (() => void) => {
  const onFocusMove = (): void => {
    setRoving(st);
    setFieldsTabIndex(st);
    slide(st);
  };
  return onFocusMove;
};

export const renderGraph = (root: PieceView, hooks: GraphHooks): Graph => {
  const element = document.createElement('div');
  element.className = 'graph';
  const controller = new AbortController();
  const st: State = {
    hooks,
    element,
    signal: controller.signal,
    root,
    current: root.id,
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
  const keys = keysOn(st);
  element.addEventListener('keydown', keys, { signal: controller.signal });
  const onFocusMove = focusOn(st);
  element.addEventListener('focusin', onFocusMove, { signal: controller.signal });
  element.addEventListener('focusout', onFocusMove, { signal: controller.signal });
  return {
    element,
    draw: async () => {
      await document.fonts.ready;
      draw(st);
    },
    keys,
    goTo: (pieceId) => goTo(st, pieceId),
    show: (pieceId, facetId, text) => st.cards.get(pieceId)?.show(facetId, text),
    showOpen: (pieceId) => {
      for (const [id, card] of st.cards) card.showOpen(id === pieceId);
    },
    closedBeside: (pieceId) => {
      const card = st.cards.get(pieceId);
      card?.showOpen(false);
      const kind = drawnAs(st.entries, st.current, pieceId);
      if (card !== undefined && (kind === 'card' || kind === 'current')) card.focusOpenBeside();
      else st.cards.get(st.current)?.focus();
    },
    stop: () => {
      controller.abort();
      st.watcher?.disconnect();
    },
  };
};
