import * as browser from 'vite-plus/test/browser';

export const whereTheProjectsAreKept = () => {
  const screen = browser.page.getByRole('region', {
    name: 'Choose where to keep your projects',
    exact: true,
    includeHidden: true,
  });
  const refusal = screen.getByRole('alert', { includeHidden: true });
  return {
    screen,
    chooseAFolder: screen.getByRole('button', {
      name: 'Choose a folder…',
      exact: true,
      includeHidden: true,
    }),
    refusal,
    refusalIcon: refusal.getByElement('svg'),
  };
};

export const yourProjects = () => ({
  startAProject: browser.page.getByRole('button', {
    name: 'Start a project',
    exact: true,
    includeHidden: true,
  }),
  said: browser.page.getByText(/(will make|made) a folder named/),
  title: browser.page.getByLabelText('Title', { exact: true }),
  startProject: browser.page.getByRole('button', {
    name: 'Start project',
    exact: true,
    includeHidden: true,
  }),
  cancel: browser.page.getByRole('button', {
    name: 'Cancel',
    exact: true,
    includeHidden: true,
  }),
  startFailed: browser.page.getByRole('alert', { includeHidden: true }),
});
