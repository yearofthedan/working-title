import type { PieceView } from './application/project';
import { strings } from './ui/strings';

export interface NewVersion {
  readonly waiting: Promise<void>;
  reload(): void;
}

export interface TheShell {
  readonly main: HTMLElement;
  setTitle(title: string): void;
  showPath(path: readonly PieceView[], onGoTo: (pieceId: string) => void): void;
}

export const renderShell = (root: ParentNode, newVersion?: NewVersion): TheShell => {
  const header = root.querySelector<HTMLElement>('header');
  if (header === null) throw new Error('the page has no <header>');
  const main = root.querySelector<HTMLElement>('main');
  if (main === null) throw new Error('the page has no <main>');
  const name = header.querySelector<HTMLElement>('h1');
  if (name === null) throw new Error('the page has no <h1>');

  if (newVersion !== undefined) {
    const notice = document.createElement('p');
    notice.setAttribute('role', 'status');
    header.append(notice);
    void newVersion.waiting.then(() => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = strings.shell.reload;
      button.addEventListener('click', () => newVersion.reload());
      notice.append(strings.shell.newVersionIsReady, button);
    });
  }

  return {
    main,
    setTitle: (title) => {
      name.textContent = title;
    },
    showPath: (path, onGoTo) => {
      let nav = header.querySelector('nav');
      if (nav === null) {
        nav = document.createElement('nav');
        nav.setAttribute('aria-label', strings.shell.whereYouAre);
        name.after(nav);
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
          button.addEventListener('click', () => onGoTo(piece.id));
          item.append(button);
        }
        list.append(item);
      }
      nav.replaceChildren(list);
    },
  };
};
