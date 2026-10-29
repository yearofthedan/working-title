import { projectStore } from './adapters/local-storage-project-store';
import { openProject } from './application/project';
import { snowflakeExtended } from './methods/snowflake-extended';
import { renderFocus } from './ui/focus/focus.dom';

export const main = async (main: HTMLElement) => {
  await renderFocus(main, await openProject(snowflakeExtended, projectStore()));
};

const element = document.querySelector('main');
if (element) await main(element);
