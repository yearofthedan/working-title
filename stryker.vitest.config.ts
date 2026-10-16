import app from './vite.config';

// Stryker's Vitest runner cannot run browser mode, so it is given the app's projects with
// the browser one taken out, rather than vite.config.ts being shaped for Stryker
// (https://stryker-mutator.io/docs/stryker-js/vitest-runner#limitations).
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
