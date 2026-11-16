import type { ProjectsFolder } from '../../../application/project';
import { aProjectsFolder } from '../../../test-helpers/folders';
import { root } from '../../../test-helpers/staging';
import { projectList } from './project-list.dom';

export interface Staged {
  readonly folder?: ProjectsFolder;
  readonly start?: (title: string) => Promise<void>;
}

export const mountProjectList = (staged: Staged = {}): void => {
  const mounted = projectList({
    folder: staged.folder ?? aProjectsFolder(),
    start: staged.start ?? (() => Promise.resolve()),
  });
  root('main').append(mounted.element);
};
