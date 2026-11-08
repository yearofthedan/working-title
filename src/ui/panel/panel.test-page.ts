import * as browser from 'vite-plus/test/browser';
import type { Locator } from 'vite-plus/test/browser';

export const thePanelOn = (name: string) => {
  const panel = browser.page.getByRole('complementary', { name, exact: true, includeHidden: true });
  return {
    panel,
    name: panel.getByRole('heading', { level: 2, includeHidden: true }),
    actions: {
      close: panel.getByRole('button', { name: 'Close', exact: true, includeHidden: true }),
    },
    field: (label: string): Locator => panel.getByLabelText(label, { exact: true }),
  };
};

export const keysHeardOnThePage = (): { readonly keys: readonly string[]; stop(): void } => {
  const keys: string[] = [];
  const listener = (event: KeyboardEvent): void => {
    keys.push(event.key);
  };
  document.addEventListener('keydown', listener);
  return { keys, stop: () => document.removeEventListener('keydown', listener) };
};
