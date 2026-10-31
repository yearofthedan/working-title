import { describe, expect, it } from 'vite-plus/test';
import type { PieceView } from '../../application/project';
import { drawnAs, drawnKinds, moveFrom, onScreen, pathTo, shownAncestor, treeOf } from './graph';

const piece = (name: string, children: readonly PieceView[] = []): PieceView => ({
  id: name,
  name,
  facets: [],
  children,
});

const story = piece('The story', [
  piece('Beat 1'),
  piece('Beat 2', [piece('Scene 1'), piece('Scene 2')]),
  piece('Beat 3'),
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

describe('whether a piece is on screen', () => {
  const main = { width: 1000, height: 800 };

  it('holds a box sitting exactly on every edge', () => {
    expect(onScreen({ left: 0, top: 0, width: 1000, height: 800 }, main)).toBe(true);
  });

  it('refuses a box 1 px over the left edge', () => {
    expect(onScreen({ left: -1, top: 0, width: 100, height: 100 }, main)).toBe(false);
  });

  it('refuses a box 1 px over the right edge', () => {
    expect(onScreen({ left: 901, top: 0, width: 100, height: 100 }, main)).toBe(false);
  });

  it('refuses a box 1 px over the top edge', () => {
    expect(onScreen({ left: 0, top: -1, width: 100, height: 100 }, main)).toBe(false);
  });

  it('refuses a box 1 px over the bottom edge', () => {
    expect(onScreen({ left: 0, top: 701, width: 100, height: 100 }, main)).toBe(false);
  });
});
