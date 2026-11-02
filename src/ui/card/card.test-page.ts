import * as browser from 'vite-plus/test/browser';

export const inThePage = (elements: readonly (HTMLElement | SVGElement)[]): HTMLElement[] =>
  elements.filter((element) => element instanceof HTMLElement);

export const headingOf = (card: HTMLElement): HTMLElement => {
  const heading = inThePage(
    browser.page.getByRole('heading', { includeHidden: true }).elements(),
  ).find((one) => card.contains(one));
  if (heading === undefined) throw new Error('no heading is drawn on the card');
  return heading;
};

export const nameOf = (card: HTMLElement): string => headingOf(card).textContent ?? '';

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

export const firstFieldOf = (card: HTMLElement): HTMLElement => {
  const field = inThePage(
    browser.page.getByRole('textbox', { includeHidden: true }).elements(),
  ).find((element) => card.contains(element));
  if (field === undefined) throw new Error('the card has no field');
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

const openBesideIn = (card: HTMLElement): HTMLElement | undefined =>
  inThePage(
    browser.page.getByRole('button', { name: /^Open beside$/i, includeHidden: true }).elements(),
  ).find((one) => card.contains(one));

export const openBesideOf = (card: HTMLElement): HTMLElement => {
  const button = openBesideIn(card);
  if (button === undefined) throw new Error('the card draws no "Open beside" button');
  return button;
};

export const drawsOpenBeside = (card: HTMLElement): boolean => openBesideIn(card) !== undefined;

export const showsOpenBeside = (card: HTMLElement): boolean => {
  const button = openBesideIn(card);
  return button !== undefined && visible(button);
};

export const openBesideIsPressed = (card: HTMLElement): boolean =>
  openBesideOf(card).getAttribute('aria-pressed') === 'true';

export const addButtonIsFirst = (card: HTMLElement): boolean =>
  buttonsIn(card)[0] === addButtonOf(card);

export const positionOf = (
  card: HTMLElement,
): { readonly left: string; readonly top: string; readonly width: string } => ({
  left: card.style.left,
  top: card.style.top,
  width: card.style.width,
});

export const nameButtonOf = (card: HTMLElement): HTMLElement => {
  const button = buttonsIn(card).find((one) => headingOf(card).contains(one));
  if (button === undefined) throw new Error(`${nameOf(card)} is drawn without a name button`);
  return button;
};

const visible = (element: Element): boolean => {
  const { display, opacity, visibility } = getComputedStyle(element);
  return (
    display !== 'none' &&
    opacity !== '0' &&
    visibility !== 'hidden' &&
    element.getClientRects().length > 0
  );
};

export const keysOf = (card: HTMLElement): HTMLElement => {
  const hint = card.querySelector<HTMLElement>('.keys');
  if (hint === null) throw new Error('the card draws no keys line');
  return hint;
};

export const showsTheKeys = (card: HTMLElement): boolean => visible(keysOf(card));

export const holdsTheFocus = (card: HTMLElement): boolean => card === document.activeElement;

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

export const lookOf = (card: HTMLElement): string => card.className;

export const inertOf = (card: HTMLElement): boolean => card.inert;

export const marksCurrent = (card: HTMLElement): boolean =>
  card.getAttribute('aria-current') === 'location';
