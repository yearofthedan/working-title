import { describe, expect, it } from 'vite-plus/test';
import { newProject, type Project } from '../domain/project';
import { snowflakeExtended } from '../methods/snowflake-extended';
import type { ProjectStore } from '../ports/project-store';
import { openProject } from './project';

const storeOf = (project?: Project): ProjectStore => ({
  load: async () => project,
  save: async () => undefined,
});

const summary = snowflakeExtended.rootKind.facets[0]?.id ?? '';

describe('opening a project', () => {
  it('makes a new one where nothing is saved', async () => {
    const focus = await openProject(snowflakeExtended, storeOf());
    expect(focus.facets.map(({ text }) => text)).toEqual(['']);
  });

  it('reads the facets of the story it finds', async () => {
    const project = newProject(snowflakeExtended);
    const focus = await openProject(
      snowflakeExtended,
      storeOf({ ...project, root: { ...project.root, facets: { [summary]: 'a sentence' } } }),
    );
    expect(focus.facets.map(({ text }) => text)).toEqual(['a sentence']);
  });

  it('refuses to open where the store cannot read what it holds', async () => {
    const store: ProjectStore = {
      load: async () => {
        throw new Error('holds something that is not a project');
      },
      save: async () => undefined,
    };
    await expect(openProject(snowflakeExtended, store)).rejects.toThrow('is not a project');
  });

  it('saves what the writer types, and reads it back on the next open', async () => {
    let kept: Project = newProject(snowflakeExtended);
    const store: ProjectStore = {
      load: async () => kept,
      save: async (project) => {
        kept = project;
      },
    };

    const focus = await openProject(snowflakeExtended, store);
    const facet = focus.facets[0];
    if (facet === undefined) throw new Error('the story has no facet');
    await focus.elaborate(facet.id, 'a sentence');

    // The facets a reader holds are what the project looked like when it opened; the typing
    // is in the store, and the next open reads it back.
    expect((await openProject(snowflakeExtended, store)).facets[0]?.text).toBe('a sentence');
  });
});
