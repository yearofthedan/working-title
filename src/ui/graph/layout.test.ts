import { describe, expect, it } from 'vite-plus/test';
import type { PieceView } from '../../application/project';
import { treeOf } from './graph';
import { centresOf, onScreen, whileMeasuring, widthOf, type Pane, type Sizes } from './layout';

const piece = (name: string, children: readonly PieceView[] = []): PieceView => ({
  id: name,
  name,
  facets: [],
  children,
});

const story = piece('The story', [
  piece('Beat 1'),
  piece('Beat 2', [piece('Scene 1', [piece('Line 1')]), piece('Scene 2')]),
  piece('Beat 3'),
]);

const fiveBeats = piece('The story', [
  piece('Beat 1'),
  piece('Beat 2'),
  piece('Beat 3'),
  piece('Beat 4'),
  piece('Beat 5'),
]);

const eightScenes = piece('The story', [
  piece(
    'Beat 4',
    Array.from({ length: 8 }, (_, at) => piece(`Scene ${at + 1}`)),
  ),
]);

const sizes: Sizes = { focus: 560, cards: [200, 180, 120], gap: 32 };

const pane = (over: Partial<Pane> = {}): Pane => ({
  width: 1440,
  mainWidth: 1440,
  middle: 450,
  top: 80,
  ...over,
});

const measured =
  (widths: Readonly<Record<string, number>>, heights: Readonly<Record<string, number>> = {}) =>
  (id: string): { width: number; height: number } => ({
    width: widths[id]!,
    height: heights[id] ?? 100,
  });

const eightWidths = {
  'The story': 200,
  'Beat 4': 560,
  'Scene 1': 120,
  'Scene 2': 120,
  'Scene 3': 120,
  'Scene 4': 120,
  'Scene 5': 120,
  'Scene 6': 120,
  'Scene 7': 120,
  'Scene 8': 120,
};

const storyWidths = {
  'The story': 200,
  'Beat 1': 180,
  'Beat 2': 560,
  'Beat 3': 180,
  'Scene 1': 120,
  'Scene 2': 120,
  'Line 1': 120,
};

const storyHeights = {
  'The story': 100,
  'Beat 1': 40,
  'Beat 2': 200,
  'Beat 3': 40,
  'Scene 1': 100,
  'Scene 2': 100,
  'Line 1': 60,
};

describe('the width of a piece', () => {
  const entries = treeOf(story);
  const chip = (): number => 137;

  it('gives the focus the focus width, or main when that is narrower', () => {
    expect(widthOf(entries, 'Beat 2', 'Beat 2', pane(), sizes, chip)).toBe(560);
    expect(
      widthOf(entries, 'Beat 2', 'Beat 2', pane({ width: 400, mainWidth: 400 }), sizes, chip),
    ).toBe(400);
  });

  it('gives a card the width of its level, and the last width past the end', () => {
    expect(widthOf(entries, 'Beat 2', 'The story', pane(), sizes, chip)).toBe(200);
    expect(widthOf(entries, 'Scene 1', 'Line 1', pane(), sizes, chip)).toBe(120);
  });

  it('measures a chip', () => {
    expect(widthOf(entries, 'Beat 2', 'Beat 1', pane(), sizes, chip)).toBe(137);
  });

  it('measures a hidden piece at the card width of its shown ancestor’s level', () => {
    expect(widthOf(entries, 'Beat 1', 'Scene 1', pane(), sizes, chip)).toBe(180);
  });

  it('gives a hidden piece that is its own shown ancestor the width of its own level', () => {
    expect(widthOf(entries, 'Scene 1', 'The story', pane(), sizes, chip)).toBe(200);
  });
});

describe('where the pieces are centred', () => {
  const entries = treeOf(story);
  const size = measured(storyWidths, storyHeights);

  it('centres the focus on the pane’s width, its middle on the pane’s middle when there is room', () => {
    const centres = centresOf(entries, 'Beat 2', size, pane(), sizes);

    expect(centres.get('Beat 2')).toEqual({ x: 720, y: 450 });
  });

  it('puts the parent straight above the focus, a gap between them', () => {
    const centres = centresOf(entries, 'Beat 2', size, pane(), sizes);

    expect(centres.get('The story')).toEqual({ x: 720, y: 268 });
  });

  it('puts the children in one row a gap below the focus, centred on it and a gap apart', () => {
    const centres = centresOf(entries, 'Beat 2', size, pane(), sizes);

    expect(centres.get('Scene 1')).toEqual({ x: 644, y: 632 });
    expect(centres.get('Scene 2')).toEqual({ x: 796, y: 632 });
  });

  it('holds the focus row below the header and the parent when the window is too short to centre it', () => {
    const centres = centresOf(entries, 'Beat 2', size, pane({ middle: 100 }), sizes);

    expect(centres.get('Beat 2')).toEqual({ x: 720, y: 312 });
    expect(centres.get('The story')).toEqual({ x: 720, y: 130 });
  });

  it('holds the story below the header when it has no parent to clear', () => {
    const centres = centresOf(
      entries,
      'The story',
      measured(
        {
          'The story': 560,
          'Beat 1': 180,
          'Beat 2': 180,
          'Beat 3': 180,
          'Scene 1': 120,
          'Scene 2': 120,
          'Line 1': 120,
        },
        { 'The story': 200 },
      ),
      pane({ middle: 100 }),
      sizes,
    );

    expect(centres.get('The story')).toEqual({ x: 720, y: 212 });
    expect([...centres.keys()].sort()).toEqual([
      'Beat 1',
      'Beat 2',
      'Beat 3',
      'Line 1',
      'Scene 1',
      'Scene 2',
      'The story',
    ]);
  });

  it('centres the later siblings on the focus’s middle when it is the first of them', () => {
    const centres = centresOf(
      treeOf(fiveBeats),
      'Beat 1',
      measured(
        {
          'The story': 200,
          'Beat 1': 560,
          'Beat 2': 180,
          'Beat 3': 180,
          'Beat 4': 180,
          'Beat 5': 180,
        },
        { 'The story': 100, 'Beat 1': 200, 'Beat 2': 40, 'Beat 3': 40, 'Beat 4': 40, 'Beat 5': 40 },
      ),
      pane(),
      sizes,
    );

    expect(centres.get('Beat 2')).toEqual({ x: 1122, y: 450 });
    expect(centres.get('Beat 3')).toEqual({ x: 1334, y: 450 });
    expect(centres.get('Beat 4')).toEqual({ x: 1546, y: 450 });
    expect(centres.get('Beat 5')).toEqual({ x: 1758, y: 450 });
  });

  it('puts a hidden piece at its shown ancestor’s centre', () => {
    const centres = centresOf(entries, 'Beat 2', size, pane(), sizes);

    expect(centres.get('Line 1')).toEqual({ x: 644, y: 632 });
  });

  it('leaves a hidden piece that is its own shown ancestor out of the map', () => {
    const centres = centresOf(
      entries,
      'Scene 1',
      measured(
        { ...storyWidths, 'Beat 2': 180, 'Scene 1': 560 },
        { ...storyHeights, 'Beat 2': 100, 'Scene 1': 200, 'Scene 2': 40, 'Line 1': 80 },
      ),
      pane(),
      sizes,
    );

    expect([...centres.keys()].sort()).toEqual(['Beat 2', 'Line 1', 'Scene 1', 'Scene 2']);
  });

  it('puts the earlier siblings left of the focus and the later ones right, on its row', () => {
    const centres = centresOf(
      treeOf(fiveBeats),
      'Beat 3',
      measured(
        {
          'The story': 200,
          'Beat 1': 180,
          'Beat 2': 180,
          'Beat 3': 560,
          'Beat 4': 180,
          'Beat 5': 180,
        },
        { 'The story': 100, 'Beat 1': 40, 'Beat 2': 40, 'Beat 3': 200, 'Beat 4': 40, 'Beat 5': 40 },
      ),
      pane(),
      sizes,
    );

    expect(centres.get('Beat 1')).toEqual({ x: 106, y: 450 });
    expect(centres.get('Beat 2')).toEqual({ x: 318, y: 450 });
    expect(centres.get('Beat 4')).toEqual({ x: 1122, y: 450 });
    expect(centres.get('Beat 5')).toEqual({ x: 1334, y: 450 });
  });

  it('keeps a row of eight scenes inside the pane at 1440 px, and cuts it off evenly at 1100 px', () => {
    const row = treeOf(eightScenes);
    const size = measured(eightWidths, { 'The story': 100, 'Beat 4': 200 });

    const inside = centresOf(row, 'Beat 4', size, pane(), sizes);
    expect(inside.get('Scene 1')).toEqual({ x: 188, y: 632 });
    expect(inside.get('Scene 8')).toEqual({ x: 1252, y: 632 });

    const cut = centresOf(row, 'Beat 4', size, pane({ width: 1100, mainWidth: 1100 }), sizes);
    const left = cut.get('Scene 1')!.x - 60;
    const right = cut.get('Scene 8')!.x + 60;
    expect(left).toBe(-42);
    expect(right).toBe(1142);
    expect(0 - left).toBe(right - 1100);
  });
});

describe('whether a piece is on screen', () => {
  const main = { width: 1000, height: 800 };

  it('reads a box whose edge lies exactly on an edge of main as on screen', () => {
    expect(onScreen({ x: 50, y: 50 }, { width: 100, height: 100 }, main)).toBe(true);
    expect(onScreen({ x: 950, y: 750 }, { width: 100, height: 100 }, main)).toBe(true);
    expect(onScreen({ x: 500, y: 400 }, { width: 1000, height: 800 }, main)).toBe(true);
  });

  it('reads a box one pixel over an edge as off screen', () => {
    expect(onScreen({ x: 49, y: 50 }, { width: 100, height: 100 }, main)).toBe(false);
    expect(onScreen({ x: 951, y: 50 }, { width: 100, height: 100 }, main)).toBe(false);
    expect(onScreen({ x: 50, y: 49 }, { width: 100, height: 100 }, main)).toBe(false);
    expect(onScreen({ x: 50, y: 751 }, { width: 100, height: 100 }, main)).toBe(false);
  });
});

describe('the transition a card is measured under', () => {
  it('leaves out the width and the height, and keeps visibility for a hidden piece', () => {
    const drawn = 'left, top, width, height, opacity, visibility';

    expect(whileMeasuring(drawn, 'hidden')).toBe('left, top, opacity, visibility');
    expect(whileMeasuring(drawn, 'card')).toBe('left, top, opacity');
  });

  it('gives back all, the computed value under reduced motion', () => {
    expect(whileMeasuring('all', 'focus')).toBe('all');
  });
});
