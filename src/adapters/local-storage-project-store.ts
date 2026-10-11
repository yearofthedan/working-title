import type { Project } from '../domain/project';
import type { ProjectStore } from '../ports/project-store';

const key = 'working-title:project';

// shortcut: one JSON blob in localStorage, moved to IndexedDB when #2 saves pieces
// and links together and picks a library.
export const projectStore = (): ProjectStore => ({
  load: async () => {
    const saved = localStorage.getItem(key);
    if (saved === null) return undefined;
    const project = JSON.parse(saved) as Project;
    // `null` parses, and so would a value from another version of the stored shape: only a
    // project is a project, and anything else is refused rather than read as nothing saved.
    if (typeof project?.root?.facets !== 'object' || project.root.facets === null) {
      throw new Error(`${key} holds something that is not a project`);
    }
    return project;
  },
  save: async (project) => {
    localStorage.setItem(key, JSON.stringify(project));
  },
});
