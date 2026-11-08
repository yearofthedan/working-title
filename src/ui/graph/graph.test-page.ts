import * as browser from 'vite-plus/test/browser';
import type { Locator } from 'vite-plus/test/browser';
import { inThePage } from '../card/card.test-page';
import { type CardLook } from '../card/card';

declare module 'vite-plus/test/browser' {
  interface LocatorSelectors {
    getByLook(look: CardLook): Locator;
  }
}

browser.locators.extend({
  getByLook: (look: CardLook) => `css=.${look}`,
});

export const everyCard = (): HTMLElement[] =>
  inThePage(browser.page.getByRole('group', { includeHidden: true }).elements());

export const blurTheFocus = (): void => {
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
};

export const theBodyHolds = (): readonly string[] =>
  [...document.body.children].map((child) => child.tagName.toLowerCase());

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

export interface CardParts {
  readonly card: Locator;
  readonly heading: Locator;
  readonly headingAt: (level: number) => Locator;
  readonly nameButton: Locator;
  readonly buttons: Locator;
  readonly sentence: Locator;
  readonly fields: Locator;
  readonly addButton: Locator;
}

const partsOf = (card: Locator): CardParts => ({
  card,
  heading: card.getByRole('heading', { includeHidden: true }),
  headingAt: (level) => card.getByRole('heading', { level, includeHidden: true }),
  nameButton: card.getByRole('button', { includeHidden: true }).first(),
  buttons: card.getByRole('button', { includeHidden: true }),
  sentence: card.getByLabelText('One-sentence summary', { exact: true }),
  fields: card.getByRole('textbox', { includeHidden: true }),
  addButton: card.getByRole('button', { name: 'Add a scene', exact: true, includeHidden: true }),
});

const aPieceNamed = (name: string): Locator =>
  browser.page.getByRole('group', { name, exact: true, includeHidden: true });

export const holdsTheFocus = (part: Locator): boolean =>
  part.elements().some((element) => element.contains(document.activeElement));

export const theGraph = () => ({
  pane: browser.page.getByRole('main'),
  look: (look: CardLook): Locator => browser.page.getByLook(look),
  card: (look: CardLook, name: string): CardParts =>
    partsOf(browser.page.getByLook(look).and(aPieceNamed(name))),
  piece: (name: string): CardParts => partsOf(aPieceNamed(name)),
  on: (look: CardLook): CardParts => partsOf(browser.page.getByLook(look)),
});
