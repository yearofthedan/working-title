import { projectStore } from './adapters/local-storage-project-store';
import { openProject } from './application/project';
import { snowflakeExtended } from './methods/snowflake-extended';
import { renderGraph } from './ui/graph/graph.dom';

export const startApp = async (page: ParentNode): Promise<void> => {
  const header = page.querySelector<HTMLElement>('header');
  if (header === null) throw new Error('the page has no <header>');
  const main = page.querySelector<HTMLElement>('main');
  if (main === null) throw new Error('the page has no <main>');
  const panel = page.querySelector<HTMLElement>('aside');
  if (panel === null) throw new Error('the page has no <aside>');
  await renderGraph({ header, main, panel }, await openProject(snowflakeExtended, projectStore()));
};
