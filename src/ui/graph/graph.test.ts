import { describe, expect, it } from 'vite-plus/test';
import type { PieceView } from '../../application/project';
import {
  along,
  drawnAs,
  drawnKinds,
  moveFrom,
  nameOfRow,
  pathTo,
  rowStop,
  rowsAround,
  shownAncestor,
  treeOf,
} from './graph';

const piece = (name: string, children: readonly PieceView[] = [], plural?: string): PieceView => ({
  id: name,
  name,
  facets: [],
  ...(plural === undefined ? {} : { plural }),
  children,
});

const story = piece('The story', [
  piece('Beat 1', [], 'Beats'),
  piece('Beat 2', [piece('Scene 1', [], 'Scenes'), piece('Scene 2', [], 'Scenes')], 'Beats'),
  piece('Beat 3', [], 'Beats'),
]);

const entries = treeOf(story);

const ids = (path: readonly { readonly piece: PieceView }[]): readonly string[] =>
  path.map(({ piece: { id } }) => id);

const nowhereVisited: ReadonlyMap<string, string> = new Map();

describe('the tree of a piece', () => {
  it('holds each piece once, with its own level and its parent', () => {
    expect(entries.map(({ piece: { id }, level, parentId }) => [id, level, parentId])).toEqual([
      ['The story', 0, undefined],
      ['Beat 1', 1, 'The story'],
      ['Beat 2', 1, 'The story'],
      ['Scene 1', 2, 'Beat 2'],
      ['Scene 2', 2, 'Beat 2'],
      ['Beat 3', 1, 'The story'],
    ]);
  });
});

describe('how a piece is drawn', () => {
  it('draws the piece in focus, its parent and its children as cards, and its siblings as chips', () => {
    expect(entries.map(({ piece: { id } }) => [id, drawnAs(entries, 'Beat 2', id)])).toEqual([
      ['The story', 'card'],
      ['Beat 1', 'chip'],
      ['Beat 2', 'focus'],
      ['Scene 1', 'card'],
      ['Scene 2', 'card'],
      ['Beat 3', 'chip'],
    ]);
  });

  it('hides what is neither around the focus nor beside it', () => {
    expect(entries.map(({ piece: { id } }) => [id, drawnAs(entries, 'Beat 1', id)])).toEqual([
      ['The story', 'card'],
      ['Beat 1', 'focus'],
      ['Beat 2', 'chip'],
      ['Scene 1', 'hidden'],
      ['Scene 2', 'hidden'],
      ['Beat 3', 'chip'],
    ]);
  });

  it('draws no chip with the story in focus', () => {
    expect(entries.map(({ piece: { id } }) => drawnAs(entries, 'The story', id))).toEqual([
      'focus',
      'card',
      'card',
      'hidden',
      'hidden',
      'card',
    ]);
  });

  it('draws every piece as one of the kinds the driver reads back', () => {
    const drawn = ['The story', 'Beat 1', 'Beat 2'].flatMap((focus) =>
      entries.map(({ piece: { id } }) => drawnAs(entries, focus, id)),
    );

    expect(drawn.filter((kind) => !drawnKinds.includes(kind))).toEqual([]);
  });
});

describe('the piece a hidden one is drawn under', () => {
  it('reads a piece that is drawn as its own ancestor', () => {
    expect(shownAncestor(entries, 'Beat 1', 'Beat 1').piece.id).toBe('Beat 1');
  });

  it('walks up from a hidden piece to the nearest piece that is drawn', () => {
    expect(shownAncestor(entries, 'Beat 1', 'Scene 1').piece.id).toBe('Beat 2');
  });

  it('walks up to the story when even that is hidden', () => {
    expect(shownAncestor(entries, 'Scene 1', 'Beat 1').piece.id).toBe('The story');
  });
});

describe('the rows around a piece', () => {
  it('reads the story alone, then the beats under it', () => {
    expect(rowsAround(entries, 'The story')).toEqual([
      { ids: ['The story'], named: 'The story' },
      { ids: ['Beat 1', 'Beat 2', 'Beat 3'], named: 'Beats', under: 'The story' },
    ]);
  });

  it('reads the parent, the focus with its siblings, then the children', () => {
    expect(rowsAround(entries, 'Beat 2')).toEqual([
      { ids: ['The story'], named: 'The story' },
      { ids: ['Beat 1', 'Beat 2', 'Beat 3'], named: 'Beats', under: 'The story' },
      { ids: ['Scene 1', 'Scene 2'], named: 'Scenes', under: 'Beat 2' },
    ]);
  });

  it('leaves out the children’s row for a piece with no child', () => {
    expect(rowsAround(entries, 'Scene 1')).toEqual([
      { ids: ['Beat 2'], named: 'Beat 2' },
      { ids: ['Scene 1', 'Scene 2'], named: 'Scenes', under: 'Beat 2' },
    ]);
  });

  it('names each row the way the writer hears it', () => {
    expect(rowsAround(entries, 'Beat 2').map(nameOfRow)).toEqual([
      'The story',
      'Beats under The story',
      'Scenes under Beat 2',
    ]);
  });

  it('reads no row before the graph is drawn, when there is no piece to stand around', () => {
    expect(rowsAround([], 'The story')).toEqual([]);
  });
});

describe('the piece a row stops on', () => {
  const beats = rowsAround(entries, 'Beat 2')[1]!;

  it('stops on the first piece of the row that can be brought on screen', () => {
    expect(rowStop(beats, new Set(['Beat 1', 'Beat 2', 'Beat 3']))).toBe('Beat 1');
    expect(rowStop(beats, new Set(['Beat 3']))).toBe('Beat 3');
  });

  it('stops nowhere when no piece of the row can be brought on screen', () => {
    expect(rowStop(beats, new Set(['Scene 1']))).toBeUndefined();
    expect(rowStop(beats, new Set())).toBeUndefined();
  });
});

describe('where the cursor moves along a row', () => {
  const beats = rowsAround(entries, 'Beat 2')[1]!;

  it('walks to the next piece of the row', () => {
    expect(along(beats, 'Beat 1', 'right')).toBe('Beat 2');
  });

  it('walks back to the previous piece of the row', () => {
    expect(along(beats, 'Beat 3', 'left')).toBe('Beat 2');
  });

  it('moves nowhere at the end of the row', () => {
    expect(along(beats, 'Beat 3', 'right')).toBeUndefined();
    expect(along(beats, 'Beat 1', 'left')).toBeUndefined();
  });

  it('moves nowhere from a piece that is not in the row', () => {
    expect(along(beats, 'Scene 1', 'left')).toBeUndefined();
  });
});

describe('where an arrow moves the focus', () => {
  it('goes up to the parent', () => {
    expect(moveFrom(entries, 'Scene 1', 'up', nowhereVisited)).toBe('Beat 2');
  });

  it('goes down to the first child, and to the one last visited where there is one', () => {
    expect(moveFrom(entries, 'Beat 2', 'down', nowhereVisited)).toBe('Scene 1');
    expect(moveFrom(entries, 'Beat 2', 'down', new Map([['Beat 2', 'Scene 2']]))).toBe('Scene 2');
  });

  it('goes left and right to the siblings beside the focus', () => {
    expect(moveFrom(entries, 'Beat 2', 'left', nowhereVisited)).toBe('Beat 1');
    expect(moveFrom(entries, 'Beat 2', 'right', nowhereVisited)).toBe('Beat 3');
  });

  it('goes nowhere up from the story, and nowhere down from a piece with no child', () => {
    expect(moveFrom(entries, 'The story', 'up', nowhereVisited)).toBeUndefined();
    expect(moveFrom(entries, 'Beat 1', 'down', nowhereVisited)).toBeUndefined();
  });

  it('goes nowhere left from the first sibling, and nowhere right from the last', () => {
    expect(moveFrom(entries, 'Beat 1', 'left', nowhereVisited)).toBeUndefined();
    expect(moveFrom(entries, 'Beat 3', 'right', nowhereVisited)).toBeUndefined();
  });

  it('goes nowhere before the graph is drawn, when there is no piece to move from', () => {
    expect(moveFrom([], 'The story', 'up', nowhereVisited)).toBeUndefined();
  });
});

describe('the path to a piece', () => {
  it('reads from the story to the piece, through its ancestors in order', () => {
    expect(ids(pathTo(entries, 'Scene 2'))).toEqual(['The story', 'Beat 2', 'Scene 2']);
  });

  it('reads the story alone for the story itself', () => {
    expect(ids(pathTo(entries, 'The story'))).toEqual(['The story']);
  });
});
