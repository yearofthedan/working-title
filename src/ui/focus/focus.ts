import type { FacetView, Focus, PieceView } from '../../application/project';

const field = (pieceId: string, { id, label, text }: FacetView, elaborate: Focus['elaborate']) => {
  const wrapper = document.createElement('div');
  wrapper.className = 'facet';
  const fieldId = `facet-${pieceId}-${id}`;
  const name = document.createElement('label');
  name.htmlFor = fieldId;
  name.textContent = label;
  const input = document.createElement('textarea');
  input.id = fieldId;
  input.value = text;
  input.rows = 3;
  input.addEventListener('input', () => void elaborate(pieceId, id, input.value));
  wrapper.append(name, input);
  return wrapper;
};

const pieceGroup = (piece: PieceView, elaborate: Focus['elaborate']) => {
  const group = document.createElement('fieldset');
  const name = document.createElement('legend');
  name.textContent = piece.name;
  group.append(name, ...piece.facets.map((facet) => field(piece.id, facet, elaborate)));
  return group;
};

// shortcut: plain DOM, until the first #2 story that renders the graph picks a framework.
export const renderFocus = (main: HTMLElement, focus: Focus): void => {
  const [story, ...rest] = focus.pieces;
  if (story === undefined) return;
  const list = document.createElement('ol');
  for (const piece of rest) {
    const item = document.createElement('li');
    item.append(pieceGroup(piece, focus.elaborate));
    list.append(item);
  }
  main.replaceChildren(pieceGroup(story, focus.elaborate), list);
};
