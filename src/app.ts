import { fileSystemFolders, type DirectoryPicker } from './adapters/file-system-folders';
import { projectStore } from './adapters/local-storage-project-store';
import { openProject, startProject, type OpenProject } from './application/project';
import { snowflakeExtended } from './methods/snowflake-extended';
import type { ProjectStore } from './ports/project-store';
import { announceWhenWaiting, renderApp, thePageParts, type NewVersion } from './ui/app/app.dom';
import { yourProjects } from './ui/your-projects/your-projects.dom';

export interface StartUp {
  readonly newVersion?: NewVersion;
  readonly store?: ProjectStore;
  readonly picker?: DirectoryPicker;
}

export const startApp = async (page: ParentNode, startUp: StartUp = {}): Promise<() => void> => {
  const { newVersion, store = projectStore(), picker = window } = startUp;
  const { header, main, name } = thePageParts(page);
  if (newVersion !== undefined) announceWhenWaiting(header, newVersion);

  let stop = (): void => {};
  let shown = false;

  // shortcut: a change of screen fades only after the first one, and only its DOM swap is inside the transition; upgrade when a screen's own work belongs inside its fade.
  const show = async (update: () => void | Promise<void>): Promise<void> => {
    if (!shown || document.startViewTransition === undefined) {
      shown = true;
      await update();
      return;
    }
    await document.startViewTransition(update).updateCallbackDone;
  };

  const showTheProject = async (opened: OpenProject, entered = false): Promise<void> => {
    await show(async () => {
      stop = await renderApp(page, opened, { enterTheCurrentPiece: entered });
    });
  };

  const screen = yourProjects({
    chooser: fileSystemFolders(snowflakeExtended, picker),
    showingYourProjects: (draw) =>
      show(() => {
        name.textContent = 'Your projects';
        draw();
      }),
    start: async (title) => {
      await showTheProject(await startProject(snowflakeExtended, store, title), true);
    },
  });

  const showTheFirstScreen = (): Promise<void> =>
    show(() => {
      name.textContent = 'working-title';
      main.replaceChildren(screen.element);
    });

  if ((await store.load()) === undefined) await showTheFirstScreen();
  else await showTheProject(await openProject(snowflakeExtended, store));

  return () => stop();
};
