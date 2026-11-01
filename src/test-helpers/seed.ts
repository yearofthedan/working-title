import { projectStore } from '../adapters/local-storage-project-store';
import { openProject } from '../application/project';
import { branch, newProject, type Project } from '../domain/project';
import { snowflakeExtended } from '../methods/snowflake-extended';
import type { ProjectStore } from '../ports/project-store';
import { ids } from './ids';

export interface Seed {
  readonly beats: number;
  readonly scenesUnder?: { readonly beat: number; readonly scenes: number };
}

export type SeededProject = Project;

export const seededProject = (seed: Seed): SeededProject => {
  const newId = ids();
  const started = newProject(snowflakeExtended, newId);
  const [root, ...starts] = started.pieces;
  if (seed.beats > starts.length) {
    throw new Error(`a project starts with ${starts.length} beats, not ${seed.beats}`);
  }
  const kept = starts.slice(0, seed.beats);
  let project: SeededProject = { ...started, pieces: [root, ...kept] };

  const under = seed.scenesUnder;
  if (under === undefined) return project;

  const parent = kept[under.beat - 1];
  if (parent === undefined) {
    throw new Error(`${seed.beats} beats leaves no beat ${under.beat} to put scenes under`);
  }
  const kind = snowflakeExtended.startingChildren.kind.childKind!;
  for (let at = 0; at < under.scenes; at += 1) {
    project = branch(project, parent.id, kind, newId());
  }
  return project;
};

const inMemory = (): ProjectStore => {
  let held: Project | undefined;
  return {
    load: async () => held,
    save: async (project) => {
      held = project;
    },
  };
};

const placeOfBeat = async (beat: string): Promise<number> => {
  const { root } = await openProject(snowflakeExtended, inMemory());
  const place = root.children.findIndex((child) => child.name === beat) + 1;
  if (place === 0) throw new Error(`a project has no ${beat}`);
  return place;
};

export const aProjectWithScenesUnder = async (
  beat: string,
  scenes: number,
): Promise<SeededProject> => {
  const place = await placeOfBeat(beat);
  return seededProject({ beats: place, scenesUnder: { beat: place, scenes } });
};

export const storesTheProject = async (project: SeededProject): Promise<void> => {
  await projectStore().save(project);
};
