import type { Driver, Within } from '../../test-helpers/driver';

export interface PanelWriter {
  closesThePanel(): Promise<void>;
  putsTheFocusIn(label: string): Promise<void>;
  putsTheFocusOnClose(): Promise<void>;
  presses(key: string): Promise<void>;
  tabsForward(): Promise<void>;
  tabsBackward(): Promise<void>;
  typesKeyByKey(text: string): Promise<void>;
}

export interface PanelWriterOn extends PanelWriter {
  scrollsToTheEnd(): Promise<void>;
}

const verbsIn = (driver: Driver, thePanel?: Within): PanelWriter => ({
  closesThePanel: () => driver.click('button', 'Close', thePanel),
  putsTheFocusIn: (label) => driver.focus('textbox', label, thePanel),
  putsTheFocusOnClose: () => driver.focus('button', 'Close', thePanel),
  presses: (key) => driver.press(key === 'Esc' ? 'Escape' : key),
  tabsForward: () => driver.press('Tab'),
  tabsBackward: () => driver.press('Shift+Tab'),
  typesKeyByKey: async (text) => {
    for (const character of text) await driver.press(character);
  },
});

export function panelWriterOn(driver: Driver): PanelWriter;
export function panelWriterOn(driver: Driver, piece: string): PanelWriterOn;
export function panelWriterOn(driver: Driver, piece?: string): PanelWriter | PanelWriterOn {
  if (piece === undefined) return verbsIn(driver);
  const thePanel: Within = { role: 'complementary', name: piece };
  return {
    ...verbsIn(driver, thePanel),
    // shortcut: wheels over the heading because Vitest's wheel hits the element's centre and a textarea there scrolls itself first, upgrade when the driver's wheel takes a position.
    scrollsToTheEnd: () => driver.scrollToTheEnd('heading', piece, thePanel),
  };
}
