import { projectStore } from '../adapters/local-storage-project-store';
import { branch, newProject, type Project } from '../domain/project';
import { snowflakeExtended } from '../methods/snowflake-extended';
import { ids } from './ids';

export interface Seed {
  readonly beats: number;
  readonly scenesUnder?: { readonly beat: number; readonly scenes: number };
}

export type SeededProject = Project;

export const seededProject = (seed: Seed): SeededProject => {
  const newId = ids();
  const started = newProject(snowflakeExtended, newId);
  const [root, ...beats] = started.pieces;
  const kept = beats.slice(0, seed.beats);
  let project: SeededProject = { ...started, pieces: [root, ...kept] };

  const under = seed.scenesUnder;
  if (under === undefined) return project;

  const kind = snowflakeExtended.startingChildren.kind.childKind!;
  for (let at = 0; at < under.scenes; at += 1) {
    project = branch(project, kept[under.beat - 1].id, kind, newId());
  }
  return project;
};

export const storesTheProject = async (project: SeededProject): Promise<void> => {
  await projectStore().save(project);
};
