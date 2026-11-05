import * as browser from 'vite-plus/test/browser';

export const inThePage = (elements: readonly (HTMLElement | SVGElement)[]): HTMLElement[] =>
  elements.filter((element) => element instanceof HTMLElement);

export const panelOf = (): HTMLElement => {
  const [panel] = inThePage(
    browser.page.getByRole('complementary', { includeHidden: true }).elements(),
  );
  if (panel === undefined) throw new Error('the page draws no panel');
  return panel;
};

export const fieldFor = (panel: HTMLElement, label: string): HTMLTextAreaElement => {
  const field = browser.page
    .getByLabelText(label, { exact: true })
    .elements()
    .find((element) => panel.contains(element));
  if (!(field instanceof HTMLTextAreaElement)) {
    throw new Error(`the panel has no ${label} field`);
  }
  return field;
};

export const closeButtonOf = (panel: HTMLElement): HTMLElement => {
  const button = inThePage(
    browser.page.getByRole('button', { name: /^Close$/i, includeHidden: true }).elements(),
  ).find((one) => panel.contains(one));
  if (button === undefined) throw new Error('the panel draws no Close button');
  return button;
};

export const nameElementOf = (panel: HTMLElement): HTMLElement => {
  const name = panel.querySelector('h2');
  if (!(name instanceof HTMLElement)) throw new Error('the panel draws no name');
  return name;
};

export const nameOn = (panel: HTMLElement): string => nameElementOf(panel).textContent ?? '';

export const headingOf = (panel: HTMLElement): HTMLElement => {
  const heading = panel.querySelector('div.heading');
  if (!(heading instanceof HTMLElement)) throw new Error('the panel draws no header row');
  return heading;
};

export const holdsTheFocus = (element: HTMLElement): boolean => element === document.activeElement;

export const caretIn = (field: HTMLTextAreaElement): number | null => field.selectionStart;

export const heightOf = (element: HTMLElement): number => element.getBoundingClientRect().height;

export const displayOf = (panel: HTMLElement): string => getComputedStyle(panel).display;

export const widthOf = (panel: HTMLElement): number => panel.getBoundingClientRect().width;

export const theBodyIs = (height: number): void => {
  /* shortcut: the browser test page carries `body { min-height: 100vh }` from its runner, which floors a shorter body; upgrade once the body is not floored. */
  document.body.style.height = `${height}px`;
  document.body.style.minHeight = `${height}px`;
};

export const theBodyFillsTheWindow = (): void => {
  document.body.style.removeProperty('height');
  document.body.style.removeProperty('min-height');
};

export const topOf = (element: HTMLElement): number => element.getBoundingClientRect().top;

export const bottomOf = (element: HTMLElement): number => element.getBoundingClientRect().bottom;

export const insideTheViewport = (element: HTMLElement): boolean =>
  topOf(element) >= 0 && bottomOf(element) <= window.innerHeight;

export const scrollHeightOf = (element: HTMLElement): number => element.scrollHeight;

export const scrollToTheEndOf = (element: HTMLElement): void => {
  element.scrollTop = element.scrollHeight;
};

export const writerCanScroll = (element: HTMLElement): boolean =>
  ['auto', 'scroll'].includes(getComputedStyle(element).overflowY);

export const lineHeightOf = (element: HTMLElement): number =>
  Number.parseFloat(getComputedStyle(element).lineHeight);

export const caretLineBottomOf = (field: HTMLTextAreaElement): number => {
  const padding = Number.parseFloat(getComputedStyle(field).paddingBottom);
  return topOf(field) + field.clientTop + field.scrollHeight - padding - field.scrollTop;
};
