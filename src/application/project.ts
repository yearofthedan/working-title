import {
  elaborate as withFacet,
  newProject,
  readProject,
  type Method,
  type Piece,
  type PieceKind,
  type Project,
} from '../domain/project';
import type { ProjectStore } from '../ports/project-store';

export interface FacetView {
  readonly id: string;
  readonly label: string;
  readonly text: string;
}

/** A piece as the page shows it: what the writer hears it called, and its facets in turn. */
export interface PieceView {
  readonly id: string;
  readonly name: string;
  readonly facets: readonly FacetView[];
}

export interface Focus {
  readonly pieces: readonly PieceView[];
  readonly elaborate: (pieceId: string, facetId: string, text: string) => Promise<void>;
}

const view = (piece: Piece, kind: PieceKind, name: string): PieceView => ({
  id: piece.id,
  name,
  facets: kind.facets.map(({ id, label }) => ({ id, label, text: piece.facets[id] ?? '' })),
});

/**
 * What the page shows, in order: the story, then the children under it by their order among
 * themselves. A child is named for its kind and its place, since the method's own names for them
 * arrive with the guidance that tells the writer what each is for.
 */
const listed = (project: Project, method: Method): readonly PieceView[] => {
  const root = project.pieces.find(({ parent }) => parent === null)!;
  const children = project.pieces
    .filter(({ parent }) => parent === root.id)
    .sort((one, other) => one.order - other.order);
  const { kind } = method.startingChildren;
  return [
    view(root, method.rootKind, method.rootKind.label),
    ...children.map((piece, at) => view(piece, kind, `${kind.label} ${at + 1}`)),
  ];
};

export const openProject = async (
  method: Method,
  store: ProjectStore,
  newId: () => string = () => crypto.randomUUID(),
): Promise<Focus> => {
  // The focus this returns reads a project as it was when it opened: what is typed is saved, and
  // the next open reads it back.
  const project = readProject(await store.load(), method, newId) ?? newProject(method, newId);
  const save = () => store.save(project);
  return {
    pieces: listed(project, method),
    elaborate: (pieceId, facetId, text) => {
      Object.assign(project, withFacet(project, pieceId, facetId, text));
      return save();
    },
  };
};
