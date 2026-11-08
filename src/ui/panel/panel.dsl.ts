import type { Driver } from '../../test-helpers/driver';

export interface PanelWriter {
  closesThePanel(): Promise<void>;
  putsTheFocusIn(label: string): Promise<void>;
  presses(key: string): Promise<void>;
  tabsForward(): Promise<void>;
  tabsBackward(): Promise<void>;
  typesKeyByKey(text: string): Promise<void>;
}

export const panelWriterOn = (driver: Driver): PanelWriter => ({
  closesThePanel: () => driver.click('button', 'Close'),
  putsTheFocusIn: (label) => driver.focus('textbox', label),
  presses: (key) => driver.press(key === 'Esc' ? 'Escape' : key),
  tabsForward: () => driver.press('Tab'),
  tabsBackward: () => driver.press('Shift+Tab'),
  typesKeyByKey: async (text) => {
    for (const character of text) await driver.press(character);
  },
});
