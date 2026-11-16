import type { DirectoryPicker } from '../adapters/file-system-folders';
import { startApp } from '../app';
import type { ProjectStore } from '../ports/project-store';
import type { NewVersion } from '../ui/app/app.dom';
import { inMemory } from './seed';

const stops = new Map<ParentNode, () => void>();

let store: ProjectStore = inMemory();
let picker: DirectoryPicker | undefined;

export interface Staging {
  readonly store?: ProjectStore;
  readonly newVersion?: NewVersion;
  readonly picker?: DirectoryPicker;
}

export const stopTheApp = (): void => {
  for (const stop of stops.values()) stop();
  stops.clear();
  picker = undefined;
};

export const openTheApp = async (page: ParentNode = document, on: Staging = {}): Promise<void> => {
  stops.get(page)?.();
  if (on.store !== undefined) store = on.store;
  if (on.picker !== undefined) picker = on.picker;
  stops.set(page, await startApp(page, { store, newVersion: on.newVersion, picker }));
};

export const reopenTheApp = async (): Promise<void> => {
  const staged = picker;
  stopTheApp();

  const main = document.querySelector<HTMLElement>('main');
  const width = main?.style.width ?? '';
  const label = main?.getAttribute('aria-label');

  const header = document.createElement('header');
  header.append(document.createElement('h1'));
  const freshMain = document.createElement('main');
  freshMain.style.width = width;
  if (label !== null && label !== undefined) freshMain.setAttribute('aria-label', label);

  document.querySelector('header')?.replaceWith(header);
  main?.replaceWith(freshMain);

  await openTheApp(document, { picker: staged });
};
