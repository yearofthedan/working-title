import * as browser from 'vite-plus/test/browser';
import { theStartRow } from './start-a-project/start-a-project.test-page';

export const theProjectList = (folder: string) => {
  const screen = browser.page.getByRole('region', {
    name: `In ${folder}`,
    exact: true,
    includeHidden: true,
  });
  return {
    screen,
    noProjectsYet: screen.getByText('No projects yet.', { exact: true }),
    startAProject: screen.getByRole('button', {
      name: 'Start a project',
      exact: true,
      includeHidden: true,
    }),
    row: theStartRow(),
  };
};
