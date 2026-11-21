import { openProject, type OpenProject } from '../application/project';
import type { FacetText, Piece, Project } from '../domain/project';
import { snowflakeExtended } from '../methods/snowflake-extended';
import type { ProjectStore } from '../ports/project-store';
import { ids } from './ids';

export type SeededProject = Project;

export interface PieceSeed {
  readonly definition: string;
  readonly facets?: FacetText;
  readonly children?: readonly PieceSeed[];
}

const rootDefinition = snowflakeExtended.rootDefinition.id;
const beatDefinition = snowflakeExtended.startingChildren.definition.id;
const sceneDefinition = snowflakeExtended.startingChildren.definition.childDefinition!.id;

export const story = (...beats: readonly PieceSeed[]): PieceSeed => ({
  definition: rootDefinition,
  children: beats,
});
export const beat = (...scenes: readonly PieceSeed[]): PieceSeed => ({
  definition: beatDefinition,
  children: scenes,
});
export const scene = (overrides: Omit<PieceSeed, 'definition'> = {}): PieceSeed => ({
  definition: sceneDefinition,
  ...overrides,
});

const piecesOf = (
  seed: PieceSeed,
  parent: string | null,
  order: number,
  newId: () => string,
): readonly Piece[] => {
  const { definition, facets = {}, children = [] } = seed;
  const piece: Piece = { id: newId(), definition, parent, order, facets };
  return [piece, ...children.flatMap((child, at) => piecesOf(child, piece.id, at, newId))];
};

export const aProject = (root: PieceSeed): SeededProject => ({
  title: '',
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

export interface HoldingSaves extends ProjectStore {
  release(): void;
}

export const holdingSaves = (start?: Project): HoldingSaves => {
  let held: Project | undefined = start;
  const waiting: (() => void)[] = [];
  return {
    load: async () => held,
    save: async (project) => {
      held = project;
      const { promise, resolve } = Promise.withResolvers<void>();
      waiting.push(resolve);
      await promise;
    },
    release: () => {
      for (const resolve of waiting.splice(0)) resolve();
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

// shortcut: the story holds the five beats the method starts a project with, the fourth carrying the scenes, until a case needs the scenes under another beat.
export const aProjectWithScenesUnderBeatFour = (scenes: number): SeededProject =>
  aProject(
    story(beat(), beat(), beat(), beat(...Array.from({ length: scenes }, () => scene())), beat()),
  );
