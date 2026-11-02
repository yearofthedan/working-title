import type { OpenProject, PieceView } from '../../application/project';
import { pieceCard, type Card } from '../card/card.dom';
import { thePanel, type Panel } from '../panel/panel.dom';
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
  readonly typing: OpenProject['elaborate'];
  readonly panelElement: HTMLElement;
  panel: Panel | undefined;
  open: string | undefined;
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
  st.entries = treeOf(st.project.root);
  st.byId = new Map(st.entries.map((entry) => [entry.piece.id, entry]));
};

const entryOf = (st: State, id: string): Entry | undefined => st.byId.get(id);

const sizes: Sizes = { current: 560, cards: [200, 180, 120], gap: 32 };

const paneOf = (st: State): Pane => {
  const mainTop = st.main.getBoundingClientRect().top;
  return {
    width: st.wrapper.clientWidth,
    mainWidth: st.main.clientWidth,
    middle: window.innerHeight / 2 - mainTop,
    top: st.header.getBoundingClientRect().bottom - mainTop,
  };
};

const moveTo = (st: State, id: string): void => {
  if (id !== st.current) {
    const parent = entryOf(st, id)?.parentId;
    if (parent !== undefined) st.lastVisited.set(parent, id);
    st.current = id;
    place(st);
    pathNav(st);
  }
};

const goTo = (st: State, id: string, into?: HTMLElement): void => {
  moveTo(st, id);
  if (into !== undefined) into.focus({ preventScroll: true });
  else st.cards.get(id)?.focus();
};
const beside = (st: State): Panel =>
  (st.panel ??= thePanel(st.panelElement, {
    elaborate: st.typing,
    close: () => closeBeside(st),
  }));

const openBeside = (st: State, id: string): void => {
  const was = st.open;
  st.open = id;
  if (was !== undefined && was !== id) st.cards.get(was)?.showOpen(false);
  st.cards.get(id)?.showOpen(true);
  beside(st).open(st.project.read(id));
};

const closeBeside = (st: State): void => {
  const id = st.open;
  st.open = undefined;
  st.panel?.close();
  const kind = id === undefined ? undefined : drawnAs(st.entries, st.current, id);
  const card = id === undefined ? undefined : st.cards.get(id);
  card?.showOpen(false);
  if (card !== undefined && (kind === 'card' || kind === 'current')) card.focusOpenBeside();
  else st.cards.get(st.current)?.focus();
};

const cardFor = (st: State, piece: PieceView): Card =>
  pieceCard(piece, {
    level: entryOf(st, piece.id)!.level,
    current: () => st.current === piece.id,
    elaborate: st.typing,
    goTo: (into) => goTo(st, piece.id, into),
    addChild: () => void addUnder(st, piece.id),
    openBeside: () => (st.open === piece.id ? closeBeside(st) : openBeside(st, piece.id)),
  });

const pathNav = (st: State): void => {
  let nav = st.header.querySelector('nav');
  if (nav === null) {
    nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'Where you are');
    st.header.append(nav);
  }

  const path = pathTo(st.entries, st.current);

  const list = document.createElement('ol');
  for (const step of path) {
    const item = document.createElement('li');
    if (step.piece.id === st.current) {
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
  const current = st.cards.get(st.current)!;
  if (st.watcher !== undefined && st.watching === current) return;
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

const cursorCard = (st: State): Card | null => {
  const at = document.activeElement;
  const element = at instanceof Element ? at.closest<HTMLElement>('fieldset') : null;
  const card = element === null ? undefined : st.cards.get(element.dataset.piece ?? '');
  return card === undefined || card === st.cards.get(st.current) ? null : card;
};

const slide = (st: State): void => {
  const card = cursorCard(st);
  const id = card === null ? undefined : card.element.dataset.piece;
  const row = rowOf(st, id);
  const here = id === undefined ? undefined : st.places.get(id);
  const pane = { width: st.main.clientWidth, height: st.main.clientHeight };
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
  const pane = { width: st.main.clientWidth, height: st.main.clientHeight };
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

  keepOrder(st.wrapper, [
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
    layoutWidthOf(st.entries, st.current, id, pane, sizes, (chip) =>
      st.cards.get(chip)!.minWidth(),
    );

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
  void st.wrapper.offsetWidth;
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
  st.wrapper.replaceChildren(
    ...st.entries.map(({ piece }) => {
      const card = cardFor(st, piece);
      st.cards.set(piece.id, card);
      return card.element;
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
  const card = cardFor(st, entry.piece);
  const under = entry.parentId === undefined ? undefined : st.cards.get(entry.parentId);
  if (under !== undefined) card.startAt(under);
  st.cards.set(added, card);
  st.wrapper.append(card.element);
  moveTo(st, added);
  card.enter();
};

const keysOn = (st: State): ((event: KeyboardEvent) => void) => {
  const onKeyDown = (event: KeyboardEvent): void => {
    if (!st.wrapper.isConnected) {
      document.removeEventListener('keydown', onKeyDown);
      st.watcher?.disconnect();
      return;
    }
    const target = event.target;
    if (target instanceof Element && st.panel?.element.contains(target) === true) return;
    const inside = target instanceof Element ? target.closest('main') : null;
    if (inside !== null && inside !== st.main) return;
    if (target instanceof HTMLTextAreaElement) return;

    const where = arrowKeys[event.key];
    if (where === undefined) return;
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    event.preventDefault();
    const element = target instanceof Element ? target.closest<HTMLElement>('fieldset') : null;
    const row = element === null ? undefined : rowOf(st, element.dataset.piece);
    if (
      element !== null &&
      element !== st.cards.get(st.current)?.element &&
      row !== undefined &&
      !row.ids.includes(st.current)
    ) {
      if (where === 'up' || where === 'down') return;
      const id = element.dataset.piece;
      const to = id === undefined ? undefined : along(row, id, where);
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
  { header, main, panel: element }: { header: HTMLElement; main: HTMLElement; panel: HTMLElement },
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
    panelElement: element,
    panel: undefined,
    typing: async (pieceId, facetId, text) => {
      await st.project.elaborate(pieceId, facetId, text);
      // shortcut: the graph passes a change from the card to the panel and back, until a third consumer needs to know about a change; then move it to an observable on OpenProject.
      if (st.panel?.isOpenOn(pieceId) === true) st.panel.show(facetId, text);
      st.cards.get(pieceId)?.show(facetId, text);
    },
    open: undefined,
    current: project.root.id,
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
