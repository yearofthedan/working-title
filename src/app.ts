import { projectStore } from './adapters/local-storage-project-store';
import { openProject } from './application/project';
import { snowflakeExtended } from './methods/snowflake-extended';
import { renderApp } from './ui/app/app.dom';

export const startApp = async (page: ParentNode): Promise<() => void> =>
  renderApp(page, await openProject(snowflakeExtended, projectStore()));
