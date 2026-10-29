import {
  branch as withBranch,
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

export interface PieceView {
  readonly id: string;
  readonly name: string;
  readonly facets: readonly FacetView[];
  readonly children: readonly PieceView[];
  readonly childKind?: string;
}

export interface OpenProject {
  readonly pieces: readonly PieceView[];
  readonly elaborate: (pieceId: string, facetId: string, text: string) => Promise<void>;
  readonly branch: (
    pieceId: string,
  ) => Promise<{ readonly project: OpenProject; readonly added: string }>;
}

const kindsOf = (method: Method): ReadonlyMap<string, PieceKind> => {
  const withChildren = (kind: PieceKind): readonly PieceKind[] =>
    kind.childKind === undefined ? [kind] : [kind, ...withChildren(kind.childKind)];
  return new Map(
    [method.rootKind, method.startingChildren.kind]
      .flatMap(withChildren)
      .map((kind): [string, PieceKind] => [kind.id, kind]),
  );
};

// shortcut: a child is named for its kind and its place, until the method's own names arrive with their guidance in #4.
const listed = (project: Project, method: Method): readonly PieceView[] => {
  const kinds = kindsOf(method);

  const listedUnder = (piece: Piece, kind: PieceKind, name: string): PieceView => ({
    id: piece.id,
    name,
    facets: kind.facets.map(({ id, label }) => ({ id, label, text: piece.facets[id] ?? '' })),
    ...(kind.childKind === undefined ? {} : { childKind: kind.childKind.label }),
    children: project.pieces
      .filter(({ parent }) => parent === piece.id)
      .sort((one, other) => one.order - other.order)
      .map((child, at) => {
        const childKind = kinds.get(child.kind)!;
        return listedUnder(child, childKind, `${childKind.label} ${at + 1}`);
      }),
  });

  const root = project.pieces.find(({ parent }) => parent === null)!;
  const story = listedUnder(root, method.rootKind, method.rootKind.label);
  return [story, ...story.children];
};

export const openProject = async (
  method: Method,
  store: ProjectStore,
  newId: () => string = () => crypto.randomUUID(),
): Promise<OpenProject> => {
  let project = readProject(await store.load(), method, newId) ?? newProject(method, newId);
  const save = () => store.save(project);

  const projectOf = (): OpenProject => ({
    pieces: listed(project, method),

    elaborate: (pieceId, facetId, text) => {
      project = withFacet(project, pieceId, facetId, text);
      return save();
    },

    branch: async (pieceId) => {
      const piece = project.pieces.find(({ id }) => id === pieceId)!;
      const kind = kindsOf(method).get(piece.kind)!.childKind!;
      const id = newId();
      project = withBranch(project, pieceId, kind, id);
      await save();
      return { project: projectOf(), added: id };
    },
  });

  return projectOf();
};
