import { isProject } from '../domain/project';
import type { ProjectStore } from '../ports/project-store';

const key = 'working-title:project';

// shortcut: one JSON blob in localStorage, moved to IndexedDB, until #2 saves pieces, links and a library pick together.
export const projectStore = (): ProjectStore => ({
  load: async () => {
    const saved = localStorage.getItem(key);
    if (saved === null) return undefined;
    const project: unknown = JSON.parse(saved);
    if (!isProject(project)) throw new Error(`${key} holds something that is not a project`);
    return project;
  },
  save: async (project) => {
    localStorage.setItem(key, JSON.stringify(project));
  },
});
