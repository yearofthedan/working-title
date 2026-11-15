import { fileSystemFolders, type DirectoryPicker } from './adapters/file-system-folders';
import { projectStore } from './adapters/local-storage-project-store';
import {
  openProject,
  startProject,
  untitledProjectTitle,
  type OpenProject,
} from './application/project';
import { snowflakeExtended } from './methods/snowflake-extended';
import type { ProjectStore } from './ports/project-store';
import type { ProjectsFolder } from './ports/projects-folder';
import { announceWhenWaiting, renderApp, thePageParts, type NewVersion } from './ui/app/app.dom';
import { refusalFor } from './ui/projects/choosing-the-projects-folder';
import {
  choosingTheProjectsFolder,
  type ChoosingTheProjectsFolder,
} from './ui/projects/choosing-the-projects-folder.dom';
import { yourProjects } from './ui/projects/your-projects.dom';

export interface StartUp {
  readonly newVersion?: NewVersion;
  readonly store?: ProjectStore;
  readonly picker?: DirectoryPicker;
}

export const startApp = async (page: ParentNode, startUp: StartUp = {}): Promise<() => void> => {
  const {
    newVersion,
    store = projectStore(),
    picker = window as unknown as DirectoryPicker,
  } = startUp;
  const { header, main, name } = thePageParts(page);
  if (newVersion !== undefined) announceWhenWaiting(header, newVersion);

  const chooser = fileSystemFolders(snowflakeExtended, picker);
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

  const showYourProjects = (folder: ProjectsFolder): Promise<void> =>
    show(() => {
      name.textContent = 'Your projects';
      const screen = yourProjects(folder.name, {
        freeNameFor: (title) => folder.freeNameFor(title),
        start: async (title) => {
          await folder.start(title);
          await showTheProject(await startProject(snowflakeExtended, store, title), true);
        },
      });
      main.replaceChildren(screen.element);
    });

  const showTheFirstScreen = (): Promise<void> =>
    show(() => {
      name.textContent = 'working-title';
      const screen = choosingTheProjectsFolder({ choose: () => void chooseAFolder(screen) });
      main.replaceChildren(screen.element);
    });

  const chooseAFolder = async (screen: ChoosingTheProjectsFolder): Promise<void> => {
    const chosen = await chooser.choose();
    if (chosen === undefined) return;
    const ownTitle = await chosen.ownTitle();
    if (ownTitle !== undefined) {
      screen.refuse(refusalFor(ownTitle === '' ? untitledProjectTitle : ownTitle));
      return;
    }
    await showYourProjects(chosen);
  };

  if ((await store.load()) === undefined) await showTheFirstScreen();
  else await showTheProject(await openProject(snowflakeExtended, store));

  return () => stop();
};
