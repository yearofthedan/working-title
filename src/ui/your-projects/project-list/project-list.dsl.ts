import type { Driver } from '../../../test-helpers/driver';
import { startRowWriterOn, type StartRowWriter } from '../start-row/start-row.dsl';

export interface ProjectListWriter extends StartRowWriter {
  startsAProject(): Promise<void>;
  startsAProjectTitled(title: string): Promise<void>;
  startsAProjectWithNoTitle(): Promise<void>;
}

export const projectListWriterOn = (driver: Driver): ProjectListWriter => {
  const row = startRowWriterOn(driver);
  const startsAProject = (): Promise<void> => driver.click('button', 'Start a project');
  return {
    ...row,
    startsAProject,
    startsAProjectTitled: async (title) => {
      await startsAProject();
      await row.typesTheTitle(title);
      await row.pressesStart();
    },
    startsAProjectWithNoTitle: async () => {
      await startsAProject();
      await row.pressesStart();
    },
  };
};
