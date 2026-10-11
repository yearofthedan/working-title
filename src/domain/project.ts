export interface Facet {
  readonly id: string;
  readonly label: string;
}

export interface PieceKind {
  readonly id: string;
  readonly facets: readonly Facet[];
}

/** Snowflake, extended, is the one method so far, so a kind has no parent kind to branch from yet. */
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

export const elaborate = (project: Project, facetId: string, text: string): Project => ({
  ...project,
  root: { ...project.root, facets: { ...project.root.facets, [facetId]: text } },
});
