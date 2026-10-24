import app from './vite.config';

/* shortcut: Stryker's Vitest runner cannot run browser mode, so it is handed the app's projects
   with the browser one taken out; hand it every project once it can
   (https://stryker-mutator.io/docs/stryker-js/vitest-runner#limitations). */
export default {
  ...app,
  test: {
    ...app.test,
    projects: app.test?.projects?.filter(
      (project) =>
        typeof project === 'object' && 'test' in project && project.test?.name === 'node',
    ),
  },
};
