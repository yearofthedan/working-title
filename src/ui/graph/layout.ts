import { childrenOf, drawnAs, shownAncestor, type Drawn, type Entry } from './graph';

export interface Sizes {
  readonly focus: number;
  readonly cards: readonly number[];
  readonly gap: number;
}

export interface Pane {
  readonly width: number;
  readonly mainWidth: number;
  readonly middle: number;
  readonly top: number;
}

export const widthOf = (
  entries: readonly Entry[],
  focus: string,
  id: string,
  pane: Pane,
  sizes: Sizes,
  chipWidth: (id: string) => number,
): number => {
  const kind = drawnAs(entries, focus, id);
  if (kind === 'focus') return Math.min(sizes.focus, pane.mainWidth);
  if (kind === 'chip') return chipWidth(id);
  return sizes.cards[shownAncestor(entries, focus, id).level] ?? sizes.cards.at(-1)!;
};

export const centresOf = (
  entries: readonly Entry[],
  focus: string,
  size: (id: string) => { width: number; height: number },
  pane: Pane,
  sizes: Sizes,
): ReadonlyMap<string, { x: number; y: number }> => {
  const centres = new Map<string, { x: number; y: number }>();
  const centre = pane.width / 2;
  const parentId = entries.find((entry) => entry.piece.id === focus)?.parentId;
  const focusWidth = size(focus).width;
  const focusHeight = size(focus).height;
  const top = Math.max(
    pane.middle - focusHeight / 2,
    pane.top + sizes.gap + (parentId === undefined ? 0 : size(parentId).height),
  );

  centres.set(focus, { x: centre, y: top + focusHeight / 2 });

  if (parentId !== undefined) {
    const parentHeight = size(parentId).height;
    centres.set(parentId, { x: centre, y: top - sizes.gap - parentHeight / 2 });
  }

  const below = top + focusHeight + sizes.gap;
  const children = childrenOf(entries, focus);
  const row =
    children.reduce((total, entry) => total + size(entry.piece.id).width, 0) +
    sizes.gap * (children.length - 1);
  let left = centre - row / 2;
  for (const child of children) {
    const { width, height } = size(child.piece.id);
    centres.set(child.piece.id, { x: left + width / 2, y: below + height / 2 });
    left += width + sizes.gap;
  }

  const siblings = parentId === undefined ? [] : childrenOf(entries, parentId);
  const here = siblings.findIndex((entry) => entry.piece.id === focus);
  const sample = siblings.find((entry) => entry.piece.id !== focus);
  if (sample !== undefined) {
    const chipTop = top + (focusHeight - size(sample.piece.id).height) / 2;
    let before = centre - focusWidth / 2 - sizes.gap;
    for (const entry of siblings.slice(0, here).reverse()) {
      const { width, height } = size(entry.piece.id);
      before -= width;
      centres.set(entry.piece.id, { x: before + width / 2, y: chipTop + height / 2 });
      before -= sizes.gap;
    }
    let after = centre + focusWidth / 2 + sizes.gap;
    for (const entry of siblings.slice(here + 1)) {
      const { width, height } = size(entry.piece.id);
      centres.set(entry.piece.id, { x: after + width / 2, y: chipTop + height / 2 });
      after += width + sizes.gap;
    }
  }

  for (const { piece } of entries) {
    if (drawnAs(entries, focus, piece.id) !== 'hidden') continue;
    const at = centres.get(shownAncestor(entries, focus, piece.id).piece.id);
    if (at !== undefined) centres.set(piece.id, at);
  }

  return centres;
};

export const whileMeasuring = (transitioned: string, drawn: Drawn): string =>
  transitioned
    .split(', ')
    .filter(
      (property) =>
        property !== 'width' &&
        property !== 'height' &&
        (drawn === 'hidden' || property !== 'visibility'),
    )
    .join(', ');
