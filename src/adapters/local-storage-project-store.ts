import type { Project } from '../domain/project';
import type { ProjectStore } from '../ports/project-store';

const key = 'working-title:project';

// shortcut: one JSON blob in localStorage, moved to IndexedDB when #2 saves pieces
// and links together and picks a library.
export const projectStore = (): ProjectStore => ({
  load: async () => {
    const saved = localStorage.getItem(key);
    return saved === null ? undefined : (JSON.parse(saved) as Project);
  },
  save: async (project) => {
    localStorage.setItem(key, JSON.stringify(project));
  },
});
