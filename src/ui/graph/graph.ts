import type { PieceView } from '../../application/project';

export interface Entry {
  readonly piece: PieceView;
  readonly level: number;
  readonly parentId?: string;
}

export type Drawn = 'focus' | 'card' | 'chip' | 'hidden';

export const drawnKinds: readonly Drawn[] = ['focus', 'card', 'chip', 'hidden'];

const entryOf = (entries: readonly Entry[], id: string | undefined): Entry | undefined =>
  entries.find((entry) => entry.piece.id === id);

export const treeOf = (root: PieceView, level = 0, parentId?: string): readonly Entry[] => [
  { piece: root, level, parentId },
  ...root.children.flatMap((child) => treeOf(child, level + 1, root.id)),
];

export const childrenOf = (entries: readonly Entry[], id: string): readonly Entry[] =>
  entries.filter((entry) => entry.parentId === id);

export const drawnAs = (entries: readonly Entry[], focus: string, id: string): Drawn => {
  const parent = entryOf(entries, focus)!.parentId;
  if (id === focus) return 'focus';
  if (id === parent || entryOf(entries, id)!.parentId === focus) return 'card';
  if (entryOf(entries, id)!.parentId === parent) return 'chip';
  return 'hidden';
};

export const shownAncestor = (entries: readonly Entry[], focus: string, id: string): Entry => {
  let entry = entryOf(entries, id)!;
  while (drawnAs(entries, focus, entry.piece.id) === 'hidden' && entry.parentId !== undefined) {
    entry = entryOf(entries, entry.parentId)!;
  }
  return entry;
};

export interface Row {
  readonly ids: readonly string[];
  readonly named: string;
  readonly under?: string;
}

export const nameOfRow = (row: Row): string =>
  row.under === undefined ? row.named : `${row.named} under ${row.under}`;

export const rowsAround = (entries: readonly Entry[], focus: string): readonly Row[] => {
  const entry = entryOf(entries, focus);
  if (entry === undefined) return [];

  const rows: Row[] = [];
  const parent = entry.parentId === undefined ? undefined : entryOf(entries, entry.parentId);

  if (parent !== undefined) rows.push({ ids: [parent.piece.id], named: parent.piece.name });

  const siblings = parent === undefined ? [entry] : childrenOf(entries, parent.piece.id);
  rows.push({
    ids: siblings.map((sibling) => sibling.piece.id),
    named: entry.piece.plural ?? entry.piece.name,
    ...(parent === undefined ? {} : { under: parent.piece.name }),
  });

  const children = childrenOf(entries, focus);
  if (children.length > 0) {
    rows.push({
      ids: children.map((child) => child.piece.id),
      named: children[0]!.piece.plural ?? children[0]!.piece.name,
      under: entry.piece.name,
    });
  }

  return rows;
};

export const rowStop = (row: Row, showable: ReadonlySet<string>): string | undefined =>
  row.ids.find((id) => showable.has(id));

export const along = (row: Row, from: string, where: 'left' | 'right'): string | undefined => {
  const at = row.ids.indexOf(from);
  if (at === -1) return undefined;
  const rest = where === 'left' ? row.ids.slice(0, at).reverse() : row.ids.slice(at + 1);
  return rest.at(0);
};

export const moveFrom = (
  entries: readonly Entry[],
  focus: string,
  where: 'up' | 'down' | 'left' | 'right',
  lastVisited: ReadonlyMap<string, string>,
): string | undefined => {
  const parent = entryOf(entries, focus)?.parentId;
  if (where === 'up') return parent;
  if (where === 'down') {
    const children = childrenOf(entries, focus);
    const last = lastVisited.get(focus);
    return (children.find((entry) => entry.piece.id === last) ?? children.at(0))?.piece.id;
  }
  if (parent === undefined) return undefined;
  const siblings = childrenOf(entries, parent);
  const here = siblings.findIndex((entry) => entry.piece.id === focus);
  return siblings[here + (where === 'left' ? -1 : 1)]?.piece.id;
};

export const pathTo = (entries: readonly Entry[], id: string): readonly Entry[] => {
  const path: Entry[] = [];
  let entry = entryOf(entries, id);
  while (entry !== undefined) {
    path.unshift(entry);
    entry = entryOf(entries, entry.parentId);
  }
  return path;
};
