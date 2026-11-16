import type { Driver } from '../../../test-helpers/driver';
import { reporting, type Evidence } from '../../../test-helpers/steps';

export interface FolderQuestionWriter {
  choosesAFolder(): Promise<void>;
}

export interface FolderQuestionSees {
  tree(markFocus?: boolean): Promise<readonly string[]>;
  says(text: string): Promise<Evidence>;
}

export const folderQuestionWriterOn = (driver: Driver): FolderQuestionWriter => ({
  choosesAFolder: () => driver.click('button', 'Choose a folder…'),
});

export const folderQuestionSeesOn = (driver: Driver): FolderQuestionSees => ({
  tree: (markFocus = false) => driver.tree(markFocus),
  says: async (text) => {
    const said = (await driver.tree())
      .map((line) => /^\s*- alert: (.*)$/.exec(line)?.[1])
      .find((line) => line !== undefined);
    if (said !== text) {
      throw new Error(
        `the app says ${JSON.stringify(said ?? 'nothing')}, not ${JSON.stringify(text)}`,
      );
    }
    return reporting({ role: 'alert' });
  },
});
