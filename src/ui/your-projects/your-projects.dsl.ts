import type { Driver } from '../../test-helpers/driver';
import type { StepAction } from '../../test-helpers/steps';
import {
  projectsFolderSeesOn,
  projectsFolderWriterOn,
  type ProjectsFolderSees,
  type ProjectsFolderWriter,
} from './projects-folder/projects-folder.dsl';
import { projectListWriterOn, type ProjectListWriter } from './project-list/project-list.dsl';

export interface YourProjectsWriter extends ProjectsFolderWriter, ProjectListWriter {}

export interface YourProjectsSees extends ProjectsFolderSees {}

export const yourProjectsWriterOn = (driver: Driver): YourProjectsWriter => ({
  ...projectsFolderWriterOn(driver),
  ...projectListWriterOn(driver),
});

export const yourProjectsSeesOn = (driver: Driver): YourProjectsSees => ({
  ...projectsFolderSeesOn(driver),
});

export const yourProjectsSteps = (writer: YourProjectsWriter): Record<string, StepAction> => ({
  'the writer starts a project titled "{title}"': ({ title }) => writer.startsAProjectTitled(title),
  'the writer starts a project with no title': () => writer.startsAProjectWithNoTitle(),
});
