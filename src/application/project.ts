import { elaborate as withFacet, newProject, type Method, type Project } from '../domain/project';
import type { ProjectStore } from '../ports/project-store';

export interface FacetView {
  readonly id: string;
  readonly label: string;
  readonly text: string;
}

export interface Focus {
  readonly facets: readonly FacetView[];
  readonly elaborate: (facetId: string, text: string) => Promise<void>;
}

export const openProject = async (method: Method, store: ProjectStore): Promise<Focus> => {
  const project: Project = (await store.load()) ?? newProject(method);
  const save = () => store.save(project);
  // The story is the only piece so far, so it is always the focus: shortcut, until #2 adds
  // pieces beside and under it.
  return {
    facets: method.rootKind.facets.map(({ id, label }) => ({
      id,
      label,
      text: project.root.facets[id] ?? '',
    })),
    elaborate: (facetId, text) => {
      Object.assign(project, withFacet(project, facetId, text));
      return save();
    },
  };
};
