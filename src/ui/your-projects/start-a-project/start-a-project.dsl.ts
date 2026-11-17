import type { Driver } from '../../../test-helpers/driver';

export interface StartAProjectWriter {
  typesTheTitle(text: string): Promise<void>;
  pressesStart(): Promise<void>;
  cancelsTheStart(): Promise<void>;
}

export const startAProjectWriterOn = (driver: Driver): StartAProjectWriter => ({
  typesTheTitle: (text) => driver.type(text, 'Title'),
  pressesStart: () => driver.click('button', 'Start project'),
  cancelsTheStart: () => driver.click('button', 'Cancel'),
});
