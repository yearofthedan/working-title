import type { Driver } from '../../../test-helpers/driver';
import { startRowWriterOn, type StartRowWriter } from '../start-row/start-row.dsl';

export interface ProjectListWriter extends StartRowWriter {
  startsAProject(): Promise<void>;
  startsAProjectTitled(title: string): Promise<void>;
  startsAProjectWithNoTitle(): Promise<void>;
}

export const projectListWriterOn = (driver: Driver): ProjectListWriter => ({
  ...startRowWriterOn(driver),
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
});
