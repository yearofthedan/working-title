import { childrenOf, drawnAs, shownAncestor, type Entry } from './graph';

export interface Sizes {
  readonly current: number;
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
  current: string,
  id: string,
  pane: Pane,
  sizes: Sizes,
  chipWidth: (id: string) => number,
): number => {
  const kind = drawnAs(entries, current, id);
  if (kind === 'current') return Math.min(sizes.current, pane.mainWidth);
  if (kind === 'chip') return chipWidth(id);
  return sizes.cards[shownAncestor(entries, current, id).level] ?? sizes.cards.at(-1)!;
};

export const centresOf = (
  entries: readonly Entry[],
  current: string,
  size: (id: string) => { width: number; height: number },
  pane: Pane,
  sizes: Sizes,
): ReadonlyMap<string, { x: number; y: number }> => {
  const centres = new Map<string, { x: number; y: number }>();
  const centre = pane.width / 2;
  const parentId = entries.find((entry) => entry.piece.id === current)?.parentId;
  const currentWidth = size(current).width;
  const currentHeight = size(current).height;
  const top = Math.max(
    pane.middle - currentHeight / 2,
    pane.top + sizes.gap + (parentId === undefined ? 0 : size(parentId).height),
  );

  centres.set(current, { x: centre, y: top + currentHeight / 2 });

  if (parentId !== undefined) {
    const parentHeight = size(parentId).height;
    centres.set(parentId, { x: centre, y: top - sizes.gap - parentHeight / 2 });
  }

  const below = top + currentHeight + sizes.gap;
  const children = childrenOf(entries, current);
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
  const here = siblings.findIndex((entry) => entry.piece.id === current);
  const sample = siblings.find((entry) => entry.piece.id !== current);
  if (sample !== undefined) {
    const chipTop = top + (currentHeight - size(sample.piece.id).height) / 2;
    let before = centre - currentWidth / 2 - sizes.gap;
    for (const entry of siblings.slice(0, here).reverse()) {
      const { width, height } = size(entry.piece.id);
      before -= width;
      centres.set(entry.piece.id, { x: before + width / 2, y: chipTop + height / 2 });
      before -= sizes.gap;
    }
    let after = centre + currentWidth / 2 + sizes.gap;
    for (const entry of siblings.slice(here + 1)) {
      const { width, height } = size(entry.piece.id);
      centres.set(entry.piece.id, { x: after + width / 2, y: chipTop + height / 2 });
      after += width + sizes.gap;
    }
  }

  for (const { piece } of entries) {
    if (drawnAs(entries, current, piece.id) !== 'hidden') continue;
    const at = centres.get(shownAncestor(entries, current, piece.id).piece.id);
    if (at !== undefined) centres.set(piece.id, at);
  }

  return centres;
};

export const onScreen = (
  centre: { readonly x: number; readonly y: number },
  size: { readonly width: number; readonly height: number },
  pane: { readonly width: number; readonly height: number },
): boolean =>
  centre.x - size.width / 2 >= 0 &&
  centre.x + size.width / 2 <= pane.width &&
  centre.y - size.height / 2 >= 0 &&
  centre.y + size.height / 2 <= pane.height;

export interface Box {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export const slideFor = (
  box: Box,
  pane: { readonly width: number; readonly height: number },
): number | undefined => {
  const left = Math.min(Math.max(box.x - box.width / 2, 0), pane.width - box.width);
  const at = { x: left + box.width / 2, y: box.y };
  return onScreen(at, { width: box.width, height: box.height }, pane) ? at.x - box.x : undefined;
};
