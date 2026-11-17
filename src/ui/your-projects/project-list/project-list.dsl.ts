import type { Driver } from '../../../test-helpers/driver';
import {
  startAProjectWriterOn,
  type StartAProjectWriter,
} from '../start-a-project/start-a-project.dsl';

export interface ProjectListWriter extends StartAProjectWriter {
  startsAProject(): Promise<void>;
  startsAProjectTitled(title: string): Promise<void>;
  startsAProjectWithNoTitle(): Promise<void>;
}

export const projectListWriterOn = (driver: Driver): ProjectListWriter => {
  const row = startAProjectWriterOn(driver);
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
