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
    pieces: [root],
  };
};

const isFacetText = (value: unknown): value is FacetText =>
  typeof value === 'object' &&
  value !== null &&
  Object.values(value).every((text) => typeof text === 'string');

// shortcut: the method and version a stored value names are not compared, until #2 acts on them.
export const isProject = (value: unknown): value is Project => {
  if (value === null || typeof value !== 'object') return false;
  if (!('method' in value && 'version' in value && 'pieces' in value && 'title' in value))
    return false;
  const { method, version, pieces, title } = value;
  if (typeof method !== 'string' || typeof version !== 'number') return false;
  if (typeof title !== 'string') return false;
  if (!Array.isArray(pieces)) return false;
  return pieces.every(
    (piece: Piece) =>
      typeof piece?.id === 'string' &&
      typeof piece.definition === 'string' &&
      isFacetText(piece.facets),
  );
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
