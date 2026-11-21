import type { PieceView } from '../../application/project';
import { strings } from '../strings/strings';

export interface NewVersion {
  readonly waiting: Promise<void>;
  reload(): void;
}

export interface Header {
  readonly element: HTMLElement;
  setTitle(title: string): void;
  showPath(path: readonly PieceView[], onGoTo: (pieceId: string) => void): void;
}

export const renderHeader = (newVersion?: NewVersion): Header => {
  const element = document.createElement('header');
  element.className = 'header';
  const name = document.createElement('h1');
  element.append(name);

  if (newVersion !== undefined) {
    const notice = document.createElement('p');
    notice.setAttribute('role', 'status');
    element.append(notice);
    void newVersion.waiting.then(() => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = strings.header.reload;
      button.addEventListener('click', () => newVersion.reload());
      notice.append(strings.header.newVersionIsReady, button);
    });
  }

  return {
    element,
    setTitle: (title) => {
      name.textContent = title;
    },
    showPath: (path, onGoTo) => {
      let nav = element.querySelector('nav');
      if (nav === null) {
        nav = document.createElement('nav');
        nav.setAttribute('aria-label', strings.header.whereYouAre);
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
