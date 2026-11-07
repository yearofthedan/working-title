import { openProject, type OpenProject } from '../application/project';
import type { FacetText, Piece, Project } from '../domain/project';
import { snowflakeExtended } from '../methods/snowflake-extended';
import type { ProjectStore } from '../ports/project-store';
import { ids } from './ids';

export type SeededProject = Project;

export interface PieceSeed {
  readonly kind: string;
  readonly facets?: FacetText;
  readonly children?: readonly PieceSeed[];
}

const rootKind = snowflakeExtended.rootKind.id;
const beatKind = snowflakeExtended.startingChildren.kind.id;
const sceneKind = snowflakeExtended.startingChildren.kind.childKind!.id;

export const story = (...beats: readonly PieceSeed[]): PieceSeed => ({
  kind: rootKind,
  children: beats,
});
export const beat = (...scenes: readonly PieceSeed[]): PieceSeed => ({
  kind: beatKind,
  children: scenes,
});
export const scene = (overrides: Omit<PieceSeed, 'kind'> = {}): PieceSeed => ({
  kind: sceneKind,
  ...overrides,
});

const piecesOf = (
  seed: PieceSeed,
  parent: string | null,
  order: number,
  newId: () => string,
): readonly Piece[] => {
  const { kind, facets = {}, children = [] } = seed;
  const piece: Piece = { id: newId(), kind, parent, order, facets };
  return [piece, ...children.flatMap((child, at) => piecesOf(child, piece.id, at, newId))];
};

export const aProject = (root: PieceSeed): SeededProject => ({
  method: snowflakeExtended.name,
  version: snowflakeExtended.version,
  pieces: piecesOf(root, null, 0, ids()),
});

export const inMemory = (): ProjectStore => {
  let held: Project | undefined;
  return {
    load: async () => held,
    save: async (project) => {
      held = project;
    },
  };
};

export const anInMemoryProject = async (
  seed?: SeededProject,
): Promise<{ store: ProjectStore; project: OpenProject }> => {
  const store = inMemory();
  if (seed !== undefined) await store.save(seed);
  return { store, project: await openProject(snowflakeExtended, store) };
};

const placeOfBeat = async (beatName: string): Promise<number> => {
  const { root } = await openProject(snowflakeExtended, inMemory());
  const place = root.children.findIndex((child) => child.name === beatName) + 1;
  if (place === 0) throw new Error(`a project has no ${beatName}`);
  return place;
};

export const aProjectWithScenesUnder = async (
  beatName: string,
  scenes: number,
): Promise<SeededProject> => {
  const place = await placeOfBeat(beatName);
  const under = beat(...Array.from({ length: scenes }, () => scene()));
  return aProject(story(...Array.from({ length: place - 1 }, () => beat()), under));
};
