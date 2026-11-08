import { projectStore } from './adapters/local-storage-project-store';
import { openProject } from './application/project';
import { snowflakeExtended } from './methods/snowflake-extended';
import { type NewVersion, renderApp } from './ui/app/app.dom';

export const startApp = async (page: ParentNode, newVersion?: NewVersion): Promise<() => void> =>
  renderApp(page, await openProject(snowflakeExtended, projectStore()), newVersion);
