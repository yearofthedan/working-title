import type { Driver } from '../../test-helpers/driver';
import { reporting, type Evidence, type StepAction } from '../../test-helpers/steps';

export interface YourProjectsWriter {
  choosesAFolder(): Promise<void>;
  startsAProject(): Promise<void>;
  startsAProjectTitled(title: string): Promise<void>;
  startsAProjectWithNoTitle(): Promise<void>;
  typesTheTitle(text: string): Promise<void>;
  pressesStart(): Promise<void>;
  cancelsTheStart(): Promise<void>;
}

export interface YourProjectsSees {
  tree(markFocus?: boolean): Promise<readonly string[]>;
  says(text: string): Promise<Evidence>;
}

export const yourProjectsWriterOn = (driver: Driver): YourProjectsWriter => ({
  choosesAFolder: () => driver.click('button', 'Choose a folder…'),
  startsAProject: () => driver.click('button', 'Start a project'),
  startsAProjectTitled: async (title) => {
    await driver.click('button', 'Start a project');
    await driver.type(title, 'Title');
    await driver.click('button', 'Start project');
  },
  startsAProjectWithNoTitle: async () => {
    await driver.click('button', 'Start a project');
    await driver.click('button', 'Start project');
  },
  typesTheTitle: (text) => driver.type(text, 'Title'),
  pressesStart: () => driver.click('button', 'Start project'),
  cancelsTheStart: () => driver.click('button', 'Cancel'),
});

export const yourProjectsSeesOn = (driver: Driver): YourProjectsSees => ({
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

export const yourProjectsSteps = (writer: YourProjectsWriter): Record<string, StepAction> => ({
  'the writer starts a project titled "{title}"': ({ title }) => writer.startsAProjectTitled(title),
  'the writer starts a project with no title': () => writer.startsAProjectWithNoTitle(),
});
