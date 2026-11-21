import { describe, expect, it } from 'vite-plus/test';
import { aProject, beat, scene, story } from './seed';

describe('a seeded project', () => {
  it('holds the beats the seed names, in their place', () => {
    const { pieces } = aProject(story(beat(), beat(), beat()));

    expect(
      pieces.map(({ definition, order, parent }) => `${definition} ${order} ${parent}`),
    ).toEqual([
      'story 0 null',
      `beat 0 ${pieces[0]!.id}`,
      `beat 1 ${pieces[0]!.id}`,
      `beat 2 ${pieces[0]!.id}`,
    ]);
  });

  it('holds the facets a scene carries', () => {
    const facets = { 'list-line': 'Maren rows out' };
    const { pieces } = aProject(story(beat(scene({ facets }))));

    expect(pieces.map(({ definition, facets: text }) => [definition, text])).toEqual([
      ['story', {}],
      ['beat', {}],
      ['scene', facets],
    ]);
  });

  it('puts a beat its scenes, one after another, and no scenes under the others', () => {
    const { pieces } = aProject(story(beat(), beat(scene(), scene()), beat()));
    const scenes = pieces.filter(({ definition }) => definition === 'scene');

    expect(scenes.map(({ order }) => order)).toEqual([0, 1]);
    expect(scenes.map(({ parent }) => parent)).toEqual([pieces[2]!.id, pieces[2]!.id]);
  });

  it('holds more beats than the method starts a project with', () => {
    const six = Array.from({ length: 6 }, () => beat());
    const { pieces } = aProject(story(...six));

    expect(pieces.filter(({ definition }) => definition === 'beat')).toHaveLength(6);
  });
});
