import { describe, expect, it } from 'vite-plus/test';
import { elaborate, newProject, type Project } from '../domain/project';
import { snowflakeExtended } from '../methods/snowflake-extended';
import type { ProjectStore } from '../ports/project-store';
import { openProject } from './project';

/** Ids a test can read. The domain mints them, and nothing here depends on their shape. */
const ids = (): (() => string) => {
  let made = 0;
  return () => `id-${(made += 1)}`;
};

const summary = snowflakeExtended.rootKind.facets[0]?.id ?? '';
const names = ['The story', 'Beat 1', 'Beat 2', 'Beat 3', 'Beat 4', 'Beat 5'];
const typed = "Maren finds the ship's log and learns the sinking was no accident";

const storeOf = (project?: Project): ProjectStore => ({
  load: async () => project,
  save: async () => undefined,
});

/** A store that keeps the project it is given, as the browser's does. */
const keepingStore = (): ProjectStore & { saved: () => Project | undefined } => {
  let kept: Project | undefined;
  return {
    saved: () => kept,
    load: async () => kept,
    save: async (project) => {
      kept = project;
    },
  };
};

const beat2Of = (pieces: readonly { readonly id: string }[]): { readonly id: string } => {
  const beat = pieces[2];
  if (beat === undefined) throw new Error('the project has no beat 2');
  return beat;
};

describe('opening a project', () => {
  it('lists the story and its beats in order, named for what they are, each with an empty sentence', async () => {
    const focus = await openProject(snowflakeExtended, storeOf(), ids());
    expect(focus.pieces.map(({ name }) => name)).toEqual(names);
    expect(focus.pieces.map(({ facets }) => facets[0]?.text)).toEqual(names.map(() => ''));
  });

  it('reads the sentence the story holds', async () => {
    const started = elaborate(newProject(snowflakeExtended, ids()), 'id-1', summary, 'a sentence');
    const focus = await openProject(snowflakeExtended, storeOf(started), ids());
    expect(focus.pieces[0]?.facets[0]?.text).toBe('a sentence');
  });

  it('lists the story first and the beats by their order, however the store holds them', async () => {
    const started = newProject(snowflakeExtended, ids());
    const shuffled = { ...started, pieces: [...started.pieces].reverse() };
    const focus = await openProject(snowflakeExtended, storeOf(shuffled), ids());
    expect(focus.pieces.map(({ id }) => id)).toEqual([
      'id-1',
      'id-2',
      'id-3',
      'id-4',
      'id-5',
      'id-6',
    ]);
    expect(focus.pieces.map(({ name }) => name)).toEqual(names);
  });

  it('refuses to open where the store cannot read what it holds', async () => {
    const store: ProjectStore = {
      load: async () => {
        throw new Error('holds something that is not a project');
      },
      save: async () => undefined,
    };
    await expect(openProject(snowflakeExtended, store, ids())).rejects.toThrow('is not a project');
  });

  it('saves the sentence typed into a beat, leaving the story and the other beats alone', async () => {
    const store = keepingStore();
    // No id source, as `main` wires it: the ids are the app's own.
    const focus = await openProject(snowflakeExtended, store);
    await focus.elaborate(beat2Of(focus.pieces).id, summary, typed);
    expect(store.saved()?.pieces.map(({ facets }) => facets[summary] ?? '')).toEqual([
      '',
      '',
      typed,
      '',
      '',
      '',
    ]);
  });

  it('reads the sentence back on the next open, with the beats in order', async () => {
    const store = keepingStore();
    const first = await openProject(snowflakeExtended, store, ids());
    await first.elaborate(beat2Of(first.pieces).id, summary, typed);

    const reopened = await openProject(snowflakeExtended, store, ids());
    expect(reopened.pieces.map(({ name }) => name)).toEqual(names);
    expect(reopened.pieces[2]?.facets[0]?.text).toBe(typed);
  });
});
