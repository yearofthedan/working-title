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

export const nameOn = (panel: HTMLElement): string => panel.querySelector('h2')?.textContent ?? '';

export const holdsTheFocus = (element: HTMLElement): boolean => element === document.activeElement;

export const caretIn = (field: HTMLTextAreaElement): number | null => field.selectionStart;

export const heightOf = (element: HTMLElement): number => element.getBoundingClientRect().height;

export const displayOf = (panel: HTMLElement): string => getComputedStyle(panel).display;

export const widthOf = (panel: HTMLElement): number => panel.getBoundingClientRect().width;
