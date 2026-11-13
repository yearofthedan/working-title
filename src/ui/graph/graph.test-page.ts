import * as browser from 'vite-plus/test/browser';
import type { Locator } from 'vite-plus/test/browser';
import { inThePage, partsOf, theCard } from '../card/card.test-page';
import { type CardLook } from '../card/card';

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

const groups = (): Locator => browser.page.getByRole('group', { includeHidden: true });
const toolbars = (): Locator => browser.page.getByRole('toolbar', { includeHidden: true });

const theCurrentPiece = (): Locator => browser.page.getByElement('[aria-current="location"]');

const looks: Readonly<Record<CardLook, () => Locator>> = {
  current: () => groups().and(theCurrentPiece()),
  hidden: () => groups().and(browser.page.getByElement('[inert]')),
  chip: () =>
    toolbars()
      .filter({ has: theCurrentPiece() })
      .getByRole('group', { includeHidden: true })
      .and(browser.page.getByElement(':not([aria-current])')),
  card: () =>
    toolbars().filter({ hasNot: theCurrentPiece() }).getByRole('group', { includeHidden: true }),
};

export const holdsTheFocus = (part: Locator): boolean =>
  part.elements().some((element) => element.contains(document.activeElement));

export const theGraph = () => ({
  pane: browser.page.getByRole('main'),
  look: (look: CardLook): Locator => looks[look](),
  card: (look: CardLook, name: string) =>
    partsOf(
      looks[look]().and(
        browser.page.getByRole('group', { name, exact: true, includeHidden: true }),
      ),
    ),
  piece: theCard,
  on: (look: CardLook) => partsOf(looks[look]()),
});
