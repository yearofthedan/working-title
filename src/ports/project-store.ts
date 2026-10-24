import type { Project, StoredProject } from '../domain/project';

export interface ProjectStore {
  load(): Promise<StoredProject | undefined>;
  save(project: Project): Promise<void>;
}
