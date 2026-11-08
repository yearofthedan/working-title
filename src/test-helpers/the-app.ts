import { openProject } from '../application/project';
import { snowflakeExtended } from '../methods/snowflake-extended';
import type { ProjectStore } from '../ports/project-store';
import { renderApp, type NewVersion } from '../ui/app/app.dom';
import { inMemory } from './seed';

const stops = new Map<ParentNode, () => void>();

let store = inMemory();

export const stopTheApp = (): void => {
  for (const stop of stops.values()) stop();
  stops.clear();
};

export const openTheApp = async (
  page: ParentNode = document,
  held?: ProjectStore,
  newVersion?: NewVersion,
): Promise<void> => {
  stops.get(page)?.();
  if (held !== undefined) store = held;
  stops.set(page, await renderApp(page, await openProject(snowflakeExtended, store), newVersion));
};

export const reopenTheApp = async (): Promise<void> => {
  stopTheApp();

  const main = document.querySelector<HTMLElement>('main');
  const width = main?.style.width ?? '';
  const label = main?.getAttribute('aria-label');

  const header = document.createElement('header');
  header.append(document.createElement('h1'));
  const freshMain = document.createElement('main');
  freshMain.style.width = width;
  if (label !== null && label !== undefined) freshMain.setAttribute('aria-label', label);
  const aside = document.createElement('aside');

  document.querySelector('header')?.replaceWith(header);
  main?.replaceWith(freshMain);
  document.querySelector('aside')?.replaceWith(aside);

  await openTheApp();
};
