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

  it('branches under a piece, saving the new piece after the ones already under it', async () => {
    const store = copyingStore();
    const opened = await openProject(toyMethod, store, ids());

    const one = await opened.branch('id-2');
    const two = await one.focus.branch('id-2');
    const elsewhere = await two.focus.branch('id-3');

    expect([one.added, two.added, elsewhere.added]).toEqual(['id-4', 'id-5', 'id-6']);
    expect(store.saved()?.pieces).toEqual([
      { id: 'id-1', kind: 'root', parent: null, order: 0, facets: {} },
      { id: 'id-2', kind: 'item', parent: 'id-1', order: 0, facets: {} },
      { id: 'id-3', kind: 'item', parent: 'id-1', order: 1, facets: {} },
      { id: 'id-4', kind: 'child', parent: 'id-2', order: 0, facets: {} },
      { id: 'id-5', kind: 'child', parent: 'id-2', order: 1, facets: {} },
      { id: 'id-6', kind: 'child', parent: 'id-3', order: 0, facets: {} },
    ]);
  });

  it('lists the new pieces under their own parent, in order, numbered within that parent', async () => {
    const opened = await openProject(toyMethod, storeOf(), ids());
    const one = await opened.branch('id-2');
    const two = await one.focus.branch('id-2');
    const elsewhere = await two.focus.branch('id-3');

    expect(two.focus.pieces.map(({ name }) => name)).toEqual(names);
    expect(two.focus.pieces.map(({ children }) => children.map(({ name }) => name))).toEqual([
      ['Item 1', 'Item 2'],
      ['Child 1', 'Child 2'],
      [],
    ]);
    expect(elsewhere.focus.pieces[2]?.children.map(({ name }) => name)).toEqual(['Child 1']);
    expect(two.focus.pieces[1]?.children[0]).toEqual({
      id: 'id-4',
      name: 'Child 1',
      facets: [{ id: 'note', label: 'Note', text: '' }],
      children: [],
    });
    expect(two.focus.pieces.map(({ childKind }) => childKind)).toEqual([
      undefined,
      'Child',
      'Child',
    ]);
  });

  it('reads the text back on the next open', async () => {
    const store = copyingStore();
    const first = await openProject(toyMethod, store, ids());
    await first.elaborate(item2Of(first.pieces).id, 'title', typed);

    const reopened = await openProject(toyMethod, store, ids());
    expect(reopened.pieces[2]?.facets[0]?.text).toBe(typed);
  });

  it('opens a save from before a kind could branch, its text kept and nothing under any piece', async () => {
    const atVersion2 = { ...toyMethod, version: 2 };
    const saved = elaborate(newProject(atVersion2, ids()), 'id-2', 'title', 'the first');

    const opened = await openProject(atVersion2, storeOf(saved), ids());

    expect(opened.pieces.map(({ name }) => name)).toEqual(names);
    expect(opened.pieces[1]?.facets[0]?.text).toBe('the first');
    expect(opened.pieces[0]?.children.flatMap(({ children: under }) => under)).toEqual([]);
  });
});
