export interface Facet {
  readonly id: string;
  readonly label: string;
}

export interface PieceKind {
  readonly id: string;
  readonly label: string;
  readonly facets: readonly Facet[];
}

export interface Method {
  readonly name: string;
  readonly version: number;
  readonly rootKind: PieceKind;
  /** The kind a project starts with under its root, and how many of it. */
  readonly startingChildren: { readonly kind: PieceKind; readonly count: number };
}

export interface FacetText {
  readonly [facetId: string]: string;
}

export interface Piece {
  readonly id: string;
  readonly kind: string;
  /** The piece it sits under; the root has none. */
  readonly parent: string | null;
  /** Where it sits among its siblings, from none. */
  readonly order: number;
  readonly facets: FacetText;
}

export interface Project {
  readonly method: string;
  readonly version: number;
  readonly pieces: readonly Piece[];
}

/** The shape version 1 wrote: one root piece, with no id and no order, and nothing under it. */
export interface ProjectFromVersion1 {
  readonly method: string;
  readonly version: number;
  readonly root: { readonly kind: string; readonly facets: FacetText };
}

/** What the store holds: today's flat list, or a save version 1 wrote. */
export type StoredProject = Project | ProjectFromVersion1;

const startingChildren = (method: Method, root: Piece, newId: () => string): readonly Piece[] =>
  Array.from({ length: method.startingChildren.count }, (_, order) => ({
    id: newId(),
    kind: method.startingChildren.kind.id,
    parent: root.id,
    order,
    facets: {},
  }));

/**
 * A project as a new one starts: the root, and the children the method starts it with, in order
 * under it. `newId` is passed in so a test reads the ids it mints.
 */
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

/**
 * Whether a stored value is a project in the shape the app writes, so a piece that names neither
 * itself nor its kind is refused rather than rendered. The method and version are not compared: a
 * project from another version opens and keeps the facets its ids do not name.
 */
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

/** Whether a stored value is a save in the shape version 1 wrote, which `readProject` upgrades. */
export const isProjectFromVersion1 = (value: unknown): value is ProjectFromVersion1 => {
  if (typeof value !== 'object' || value === null) return false;
  const { method, version, root } = value as ProjectFromVersion1;
  if (typeof method !== 'string' || typeof version !== 'number') return false;
  return typeof root?.kind === 'string' && isFacetText(root.facets);
};

/**
 * The project a stored value holds, or nothing where nothing was saved. A save in the shape
 * version 1 wrote becomes its root piece with the children the method starts it with, so the
 * sentence the writer typed survives the upgrade.
 */
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

/** Fill in one facet of one piece, leaving every other piece and facet as it was. */
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
