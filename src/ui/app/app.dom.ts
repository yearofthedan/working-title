import type { OpenProject, PieceView } from '../../application/project';
import { renderGraph } from '../graph/graph.dom';
import { thePanel } from '../panel/panel.dom';

export interface NewVersion {
  readonly waiting: Promise<void>;
  reload(): void;
}

const announceWhenWaiting = (header: HTMLElement, newVersion: NewVersion): void => {
  const notice = document.createElement('p');
  notice.setAttribute('role', 'status');
  header.append(notice);
  void newVersion.waiting.then(() => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Reload';
    button.addEventListener('click', () => newVersion.reload());
    notice.append('A new version is ready. ', button);
  });
};

export const renderApp = async (
  page: ParentNode,
  project: OpenProject,
  newVersion?: NewVersion,
): Promise<() => void> => {
  const header = page.querySelector<HTMLElement>('header');
  if (header === null) throw new Error('the page has no <header>');
  const main = page.querySelector<HTMLElement>('main');
  if (main === null) throw new Error('the page has no <main>');
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

  const panel = thePanel({ elaborate: relay, close: closeBeside });
  main.after(panel.element);

  const pathNav = (path: readonly PieceView[]): void => {
    let nav = header.querySelector('nav');
    if (nav === null) {
      nav = document.createElement('nav');
      nav.setAttribute('aria-label', 'Where you are');
      header.append(nav);
    }

    const current = path.at(-1);
    const list = document.createElement('ol');
    for (const piece of path) {
      const item = document.createElement('li');
      if (piece.id === current?.id) {
        item.setAttribute('aria-current', 'location');
        item.textContent = piece.name;
      } else {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = piece.name;
        button.addEventListener('click', () => graph.goTo(piece.id));
        item.append(button);
      }
      list.append(item);
    }
    nav.replaceChildren(list);
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

  const documentKeys = new AbortController();
  document.addEventListener(
    'keydown',
    (event) => {
      const target = event.target instanceof Node ? event.target : null;
      if (graph.element.contains(target)) return;
      graph.keys(event);
    },
    { signal: documentKeys.signal },
  );

  if (newVersion !== undefined) announceWhenWaiting(header, newVersion);

  return () => {
    documentKeys.abort();
    graph.stop();
    graph.element.remove();
    panel.element.remove();
  };
};
