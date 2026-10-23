import type { Project, StoredProject } from '../domain/project';

export interface ProjectStore {
  /** What it holds, unread, or nothing where no project has been saved yet. */
  load(): Promise<StoredProject | undefined>;
  save(project: Project): Promise<void>;
}
