import type { ProjectsFolder } from '../../../../application/project';
import { aProjectsFolder } from '../../../../test-helpers/folders';
import { root } from '../../../../test-helpers/staging';
import { renderStartAProject } from './start-a-project.dom';

export interface Staged {
  readonly folder?: ProjectsFolder;
  readonly start?: (title: string) => Promise<void>;
  readonly cancelled?: () => void;
}

export const mountStartRow = (staged: Staged = {}): void => {
  const mounted = renderStartAProject({
    folder: staged.folder ?? aProjectsFolder(),
    start: staged.start ?? (() => Promise.resolve()),
    cancelled: staged.cancelled ?? (() => undefined),
  });
  root('main').append(mounted.element);
};
