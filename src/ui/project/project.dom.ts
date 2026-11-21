import type { OpenProject, PieceView } from '../../application/project';
import type { TheShell } from '../../shell';
import { renderGraph } from './graph/graph.dom';
import { renderPanel } from './panel/panel.dom';
import { strings } from '../strings/strings';

export interface ProjectHooks {
  readonly enterTheCurrentPiece?: boolean;
}

export interface ProjectScreen {
  keys(event: KeyboardEvent): void;
  stop(): void;
}

export const renderProject = async (
  page: TheShell,
  project: OpenProject,
  hooks: ProjectHooks = {},
): Promise<ProjectScreen> => {
  const { main } = page;
  page.setTitle(project.title === '' ? strings.project.untitledTitle : project.title);
  let held = project;
  let open: string | undefined;

  const relay = async (pieceId: string, facetId: string, text: string): Promise<void> => {
    const saved = held.elaborate(pieceId, facetId, text);
    // shortcut: the app passes a change from the card to the panel and back, until a third consumer needs to know about a change; then move it to an observable on OpenProject.
    if (panel.isOpenOn(pieceId)) panel.show(facetId, text);
    graph.show(pieceId, facetId, text);
    await saved;
  };

  const closeBeside = (): void => {
    const id = open;
    open = undefined;
    panel.close();
    if (id !== undefined) graph.closedBeside(id);
  };

  const panel = renderPanel({ elaborate: relay, close: closeBeside });
  main.after(panel.element);

  const pathNav = (path: readonly PieceView[]): void => {
    page.showPath(path, (pieceId) => graph.goTo(pieceId));
  };

  const graph = renderGraph(held.root, {
    moved: pathNav,
    elaborate: relay,
    branch: async (pieceId) => {
      const { project: next, added } = await held.branch(pieceId);
      held = next;
      return { root: next.root, added };
    },
    toggleBeside: (pieceId) => {
      if (open === pieceId) {
        closeBeside();
        return;
      }
      open = pieceId;
      graph.showOpen(pieceId);
      panel.open(held.read(pieceId));
    },
  });

  main.replaceChildren(graph.element);
  await graph.draw();
  if (hooks.enterTheCurrentPiece === true) graph.enter();

  const keys = (event: KeyboardEvent): void => {
    const target = event.target instanceof Node ? event.target : null;
    if (graph.element.contains(target)) return;
    graph.keys(event);
  };

  return {
    keys,
    stop: () => {
      graph.stop();
      graph.element.remove();
      panel.element.remove();
    },
  };
};
