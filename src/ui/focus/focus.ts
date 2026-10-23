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

const pieceGroup = (piece: PieceView, headingTag: 'h2' | 'h3', elaborate: Focus['elaborate']) => {
  const group = document.createElement('fieldset');
  const name = document.createElement('legend');
  // The heading is what lets a writer jump from piece to piece; the legend carries it so the
  // group's accessible name stays the piece's.
  const heading = document.createElement(headingTag);
  heading.textContent = piece.name;
  name.append(heading);
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
    item.append(pieceGroup(piece, 'h3', focus.elaborate));
    list.append(item);
  }
  main.replaceChildren(pieceGroup(story, 'h2', focus.elaborate), list);
};
