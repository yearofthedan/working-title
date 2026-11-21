import {
  branch as withBranch,
  elaborate as withFacet,
  newProject,
  type Method,
  type Piece,
  type PieceDefinition,
  type Project,
} from '../domain/project';
import type { ProjectStore } from '../ports/project-store';

export type { ProjectsFolder, ProjectsFolderChooser } from '../ports/projects-folder';

export interface FacetView {
  readonly id: string;
  readonly label: string;
  readonly text: string;
}

export interface PieceView {
  readonly id: string;
  readonly name: string;
  readonly facets: readonly FacetView[];
  readonly longFacets: readonly FacetView[];
  readonly children: readonly PieceView[];
  readonly plural?: string;
  readonly childLabel?: string;
}

export interface OpenProject {
  readonly title: string;
  readonly root: PieceView;
  readonly read: (pieceId: string) => PieceView;
  readonly elaborate: (pieceId: string, facetId: string, text: string) => Promise<void>;
  readonly branch: (
    pieceId: string,
  ) => Promise<{ readonly project: OpenProject; readonly added: string }>;
}

const definitionsOf = (method: Method): ReadonlyMap<string, PieceDefinition> => {
  const withChildren = (definition: PieceDefinition): readonly PieceDefinition[] =>
    definition.childDefinition === undefined
      ? [definition]
      : [definition, ...withChildren(definition.childDefinition)];
  return new Map(
    [method.rootDefinition, method.startingChildren.definition]
      .flatMap(withChildren)
      .map((definition): [string, PieceDefinition] => [definition.id, definition]),
  );
};

// shortcut: a child is named for its definition and its place, until the method's own names arrive with their guidance in #4.
const listed = (project: Project, method: Method): PieceView => {
  const definitions = definitionsOf(method);

  const listedUnder = (piece: Piece, definition: PieceDefinition, name: string): PieceView => ({
    id: piece.id,
    name,
    facets: definition.facets
      .filter(({ long }) => long !== true)
      .map(({ id, label }) => ({ id, label, text: piece.facets[id] ?? '' })),
    longFacets: definition.facets
      .filter(({ long }) => long === true)
      .map(({ id, label }) => ({ id, label, text: piece.facets[id] ?? '' })),
    ...(definition.plural === undefined ? {} : { plural: definition.plural }),
    ...(definition.childDefinition === undefined
      ? {}
      : { childLabel: definition.childDefinition.label }),
    children: project.pieces
      .filter(({ parent }) => parent === piece.id)
      .sort((one, other) => one.order - other.order)
      .map((child, at) => {
        const childDefinition = definitions.get(child.definition)!;
        return listedUnder(child, childDefinition, `${childDefinition.label} ${at + 1}`);
      }),
  });

  const root = project.pieces.find(({ parent }) => parent === null)!;
  return listedUnder(root, method.rootDefinition, method.rootDefinition.label);
};

const pieceIn = (root: PieceView, pieceId: string): PieceView | undefined => {
  if (root.id === pieceId) return root;
  for (const child of root.children) {
    const found = pieceIn(child, pieceId);
    if (found !== undefined) return found;
  }
  return undefined;
};

export const openProject = async (
  method: Method,
  store: ProjectStore,
  newId: () => string = () => crypto.randomUUID(),
): Promise<OpenProject> => {
  let project = (await store.load()) ?? newProject(method, newId);
  const save = () => store.save(project);

  const projectOf = (): OpenProject => ({
    title: project.title,
    root: listed(project, method),

    read: (pieceId) => {
      const found = pieceIn(listed(project, method), pieceId);
      if (found === undefined) throw new Error(`the project has no piece ${pieceId}`);
      return found;
    },

    elaborate: (pieceId, facetId, text) => {
      project = withFacet(project, pieceId, facetId, text);
      return save();
    },

    branch: async (pieceId) => {
      const piece = project.pieces.find(({ id }) => id === pieceId)!;
      const definition = definitionsOf(method).get(piece.definition)!.childDefinition!;
      const id = newId();
      project = withBranch(project, pieceId, definition, id);
      await save();
      return { project: projectOf(), added: id };
    },
  });

  return projectOf();
};

export const startProject = async (
  method: Method,
  store: ProjectStore,
  title: string,
  newId: () => string = () => crypto.randomUUID(),
): Promise<OpenProject> => {
  await store.save(newProject(method, newId, title));
  return openProject(method, store, newId);
};
