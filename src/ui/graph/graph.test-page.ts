import * as browser from 'vite-plus/test/browser';
import { inThePage, nameOf } from '../card/card.test-page';
import { drawnKinds, type Drawn } from './graph';

export const everyCard = (): HTMLElement[] =>
  inThePage(browser.page.getByRole('group', { includeHidden: true }).elements());

const kindOf = (card: HTMLElement): Drawn | undefined =>
  drawnKinds.find((kind) => card.classList.contains(kind));

export const cards = (kind: Drawn): HTMLElement[] =>
  everyCard().filter((card) => kindOf(card) === kind);

export const current = (): HTMLElement => {
  const [card] = cards('current');
  if (card === undefined) throw new Error('no piece is drawn as the current piece');
  return card;
};

export const named = (kind: Drawn, name: string): HTMLElement => {
  const card = everyCard().find((one) => kindOf(one) === kind && nameOf(one) === name);
  if (card === undefined) throw new Error(`no piece named ${name} is drawn as a ${kind}`);
  return card;
};

export const currentCards = (): HTMLElement[] =>
  everyCard().filter((card) => card.getAttribute('aria-current') === 'location');

export const atCursor = (): Element | null => document.activeElement;

export const blurTheCursor = (): void => {
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
};

export const cardAtCursor = (): HTMLElement | null =>
  everyCard().find((card) => card.contains(document.activeElement)) ?? null;

export const cursorIn = (kind: Drawn): HTMLElement | null => {
  const card = cardAtCursor();
  return card !== null && kindOf(card) === kind ? card : null;
};

export const pane = (): HTMLElement => {
  const [main] = inThePage(browser.page.getByRole('main').elements());
  if (main === undefined) throw new Error('the page has no main');
  return main;
};

export const cursorIsInThePane = (): boolean => pane().contains(document.activeElement);

export const navigationIn = (header: HTMLElement): HTMLElement | null =>
  inThePage(browser.page.getByRole('navigation', { includeHidden: true }).elements()).find(
    (navigation) => header.contains(navigation),
  ) ?? null;

export const altKeySeenFor = async (key: string, what: () => Promise<void>): Promise<boolean[]> => {
  const seen: boolean[] = [];
  const watch = (event: KeyboardEvent): void => {
    if (event.key === key) seen.push(event.altKey);
  };
  document.addEventListener('keydown', watch);
  try {
    await what();
  } finally {
    document.removeEventListener('keydown', watch);
  }
  return seen;
};

export const buttonsFocused = async (what: () => Promise<void>): Promise<string[]> => {
  const focused: string[] = [];
  const watch = (event: FocusEvent): void => {
    if (event.target instanceof HTMLElement && event.target.closest('button') !== null) {
      focused.push(event.target.textContent ?? '');
    }
  };
  document.addEventListener('focusin', watch);
  try {
    await what();
  } finally {
    document.removeEventListener('focusin', watch);
  }
  return focused;
};
