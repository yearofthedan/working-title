import { isProject, isProjectFromVersion1 } from '../domain/project';
import type { ProjectStore } from '../ports/project-store';

export const projectStorageKey = 'working-title:project';

// shortcut: one JSON blob in localStorage, until #2 saves pieces and links together and picks a library, which moves it to IndexedDB.
export const projectStore = (storage: Storage = localStorage): ProjectStore => ({
  load: async () => {
    const saved = storage.getItem(projectStorageKey);
    if (saved === null) return undefined;
    const project: unknown = JSON.parse(saved);
    if (!isProject(project) && !isProjectFromVersion1(project)) {
      throw new Error(`${projectStorageKey} holds something that is not a project`);
    }
    return project;
  },
  save: async (project) => {
    storage.setItem(projectStorageKey, JSON.stringify(project));
  },
});
