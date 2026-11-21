export const untitledProjectTitle = 'Untitled project';

export interface FacetDefinition {
  readonly id: string;
  readonly label: string;
  readonly long?: boolean;
}

export interface PieceDefinition {
  readonly id: string;
  readonly label: string;
  readonly plural?: string;
  readonly facets: readonly FacetDefinition[];
  readonly childDefinition?: PieceDefinition;
}

export interface Method {
  readonly name: string;
  readonly version: number;
  readonly rootDefinition: PieceDefinition;
  readonly startingChildren: { readonly definition: PieceDefinition; readonly count: number };
}

export interface FacetText {
  readonly [facetId: string]: string;
}

export interface Piece {
  readonly id: string;
  readonly definition: string;
  readonly parent: string | null;
  readonly order: number;
  readonly facets: FacetText;
}

export interface Project {
  readonly title: string;
  readonly method: string;
  readonly version: number;
  readonly pieces: readonly Piece[];
}

export interface ProjectWithoutTitle {
  readonly method: string;
  readonly version: number;
  readonly pieces: readonly Piece[];
}

export interface ProjectFromVersion1 {
  readonly method: string;
  readonly version: number;
  readonly root: { readonly definition: string; readonly facets: FacetText };
}

export type StoredProject = Project | ProjectWithoutTitle | ProjectFromVersion1;

const startingChildren = (method: Method, root: Piece, newId: () => string): readonly Piece[] =>
  Array.from({ length: method.startingChildren.count }, (_, order) => ({
    id: newId(),
    definition: method.startingChildren.definition.id,
    parent: root.id,
    order,
    facets: {},
  }));

export const newProject = (method: Method, newId: () => string, title = ''): Project => {
  const root: Piece = {
    id: newId(),
    definition: method.rootDefinition.id,
    parent: null,
    order: 0,
    facets: {},
  };
  return {
    title,
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
const hasProjectShape = (value: unknown): value is ProjectWithoutTitle => {
  if (value === null) return false;
  const { method, version, pieces } = value as Project;
  if (typeof method !== 'string' || typeof version !== 'number') return false;
  if (!Array.isArray(pieces)) return false;
  return pieces.every(
    (piece: Piece) =>
      typeof piece?.id === 'string' &&
      typeof piece.definition === 'string' &&
      isFacetText(piece.facets),
  );
};

export const isProject = (value: unknown): value is Project =>
  hasProjectShape(value) && 'title' in value && typeof value.title === 'string';

export const isProjectWithoutTitle = (value: unknown): value is ProjectWithoutTitle =>
  hasProjectShape(value) && !('title' in value);

export const isProjectFromVersion1 = (value: unknown): value is ProjectFromVersion1 => {
  if (typeof value !== 'object' || value === null) return false;
  const { method, version, root } = value as ProjectFromVersion1;
  if (typeof method !== 'string' || typeof version !== 'number') return false;
  return typeof root?.definition === 'string' && isFacetText(root.facets);
};

export const readProject = (
  stored: StoredProject | undefined,
  method: Method,
  newId: () => string,
): Project | undefined => {
  if (stored === undefined) return undefined;
  if (!isProjectFromVersion1(stored)) return { title: '', ...stored };
  const root: Piece = {
    id: newId(),
    definition: stored.root.definition,
    parent: null,
    order: 0,
    facets: stored.root.facets,
  };
  return {
    title: '',
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
  definition: PieceDefinition,
  id: string,
): Project => ({
  ...project,
  pieces: [
    ...project.pieces,
    {
      id,
      definition: definition.id,
      parent: parentId,
      order: project.pieces.filter((piece) => piece.parent === parentId).length,
      facets: {},
    },
  ],
});
