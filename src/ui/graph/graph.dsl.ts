import type { DrawnCard, Driver } from '../../test-helpers/driver';
import type { StepAction } from '../../test-helpers/steps';

const arrows: Readonly<Record<string, string>> = {
  '↑': 'ArrowUp',
  '↓': 'ArrowDown',
  '←': 'ArrowLeft',
  '→': 'ArrowRight',
};

export interface Writer {
  opensANewProject(): Promise<void>;
  reopens(): Promise<void>;
  clicks(piece: string): Promise<void>;
  focuses(piece: string): Promise<void>;
  moves(direction: string): Promise<void>;
  addsASceneUnder(beat: string): Promise<void>;
  types(text: string, at: { readonly piece: string; readonly facet: string }): Promise<void>;
}

export interface Around {
  readonly above?: string;
  readonly beside?: readonly string[];
  readonly under?: readonly string[];
}

export interface Sees {
  focusIs(piece: string, around?: Around): Promise<void>;
  tree(): Promise<readonly string[]>;
  pathIs(pieces: readonly string[]): Promise<void>;
}

const shows = (tree: readonly string[], piece: string): boolean =>
  tree.some((line) => line.toLowerCase().includes(`group "${piece.toLowerCase()}"`));

export const writerOn = (driver: Driver): Writer => {
  const clicking = (piece: string): Promise<void> =>
    driver.click('heading', piece, { role: 'group', name: piece });

  const reaching = async (piece: string): Promise<void> => {
    if (!shows(await driver.tree(), piece)) {
      await driver.click('button', 'The story', { role: 'navigation', name: 'Where you are' });
    }
    await clicking(piece);
  };

  return {
    opensANewProject: () => driver.fresh(),
    reopens: () => driver.reopen(),
    clicks: clicking,
    focuses: reaching,
    moves: (direction) => driver.press(arrows[direction] ?? direction),
    addsASceneUnder: async (beat) => {
      await reaching(beat);
      await driver.click('button', 'Add a scene', { role: 'group', name: beat });
    },
    types: (text, at) => driver.type(text, at.facet, { role: 'group', name: at.piece }),
  };
};

const inFocus = (pieces: readonly DrawnCard[], name: string): DrawnCard => {
  const focused = pieces.filter((piece) => piece.current);
  const [only] = focused;
  if (focused.length !== 1 || only?.name !== name) {
    throw new Error(`the piece in focus is ${only?.name ?? 'nothing'}, not ${name}`);
  }
  return only;
};

const sameNames = (what: string, found: readonly string[], wanted: readonly string[]): void => {
  if (found.join(', ') !== wanted.join(', ')) {
    throw new Error(`the ${what} are ${found.join(', ') || 'none'}, not ${wanted.join(', ')}`);
  }
};

const above = (pieces: readonly DrawnCard[], focus: DrawnCard, name: string): void => {
  const parent = pieces.find((piece) => piece.kind === 'card' && piece.name === name);
  if (parent === undefined || parent.box.bottom > focus.box.top) {
    throw new Error(`${name} is not on the graph above the focus`);
  }
};

const beside = (pieces: readonly DrawnCard[], focus: DrawnCard, names: readonly string[]): void => {
  const at = pieces.findIndex((piece) => piece.kind === 'focus');
  sameNames(
    'pieces beside the focus',
    pieces.filter((piece) => piece.kind === 'chip').map((piece) => piece.name),
    names,
  );
  for (const [index, piece] of pieces.entries()) {
    if (piece.kind !== 'chip') continue;
    if (Math.abs(piece.box.top + piece.box.height / 2 - focus.box.top - focus.box.height / 2) > 1) {
      throw new Error(`${piece.name} is not on the focus's row`);
    }
    const wrongSide =
      index < at ? piece.box.right > focus.box.left : piece.box.left < focus.box.right;
    if (wrongSide) throw new Error(`${piece.name} is on the wrong side of the focus`);
  }
};

const under = (pieces: readonly DrawnCard[], focus: DrawnCard, names: readonly string[]): void => {
  const children = pieces.filter(
    (piece) => piece.kind === 'card' && piece.box.top >= focus.box.bottom,
  );
  sameNames(
    'pieces under the focus',
    children.map((piece) => piece.name),
    names,
  );
  for (const [at, child] of children.entries()) {
    const [first] = children;
    if (first !== undefined && Math.abs(child.box.top - first.box.top) > 1) {
      throw new Error(`${child.name} is not in the row under the focus`);
    }
    const before = children[at - 1];
    if (before !== undefined && child.box.left <= before.box.left) {
      throw new Error(`${child.name} is not drawn after ${before.name}`);
    }
  }
};

export const seesOn = (driver: Driver): Sees => ({
  focusIs: async (piece, around = {}) => {
    const pieces = await driver.drawn();
    const focus = inFocus(pieces, piece);
    if (around.above !== undefined) above(pieces, focus, around.above);
    if (around.beside !== undefined) beside(pieces, focus, around.beside);
    if (around.under !== undefined) under(pieces, focus, around.under);
  },
  tree: () => driver.tree(),
  pathIs: async (pieces) => {
    const path = await driver.path();
    if (path !== pieces.join('')) {
      throw new Error(`the path reads ${path || 'nothing'}, not ${pieces.join(' › ')}`);
    }
  },
});

export const graphSteps = (writer: Writer, sees: Sees): Record<string, StepAction> => ({
  'a new project': () => writer.opensANewProject(),
  'the writer opens the app': () => writer.opensANewProject(),
  'the story is on screen': () => writer.opensANewProject(),
  'the writer clicks {piece}': ({ piece }) => writer.clicks(piece),
  'presses {key}': ({ key }) => writer.moves(key),
  'a project with two scenes under {beat}': async ({ beat }) => {
    await writer.opensANewProject();
    await writer.addsASceneUnder(beat);
    await writer.addsASceneUnder(beat);
    await writer.reopens();
  },
  'the writer types "{text}" into {piece}\'s {facet}': ({ text, piece, facet }) =>
    writer.types(text, { piece, facet }),
  'the writer adds a scene under {beat}': ({ beat }) => writer.addsASceneUnder(beat),
  'adds a scene under {beat}': ({ beat }) => writer.addsASceneUnder(beat),
  'the writer adds two scenes under {beat}': async ({ beat }) => {
    await writer.addsASceneUnder(beat);
    await writer.addsASceneUnder(beat);
  },
  'types "{text}" as {scene}\'s list line under {beat}': async ({ text, scene, beat }) => {
    await writer.focuses(beat);
    if (!shows(await sees.tree(), scene)) throw new Error(`${scene} is not under ${beat}`);
    await writer.types(text, { piece: scene, facet: 'List line' });
  },
  'the story is in focus, with beats 1 to 5 under it': () =>
    sees.focusIs('The story', { under: ['Beat 1', 'Beat 2', 'Beat 3', 'Beat 4', 'Beat 5'] }),
  'beat 2 is in focus, with the story above it and beats 1, 3, 4 and 5 beside it': () =>
    sees.focusIs('Beat 2', {
      above: 'The story',
      beside: ['Beat 1', 'Beat 3', 'Beat 4', 'Beat 5'],
    }),
  'beat 3 is in focus, with beats 1, 2, 4 and 5 beside it': () =>
    sees.focusIs('Beat 3', { beside: ['Beat 1', 'Beat 2', 'Beat 4', 'Beat 5'] }),
  'scene 1 under beat 2 is in focus, with beat 2 above it and scene 2 beside it': () =>
    sees.focusIs('Scene 1', { above: 'Beat 2', beside: ['Scene 2'] }),
  'beat 2 is in focus, with scenes 1 and 2 under it': () =>
    sees.focusIs('Beat 2', { under: ['Scene 1', 'Scene 2'] }),
  'scene 2 under beat 2 is in focus': () => sees.focusIs('Scene 2'),
});
