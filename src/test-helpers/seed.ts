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
const beatDefinition = snowflakeExtended.rootDefinition.childDefinition!.id;
const sceneDefinition = snowflakeExtended.rootDefinition.childDefinition!.childDefinition!.id;

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
