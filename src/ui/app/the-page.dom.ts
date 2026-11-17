export interface NewVersion {
  readonly waiting: Promise<void>;
  reload(): void;
}

export interface ThePage {
  readonly header: HTMLElement;
  readonly main: HTMLElement;
  readonly name: HTMLElement;
}

export const thePageParts = (page: ParentNode): ThePage => {
  const header = page.querySelector<HTMLElement>('header');
  if (header === null) throw new Error('the page has no <header>');
  const main = page.querySelector<HTMLElement>('main');
  if (main === null) throw new Error('the page has no <main>');
  const name = header.querySelector<HTMLElement>('h1');
  if (name === null) throw new Error('the page has no <h1>');
  return { header, main, name };
};

export const announceWhenWaiting = (header: HTMLElement, newVersion: NewVersion): void => {
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
