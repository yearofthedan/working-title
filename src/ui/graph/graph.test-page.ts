import * as browser from 'vite-plus/test/browser';
import { drawnKinds, type Drawn } from './graph';

const inThePage = (elements: readonly (HTMLElement | SVGElement)[]): HTMLElement[] =>
  elements.filter((element) => element instanceof HTMLElement);

export const everyCard = (): HTMLElement[] =>
  inThePage(browser.page.getByRole('group', { includeHidden: true }).elements());

const kindOf = (card: HTMLElement): Drawn | undefined =>
  drawnKinds.find((kind) => card.classList.contains(kind));

export const cards = (kind: Drawn): HTMLElement[] =>
  everyCard().filter((card) => kindOf(card) === kind);

export const focused = (): HTMLElement => {
  const [card] = cards('focus');
  if (card === undefined) throw new Error('no piece is drawn as the focus');
  return card;
};

export const headingOf = (card: HTMLElement): HTMLElement => {
  const heading = inThePage(
    browser.page.getByRole('heading', { includeHidden: true }).elements(),
  ).find((one) => card.contains(one));
  if (heading === undefined) throw new Error('no heading is drawn on the card');
  return heading;
};

export const nameOf = (card: HTMLElement): string => headingOf(card).textContent ?? '';

export const named = (kind: Drawn, name: string): HTMLElement => {
  const card = everyCard().find((one) => kindOf(one) === kind && nameOf(one) === name);
  if (card === undefined) throw new Error(`no piece named ${name} is drawn as a ${kind}`);
  return card;
};

export const currentCards = (): HTMLElement[] =>
  everyCard().filter((card) => card.getAttribute('aria-current') === 'location');

export const legendOf = (card: HTMLElement): HTMLElement => card.querySelector('legend')!;

export const facetOf = (card: HTMLElement): HTMLElement => card.querySelector('.facet')!;

export const shownSentenceOf = (card: HTMLElement): HTMLElement => card.querySelector('.shown')!;

export const sentenceFieldOf = (card: HTMLElement): HTMLTextAreaElement => {
  const field = browser.page
    .getByLabelText('One-sentence summary', { exact: true })
    .elements()
    .find((element) => card.contains(element));
  if (!(field instanceof HTMLTextAreaElement)) {
    throw new Error('the card has no one-sentence summary field');
  }
  return field;
};

export const labelOf = (card: HTMLElement): HTMLElement => sentenceFieldOf(card).labels![0]!;

const buttonsIn = (card: HTMLElement): HTMLElement[] =>
  inThePage(browser.page.getByRole('button', { includeHidden: true }).elements()).filter((button) =>
    card.contains(button),
  );

export const addButtonOf = (card: HTMLElement): HTMLElement => {
  const button = inThePage(
    browser.page.getByRole('button', { name: /^Add a scene$/i, includeHidden: true }).elements(),
  ).find((one) => card.contains(one));
  if (button === undefined) throw new Error('the card has no add button');
  return button;
};

export const addButtonIsFirst = (card: HTMLElement): boolean =>
  buttonsIn(card)[0] === addButtonOf(card);

export const positionOf = (
  card: HTMLElement,
): { readonly left: string; readonly top: string; readonly width: string } => ({
  left: card.style.left,
  top: card.style.top,
  width: card.style.width,
});

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

const visible = (element: Element): boolean => {
  const { display, opacity } = getComputedStyle(element);
  return display !== 'none' && opacity !== '0' && element.getClientRects().length > 0;
};

export const timesDrawn = (card: HTMLElement, sentence: string): number =>
  inThePage(browser.page.getByRole('textbox', { includeHidden: true }).elements()).filter(
    (field) =>
      card.contains(field) &&
      field instanceof HTMLTextAreaElement &&
      field.value === sentence &&
      visible(field),
  ).length +
  inThePage(browser.page.getByText(sentence, { exact: true }).elements()).filter(
    (element) => card.contains(element) && visible(element),
  ).length;

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
