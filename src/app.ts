import { fileSystemFolders, type DirectoryPicker } from './adapters/file-system-folders';
import { projectStore } from './adapters/local-storage-project-store';
import { openProject, startProject, type OpenProject } from './application/project';
import { snowflakeExtended } from './methods/snowflake-extended';
import type { ProjectStore } from './ports/project-store';
import { renderHeader, type NewVersion } from './ui/header/header.dom';
import { renderProject, type ProjectScreen } from './ui/project/project.dom';
import { renderYourProjects } from './ui/your-projects/your-projects.dom';
import { strings } from './ui/strings/strings';

export interface StartUp {
  readonly newVersion?: NewVersion;
  readonly store?: ProjectStore;
  readonly picker?: DirectoryPicker;
}

export const startApp = async (root: ParentNode, startUp: StartUp = {}): Promise<() => void> => {
  const { newVersion, store = projectStore(), picker = window } = startUp;

  const main = root.querySelector<HTMLElement>('main');
  if (main === null) throw new Error('the page has no <main>');

  const header = renderHeader(newVersion);
  main.before(header.element);

  const keys = new AbortController();
  document.addEventListener('keydown', (event) => app?.keys(event), { signal: keys.signal });

  let app: ProjectScreen | undefined;
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
      app = await renderProject(header, main, opened, { enterTheCurrentPiece: entered });
    });
  };

  const screen = renderYourProjects({
    chooser: fileSystemFolders(snowflakeExtended, picker),
    showingYourProjects: (draw) =>
      show(() => {
        header.setTitle(strings.header.yourProjectsTitle);
        draw();
      }),
    start: async (title) => {
      await showTheProject(await startProject(snowflakeExtended, store, title), true);
    },
  });

  const showTheFirstScreen = (): Promise<void> =>
    show(() => {
      header.setTitle(strings.header.appTitle);
      main.replaceChildren(screen.element);
    });

  if ((await store.load()) === undefined) await showTheFirstScreen();
  else await showTheProject(await openProject(snowflakeExtended, store));

  return () => {
    keys.abort();
    app?.stop();
    header.element.remove();
  };
};
