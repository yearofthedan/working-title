import * as browser from 'vite-plus/test/browser';
import { inThePage, nameOf } from '../card/card.test-page';
import { cardLooks, type CardLook } from '../card/card';

export const everyCard = (): HTMLElement[] =>
  inThePage(browser.page.getByRole('group', { includeHidden: true }).elements());

const kindOf = (card: HTMLElement): CardLook | undefined =>
  cardLooks.find((kind) => card.classList.contains(kind));

export const cards = (kind: CardLook): HTMLElement[] =>
  everyCard().filter((card) => kindOf(card) === kind);

export const current = (): HTMLElement => {
  const [card] = cards('current');
  if (card === undefined) throw new Error('no piece is drawn as the current piece');
  return card;
};

export const named = (kind: CardLook, name: string): HTMLElement => {
  const card = everyCard().find((one) => kindOf(one) === kind && nameOf(one) === name);
  if (card === undefined) throw new Error(`no piece named ${name} is drawn as a ${kind}`);
  return card;
};

export const currentCards = (): HTMLElement[] =>
  everyCard().filter((card) => card.getAttribute('aria-current') === 'location');

export const atFocus = (): Element | null => document.activeElement;

export const blurTheFocus = (): void => {
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
};

export const cardAtFocus = (): HTMLElement | null =>
  everyCard().find((card) => card.contains(document.activeElement)) ?? null;

export const focusIn = (kind: CardLook): HTMLElement | null => {
  const card = cardAtFocus();
  return card !== null && kindOf(card) === kind ? card : null;
};

export const pane = (): HTMLElement => {
  const [main] = inThePage(browser.page.getByRole('main').elements());
  if (main === undefined) throw new Error('the page has no main');
  return main;
};

export const focusIsInThePane = (): boolean => pane().contains(document.activeElement);

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
