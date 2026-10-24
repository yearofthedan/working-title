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
  input.addEventListener('input', () => void elaborate(pieceId, id, input.value));
  wrapper.append(name, input);
  return wrapper;
};

const pieceGroup = (piece: PieceView, headingTag: 'h2' | 'h3', elaborate: Focus['elaborate']) => {
  const group = document.createElement('fieldset');
  group.className = headingTag === 'h2' ? 'story' : 'beat';
  const name = document.createElement('legend');
  const heading = document.createElement(headingTag);
  heading.textContent = piece.name;
  name.append(heading);
  group.append(name, ...piece.facets.map((facet) => field(piece.id, facet, elaborate)));
  return group;
};

export const renderFocus = (main: HTMLElement, focus: Focus): void => {
  const [story, ...rest] = focus.pieces;
  if (story === undefined) return;
  const beats = document.createElement('ol');
  for (const piece of rest) {
    const item = document.createElement('li');
    item.append(pieceGroup(piece, 'h3', focus.elaborate));
    beats.append(item);
  }
  const group = pieceGroup(story, 'h2', focus.elaborate);
  group.append(beats);
  main.replaceChildren(group);
};
