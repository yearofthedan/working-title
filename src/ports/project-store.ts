import type { Project } from '../domain/project';

export interface ProjectStore {
  /** Nothing where no project has been saved yet. */
  load(): Promise<Project | undefined>;
  save(project: Project): Promise<void>;
}
