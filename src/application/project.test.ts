import { describe, expect, it } from 'vite-plus/test';
import { elaborate, newProject, type Project } from '../domain/project';
import type { ProjectStore } from '../ports/project-store';
import { ids } from '../test-helpers/ids';
import { toyMethod } from '../test-helpers/toy-method';
import { openProject } from './project';

const names = ['Root', 'Item 1', 'Item 2'];
const typed = 'a title with "quotes" and a line\nbreak';

const storeOf = (project?: Project): ProjectStore => ({
  load: async () => project,
  save: async () => undefined,
});

const copyingStore = (): ProjectStore & { saved: () => Project | undefined } => {
  let kept: Project | undefined;
  return {
    saved: () => kept,
    load: async () => structuredClone(kept),
    save: async (project) => {
      kept = structuredClone(project);
    },
  };
};

const item2Of = (pieces: readonly { readonly id: string }[]): { readonly id: string } => {
  const item = pieces[2];
  if (item === undefined) throw new Error('the project has no item 2');
  return item;
};

describe('opening a project', () => {
  it('lists the root and its children in order, named for what they are, each with an empty first facet', async () => {
    const focus = await openProject(toyMethod, storeOf(), ids());
    expect(focus.pieces.map(({ name }) => name)).toEqual(names);
    expect(focus.pieces.map(({ facets }) => facets[0]?.text)).toEqual(names.map(() => ''));
  });

  it('reads the text the root holds', async () => {
    const started = elaborate(newProject(toyMethod, ids()), 'id-1', 'note', 'a note');
    const focus = await openProject(toyMethod, storeOf(started), ids());
    expect(focus.pieces[0]?.facets[0]?.text).toBe('a note');
  });

  it('lists the root first and its children by their order, however the store holds them', async () => {
    const started = newProject(toyMethod, ids());
    const shuffled = { ...started, pieces: [...started.pieces].reverse() };
    const focus = await openProject(toyMethod, storeOf(shuffled), ids());
    expect(focus.pieces.map(({ id }) => id)).toEqual(['id-1', 'id-2', 'id-3']);
    expect(focus.pieces.map(({ name }) => name)).toEqual(names);
  });

  it('refuses to open where the store cannot read what it holds', async () => {
    const store: ProjectStore = {
      load: async () => {
        throw new Error('holds something that is not a project');
      },
      save: async () => undefined,
    };
    await expect(openProject(toyMethod, store, ids())).rejects.toThrow('is not a project');
  });

  it('saves the text typed into a child under the ids the app mints, leaving the root and the other child alone', async () => {
    const store = copyingStore();
    const focus = await openProject(toyMethod, store);
    await focus.elaborate(item2Of(focus.pieces).id, 'title', typed);
    expect(store.saved()?.pieces.map(({ facets }) => facets['title'] ?? '')).toEqual([
      '',
      '',
      typed,
    ]);
  });

  it('reads the text back on the next open', async () => {
    const store = copyingStore();
    const first = await openProject(toyMethod, store, ids());
    await first.elaborate(item2Of(first.pieces).id, 'title', typed);

    const reopened = await openProject(toyMethod, store, ids());
    expect(reopened.pieces[2]?.facets[0]?.text).toBe(typed);
  });
});
