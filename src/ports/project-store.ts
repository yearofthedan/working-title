import type { Project } from '../domain/project';

export interface ProjectStore {
  load(): Promise<Project | undefined>;
  save(project: Project): Promise<void>;
}
