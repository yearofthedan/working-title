export interface Facet {
  readonly id: string;
  readonly label: string;
}

export interface PieceKind {
  readonly id: string;
  readonly facets: readonly Facet[];
}

// shortcut: a method's one kind, and no kinds under it, until #2 adds the pieces that branch.
export interface Method {
  readonly name: string;
  readonly version: number;
  readonly rootKind: PieceKind;
}

export interface FacetText {
  readonly [facetId: string]: string;
}

export interface Piece {
  readonly kindId: string;
  readonly facets: FacetText;
}

export interface Project {
  readonly method: string;
  readonly version: number;
  readonly root: Piece;
}

export const newProject = (method: Method): Project => ({
  method: method.name,
  version: method.version,
  root: { kindId: method.rootKind.id, facets: {} },
});

/**
 * Whether a stored value can be read as a project: every facet's text is a string, since that
 * is all the app ever renders or writes. The method and version are not compared, so a project
 * from another version opens and keeps the facets its ids do not name; #2 owns acting on them.
 */
export const isProject = (value: unknown): value is Project => {
  if (typeof value !== 'object' || value === null) return false;
  const { method, version, root } = value as Project;
  if (typeof method !== 'string' || typeof version !== 'number') return false;
  if (typeof root?.facets !== 'object' || root.facets === null) return false;
  return Object.values(root.facets).every((text) => typeof text === 'string');
};

export const elaborate = (project: Project, facetId: string, text: string): Project => ({
  ...project,
  root: { ...project.root, facets: { ...project.root.facets, [facetId]: text } },
});
