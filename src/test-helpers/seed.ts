import { projectStore } from '../adapters/local-storage-project-store';
import { openProject } from '../application/project';
import { branch, newProject, type Project } from '../domain/project';
import { snowflakeExtended } from '../methods/snowflake-extended';
import type { ProjectStore } from '../ports/project-store';
import { ids } from './ids';

export interface SeededBeat {
  readonly scenes?: number;
}

export interface Seed {
  readonly beats: readonly SeededBeat[];
}

export type SeededProject = Project;

export const seededProject = ({ beats }: Seed): SeededProject => {
  const newId = ids();
  const started = newProject(snowflakeExtended, newId);
  const [root, ...starts] = started.pieces;
  if (beats.length > starts.length) {
    throw new Error(`a project starts with ${starts.length} beats, not ${beats.length}`);
  }

  const kept = starts.slice(0, beats.length);
  const sceneKind = snowflakeExtended.startingChildren.kind.childKind!;
  return beats.reduce<SeededProject>(
    (project, { scenes = 0 }, at) => {
      let under = project;
      for (let scene = 0; scene < scenes; scene += 1) {
        under = branch(under, kept[at]!.id, sceneKind, newId());
      }
      return under;
    },
    { ...started, pieces: [root, ...kept] },
  );
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
  return seededProject({
    beats: Array.from({ length: place }, (_, at) => (at === place - 1 ? { scenes } : {})),
  });
};

export const storesTheProject = async (project: SeededProject): Promise<void> => {
  await projectStore().save(project);
};
