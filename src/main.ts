import { projectStore } from './adapters/local-storage-project-store';
import { openProject } from './application/project';
import { snowflakeExtended } from './methods/snowflake-extended';
import { renderFocus } from './ui/focus/focus';

// The composition root: no layer may build another, so they are wired here.
export const main = async (main: HTMLElement) => {
  renderFocus(main, await openProject(snowflakeExtended, projectStore()));
};

const element = document.querySelector('main');
if (element) await main(element);
