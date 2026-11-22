import type { Project } from '../../../domain/project';
import type { ProjectStore } from '../../../ports/project-store';

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
