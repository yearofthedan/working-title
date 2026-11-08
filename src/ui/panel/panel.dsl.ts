import type { Driver } from '../../test-helpers/driver';

export interface PanelWriter {
  closesThePanel(): Promise<void>;
  putsTheFocusIn(label: string): Promise<void>;
  presses(key: string): Promise<void>;
  tabsForward(): Promise<void>;
  tabsBackward(): Promise<void>;
  typesKeyByKey(text: string): Promise<void>;
}

/* shortcut: the driver writes a key as {key}, and a letter there reads case-insensitively, so an
   uppercase letter is written as the shift sequence that presses it; upgrade when the driver takes
   a character and presses it as itself. */
const keyThatTypes = (character: string): string =>
  character === character.toLowerCase() ? character : `Shift>}${character}{/Shift`;

export const panelWriterOn = (driver: Driver): PanelWriter => ({
  closesThePanel: () => driver.click('button', 'Close'),
  putsTheFocusIn: (label) => driver.focus('textbox', label),
  presses: (key) => driver.press(key === 'Esc' ? 'Escape' : key),
  tabsForward: () => driver.press('Tab'),
  tabsBackward: () => driver.press('Shift+Tab'),
  typesKeyByKey: async (text) => {
    for (const character of text) await driver.press(keyThatTypes(character));
  },
});
