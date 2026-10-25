export interface Facet {
  readonly id: string;
  readonly label: string;
}

export interface PieceKind {
  readonly id: string;
  readonly label: string;
  readonly facets: readonly Facet[];
  readonly childKind?: PieceKind;
}

export interface Method {
  readonly name: string;
  readonly version: number;
  readonly rootKind: PieceKind;
  readonly startingChildren: { readonly kind: PieceKind; readonly count: number };
}

export interface FacetText {
  readonly [facetId: string]: string;
}

export interface Piece {
  readonly id: string;
  readonly kind: string;
  readonly parent: string | null;
  readonly order: number;
  readonly facets: FacetText;
}

export interface Project {
  readonly method: string;
  readonly version: number;
  readonly pieces: readonly Piece[];
}

export interface ProjectFromVersion1 {
  readonly method: string;
  readonly version: number;
  readonly root: { readonly kind: string; readonly facets: FacetText };
}

export type StoredProject = Project | ProjectFromVersion1;

const startingChildren = (method: Method, root: Piece, newId: () => string): readonly Piece[] =>
  Array.from({ length: method.startingChildren.count }, (_, order) => ({
    id: newId(),
    kind: method.startingChildren.kind.id,
    parent: root.id,
    order,
    facets: {},
  }));

export const newProject = (method: Method, newId: () => string): Project => {
  const root: Piece = { id: newId(), kind: method.rootKind.id, parent: null, order: 0, facets: {} };
  return {
    method: method.name,
    version: method.version,
    pieces: [root, ...startingChildren(method, root, newId)],
  };
};

const isFacetText = (value: unknown): value is FacetText =>
  typeof value === 'object' &&
  value !== null &&
  Object.values(value).every((text) => typeof text === 'string');

// shortcut: the method and version a stored value names are not compared, until #2 acts on them.
export const isProject = (value: unknown): value is Project => {
  if (value === null) return false;
  const { method, version, pieces } = value as Project;
  if (typeof method !== 'string' || typeof version !== 'number') return false;
  if (!Array.isArray(pieces)) return false;
  return pieces.every(
    (piece: Piece) =>
      typeof piece?.id === 'string' && typeof piece.kind === 'string' && isFacetText(piece.facets),
  );
};

export const isProjectFromVersion1 = (value: unknown): value is ProjectFromVersion1 => {
  if (typeof value !== 'object' || value === null) return false;
  const { method, version, root } = value as ProjectFromVersion1;
  if (typeof method !== 'string' || typeof version !== 'number') return false;
  return typeof root?.kind === 'string' && isFacetText(root.facets);
};

export const readProject = (
  stored: StoredProject | undefined,
  method: Method,
  newId: () => string,
): Project | undefined => {
  if (!isProjectFromVersion1(stored)) return stored;
  const root: Piece = {
    id: newId(),
    kind: stored.root.kind,
    parent: null,
    order: 0,
    facets: stored.root.facets,
  };
  return {
    method: stored.method,
    version: method.version,
    pieces: [root, ...startingChildren(method, root, newId)],
  };
};

export const elaborate = (
  project: Project,
  pieceId: string,
  facetId: string,
  text: string,
): Project => ({
  ...project,
  pieces: project.pieces.map((piece) =>
    piece.id === pieceId ? { ...piece, facets: { ...piece.facets, [facetId]: text } } : piece,
  ),
});

export const branch = (
  project: Project,
  parentId: string,
  kind: PieceKind,
  id: string,
): Project => ({
  ...project,
  pieces: [
    ...project.pieces,
    {
      id,
      kind: kind.id,
      parent: parentId,
      order: project.pieces.filter((piece) => piece.parent === parentId).length,
      facets: {},
    },
  ],
});
