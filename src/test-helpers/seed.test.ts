import { describe, expect, it } from 'vite-plus/test';
import { aProject, aProjectWithScenesUnder, beat, scene, story } from './seed';

describe('a seeded project', () => {
  it('holds the beats the seed names, in their place', () => {
    const { pieces } = aProject(story(beat(), beat(), beat()));

    expect(pieces.map(({ kind, order, parent }) => `${kind} ${order} ${parent}`)).toEqual([
      'story 0 null',
      `beat 0 ${pieces[0]!.id}`,
      `beat 1 ${pieces[0]!.id}`,
      `beat 2 ${pieces[0]!.id}`,
    ]);
  });

  it('holds a piece a beat or a scene carries', () => {
    const facets = { 'list-line': 'Maren rows out' };
    const { pieces } = aProject(story(beat(scene({ facets }))));

    expect(pieces.map(({ kind, facets: text }) => [kind, text])).toEqual([
      ['story', {}],
      ['beat', {}],
      ['scene', facets],
    ]);
  });

  it('puts a beat its scenes, one after another, and no scenes under the others', () => {
    const { pieces } = aProject(story(beat(), beat(scene(), scene()), beat()));
    const scenes = pieces.filter(({ kind }) => kind === 'scene');

    expect(scenes.map(({ order }) => order)).toEqual([0, 1]);
    expect(scenes.map(({ parent }) => parent)).toEqual([pieces[2]!.id, pieces[2]!.id]);
  });

  it('holds more beats than the method starts a project with', () => {
    const six = Array.from({ length: 6 }, () => beat());
    const { pieces } = aProject(story(...six));

    expect(pieces.filter(({ kind }) => kind === 'beat')).toHaveLength(6);
  });

  it('takes the beat the name says, by its place among the beats', async () => {
    const { pieces } = await aProjectWithScenesUnder('Beat 4', 1);

    expect(pieces.map(({ kind, order }) => `${kind} ${order}`)).toEqual([
      'story 0',
      'beat 0',
      'beat 1',
      'beat 2',
      'beat 3',
      'scene 0',
    ]);
    expect(pieces.at(-1)!.parent).toBe(pieces[4]!.id);
  });

  it('refuses a beat a project has none of', async () => {
    await expect(aProjectWithScenesUnder('Beat 9', 1)).rejects.toThrow('a project has no Beat 9');
  });
});
