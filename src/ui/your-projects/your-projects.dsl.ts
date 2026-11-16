import type { Driver } from '../../test-helpers/driver';
import type { StepAction } from '../../test-helpers/steps';
import {
  folderQuestionSeesOn,
  folderQuestionWriterOn,
  type FolderQuestionSees,
  type FolderQuestionWriter,
} from './folder-question/folder-question.dsl';
import { projectListWriterOn, type ProjectListWriter } from './project-list/project-list.dsl';

export interface YourProjectsWriter extends FolderQuestionWriter, ProjectListWriter {}

export interface YourProjectsSees extends FolderQuestionSees {}

export const yourProjectsWriterOn = (driver: Driver): YourProjectsWriter => ({
  ...folderQuestionWriterOn(driver),
  ...projectListWriterOn(driver),
});

export const yourProjectsSeesOn = (driver: Driver): YourProjectsSees => ({
  ...folderQuestionSeesOn(driver),
});

export const yourProjectsSteps = (writer: YourProjectsWriter): Record<string, StepAction> => ({
  'the writer starts a project titled "{title}"': ({ title }) => writer.startsAProjectTitled(title),
  'the writer starts a project with no title': () => writer.startsAProjectWithNoTitle(),
});
