import type { FacetView, Focus, PieceView } from '../../application/project';

const headingTags = ['h2', 'h3', 'h4'] as const;

type Adding = (pieceId: string) => void;

const field = (
  pieceId: string,
  { id, label, text }: FacetView,
  elaborate: Focus['elaborate'],
  twoLine: boolean,
) => {
  const wrapper = document.createElement('div');
  wrapper.className = 'facet';
  const fieldId = `facet-${pieceId}-${id}`;
  const name = document.createElement('label');
  name.htmlFor = fieldId;
  name.textContent = label;
  const input = document.createElement('textarea');
  input.id = fieldId;
  input.value = text;
  const shown = twoLine ? document.createElement('div') : undefined;
  if (shown !== undefined) {
    shown.className = 'shown';
    shown.setAttribute('aria-hidden', 'true');
    shown.textContent = text;
  }
  input.addEventListener('input', () => {
    if (shown !== undefined) shown.textContent = input.value;
    void elaborate(pieceId, id, input.value);
  });
  wrapper.append(name, input, ...(shown === undefined ? [] : [shown]));
  return wrapper;
};

const pieceGroup = (piece: PieceView, level: number, focus: Focus, add: Adding): HTMLElement => {
  const group = document.createElement('fieldset');
  const name = document.createElement('legend');
  const heading = document.createElement(headingTags[level]);
  heading.textContent = piece.name;
  name.append(heading);
  group.append(
    name,
    ...piece.facets.map((facet) => field(piece.id, facet, focus.elaborate, level > 0)),
  );

  if (piece.childKind !== undefined) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = `Add a ${piece.childKind.toLowerCase()}`;
    button.addEventListener('click', () => add(piece.id));
    group.append(button);
  }

  return group;
};

const listed = (
  pieces: readonly PieceView[],
  level: number,
  focus: Focus,
  add: Adding,
): HTMLElement => {
  const list = document.createElement('ol');
  for (const piece of pieces) {
    const item = document.createElement('li');
    const group = pieceGroup(piece, level, focus, add);
    if (piece.children.length > 0) group.append(listed(piece.children, level + 1, focus, add));
    item.append(group);
    list.append(item);
  }
  return list;
};

const pieceWith = (pieces: readonly PieceView[], id: string): PieceView | undefined => {
  for (const piece of pieces) {
    if (piece.id === id) return piece;
    const under = pieceWith(piece.children, id);
    if (under !== undefined) return under;
  }
  return undefined;
};

const bringIntoView = (main: HTMLElement, target: HTMLElement): void => {
  const from = { left: main.scrollLeft, top: main.scrollTop };
  target.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
  const to = { left: main.scrollLeft, top: main.scrollTop };
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  main.scrollTo({ ...from, behavior: 'instant' });
  const started = performance.now();
  const pan = (now: number) => {
    const at = Math.min(1, (now - started) / 250);
    const eased = 1 - (1 - at) ** 3;
    main.scrollTo({
      left: from.left + (to.left - from.left) * eased,
      top: from.top + (to.top - from.top) * eased,
      behavior: 'instant',
    });
    if (at < 1) requestAnimationFrame(pan);
  };
  requestAnimationFrame(pan);
};

const cursorInto = (main: HTMLElement, focus: Focus, pieceId: string): void => {
  const facet = pieceWith(focus.pieces, pieceId)?.facets[0];
  const line = facet === undefined ? null : document.getElementById(`facet-${pieceId}-${facet.id}`);
  if (!(line instanceof HTMLTextAreaElement)) return;
  const card = line.closest('fieldset');
  if (card === null) return;
  line.focus({ preventScroll: true });
  bringIntoView(main, card);
};

const addUnder = async (main: HTMLElement, focus: Focus, pieceId: string): Promise<void> => {
  const { focus: next, added } = await focus.branch(pieceId);
  renderFocus(main, next);
  cursorInto(main, next, added);
};

export const renderFocus = (main: HTMLElement, focus: Focus): void => {
  const [story, ...rest] = focus.pieces;
  if (story === undefined) return;
  const add = (pieceId: string) => void addUnder(main, focus, pieceId);
  const group = pieceGroup(story, 0, focus, add);
  group.append(listed(rest, 1, focus, add));
  main.replaceChildren(group);
};
