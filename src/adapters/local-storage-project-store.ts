import { isProject, isProjectFromVersion1 } from '../domain/project';
import type { ProjectStore } from '../ports/project-store';

const key = 'working-title:project';

// shortcut: one JSON blob in localStorage, moved to IndexedDB when #2 saves pieces
// and links together and picks a library.
export const projectStore = (): ProjectStore => ({
  load: async () => {
    const saved = localStorage.getItem(key);
    if (saved === null) return undefined;
    const project: unknown = JSON.parse(saved);
    // `null` parses where unreadable text throws, so the shape decides: a value the app cannot
    // render is refused rather than read as nothing saved and replaced on the first keystroke.
    // The shape version 1 wrote is readable: `readProject` brings it forward.
    if (!isProject(project) && !isProjectFromVersion1(project)) {
      throw new Error(`${key} holds something that is not a project`);
    }
    return project;
  },
  save: async (project) => {
    localStorage.setItem(key, JSON.stringify(project));
  },
});
