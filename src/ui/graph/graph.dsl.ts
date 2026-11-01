import type { DrawnCard, Driver, Opening, Reads } from '../../test-helpers/driver';
import {
  aProjectWithScenesUnder,
  seededProject,
  type Seed,
  type SeededProject,
} from '../../test-helpers/seed';
import type { StepAction } from '../../test-helpers/steps';

const keys: Readonly<Record<string, string>> = {
  '↑': 'ArrowUp',
  '↓': 'ArrowDown',
  '←': 'ArrowLeft',
  '→': 'ArrowRight',
  Esc: 'Escape',
};

export interface Writer {
  opensANewProject(): Promise<void>;
  reopens(): Promise<void>;
  startsFrom(project: SeededProject): Promise<void>;
  clicks(piece: string): Promise<void>;
  clicksAwayFromTheGraph(): Promise<void>;
  makesCurrent(piece: string): Promise<void>;
  putsTheFocusOnNameButtonOf(piece: string): Promise<void>;
  moves(direction: string): Promise<void>;
  tabsForward(): Promise<void>;
  tabsBackward(): Promise<void>;
  addsASceneUnder(beat: string): Promise<void>;
  types(text: string, at: { readonly piece: string; readonly facet: string }): Promise<void>;
}

export interface Around {
  readonly above?: string;
  readonly beside?: readonly string[];
  readonly under?: readonly string[];
}

export interface Sees {
  currentIs(piece: string, around?: Around): Promise<void>;
  tree(): Promise<readonly string[]>;
  pathIs(pieces: readonly string[]): Promise<void>;
  focusIsIn(piece: string, facet: string): Promise<void>;
  focusIsOnTheName(piece: string): Promise<void>;
  focusIsOnTheCard(): Promise<void>;
}

const pieces: Readonly<Record<string, string>> = {
  'beat two': 'Beat 2',
  'beat 2': 'Beat 2',
  "the first scene's card": 'Scene 1',
};

const pieceNamed = (words: string): string => pieces[words] ?? words;

const shows = (tree: readonly string[], piece: string): boolean =>
  tree.some((line) => line.toLowerCase().includes(`group "${piece.toLowerCase()}"`));

export const writerOn = (
  driver: Driver,
  opening: Opening,
  startFrom?: (project: SeededProject) => Promise<void>,
): Writer => {
  const clicking = (piece: string): Promise<void> => {
    const named = pieceNamed(piece);
    return driver.click('heading', named, { role: 'group', name: named });
  };

  const reaching = async (piece: string): Promise<void> => {
    if (!shows(await driver.tree(), pieceNamed(piece))) {
      await driver.click('button', 'The story', { role: 'navigation', name: 'Where you are' });
    }
    await clicking(piece);
  };

  return {
    opensANewProject: () => opening.fresh(),
    reopens: () => opening.reopen(),
    startsFrom: async (project) => {
      if (startFrom === undefined) {
        throw new Error(
          'Only the page tier starts a scenario from a seeded world: this writer was given no start from.',
        );
      }
      await startFrom(project);
    },
    clicks: clicking,
    clicksAwayFromTheGraph: () => driver.clickAway(),
    makesCurrent: reaching,
    putsTheFocusOnNameButtonOf: (piece) => {
      const named = pieceNamed(piece);
      return driver.focus('button', named, { role: 'group', name: named });
    },
    moves: (direction) => driver.press(keys[direction] ?? direction),
    tabsForward: () => driver.press('Tab'),
    tabsBackward: () => driver.press('Shift+Tab'),
    addsASceneUnder: async (beat) => {
      const named = pieceNamed(beat);
      await reaching(named);
      await driver.click('button', 'Add a scene', { role: 'group', name: named });
    },
    types: (text, at) => driver.type(text, at.facet, { role: 'group', name: at.piece }),
  };
};

const theCurrent = (pieces: readonly DrawnCard[], name: string): DrawnCard => {
  const current = pieces.filter((piece) => piece.current);
  const [only] = current;
  if (current.length !== 1 || only?.name !== name) {
    throw new Error(`the current piece is ${only?.name ?? 'nothing'}, not ${name}`);
  }
  return only;
};

const sameNames = (what: string, found: readonly string[], wanted: readonly string[]): void => {
  if (found.join(', ') !== wanted.join(', ')) {
    throw new Error(`the ${what} are ${found.join(', ') || 'none'}, not ${wanted.join(', ')}`);
  }
};

const above = (pieces: readonly DrawnCard[], current: DrawnCard, name: string): void => {
  const parent = pieces.find((piece) => piece.kind === 'card' && piece.name === name);
  if (parent === undefined || parent.box.bottom > current.box.top) {
    throw new Error(`${name} is not on the graph above the current piece`);
  }
};

const beside = (
  pieces: readonly DrawnCard[],
  current: DrawnCard,
  names: readonly string[],
): void => {
  const at = pieces.findIndex((piece) => piece.kind === 'current');
  sameNames(
    'pieces beside the current piece',
    pieces.filter((piece) => piece.kind === 'chip').map((piece) => piece.name),
    names,
  );
  for (const [index, piece] of pieces.entries()) {
    if (piece.kind !== 'chip') continue;
    if (
      Math.abs(piece.box.top + piece.box.height / 2 - current.box.top - current.box.height / 2) > 1
    ) {
      throw new Error(`${piece.name} is not on the current piece's row`);
    }
    const wrongSide =
      index < at ? piece.box.right > current.box.left : piece.box.left < current.box.right;
    if (wrongSide) throw new Error(`${piece.name} is on the wrong side of the current piece`);
  }
};

const under = (
  pieces: readonly DrawnCard[],
  current: DrawnCard,
  names: readonly string[],
): void => {
  const children = pieces.filter(
    (piece) => piece.kind === 'card' && piece.box.top >= current.box.bottom,
  );
  sameNames(
    'pieces under the current piece',
    children.map((piece) => piece.name),
    names,
  );
  for (const [at, child] of children.entries()) {
    const [first] = children;
    if (first !== undefined && Math.abs(child.box.top - first.box.top) > 1) {
      throw new Error(`${child.name} is not in the row under the current piece`);
    }
    const before = children[at - 1];
    if (before !== undefined && child.box.left <= before.box.left) {
      throw new Error(`${child.name} is not drawn after ${before.name}`);
    }
  }
};

export const seesOn = (driver: Driver, reads: Reads): Sees => ({
  currentIs: async (piece, around = {}) => {
    const pieces = await reads.drawn();
    const current = theCurrent(pieces, piece);
    if (around.above !== undefined) above(pieces, current, around.above);
    if (around.beside !== undefined) beside(pieces, current, around.beside);
    if (around.under !== undefined) under(pieces, current, around.under);
  },
  tree: () => driver.tree(),
  pathIs: async (pieces) => {
    const path = await reads.path();
    if (path !== pieces.join('')) {
      throw new Error(`the path reads ${path || 'nothing'}, not ${pieces.join(' › ')}`);
    }
  },
  focusIsIn: async (piece, facet) => {
    if (!(await driver.focusIs('textbox', facet, { role: 'group', name: piece }))) {
      throw new Error(`the focus is not in ${piece}'s ${facet}`);
    }
  },
  focusIsOnTheName: async (piece) => {
    if (!(await driver.focusIs('button', piece, { role: 'group', name: piece }))) {
      throw new Error(`the focus is not on ${piece}'s name`);
    }
  },
  focusIsOnTheCard: async () => {
    const cards = (await reads.drawn()).filter((piece) => piece.current);
    const [only] = cards;
    if (cards.length !== 1 || only === undefined) {
      throw new Error('the graph draws no one current piece');
    }
    if (!(await driver.focusIs('group', only.name))) {
      throw new Error(`the focus is not on ${only.name}'s card`);
    }
  },
});

const twoBeats: Seed = { beats: [{}, {}] };
const aBeatWithTwoScenes: Seed = { beats: [{}, { scenes: 2 }] };
const theSecondBeat = 'Beat 2';

export const graphSteps = (writer: Writer, sees: Sees): Record<string, StepAction> => ({
  'a new project': () => writer.opensANewProject(),
  'the writer opens the app': () => writer.opensANewProject(),
  'the story is on screen': () => writer.opensANewProject(),
  'the writer clicks {piece}': ({ piece }) => writer.clicks(piece),
  'presses {key}': ({ key }) => writer.moves(key),
  'the writer presses {key}': ({ key }) => writer.moves(key),
  'the writer tabs forward': () => writer.tabsForward(),
  'the writer tabs backward': () => writer.tabsBackward(),
  'a project with two scenes under {beat}': async ({ beat }) =>
    writer.startsFrom(await aProjectWithScenesUnder(pieceNamed(beat), 2)),
  'beat two is current with tab focus': () => writer.clicks('beat two'),
  'a current beat with two scenes': async () => {
    await writer.startsFrom(seededProject(aBeatWithTwoScenes));
    await writer.clicks(theSecondBeat);
  },
  'two beats, the first current with tab focus': async () => {
    await writer.startsFrom(seededProject(twoBeats));
    await writer.clicks('Beat 1');
  },
  'a beat with two scenes, the beat current': async () => {
    await writer.startsFrom(seededProject(aBeatWithTwoScenes));
    await writer.clicks(theSecondBeat);
  },
  'focus on its first scene': () => writer.putsTheFocusOnNameButtonOf('Scene 1'),
  'the first scene has focus': () => writer.putsTheFocusOnNameButtonOf('Scene 1'),
  'focus moves to scene one under beat two': () => sees.focusIsOnTheName('Scene 1'),
  'focus moves to the story': () => sees.focusIsOnTheName('The story'),
  'focus moves to its card': () => sees.focusIsOnTheCard(),
  'it has focus': () => sees.focusIsOnTheCard(),
  'beat two stays current': () => sees.currentIs('Beat 2'),
  'the first scene becomes current': () => sees.currentIs('Scene 1'),
  'the second scene becomes current': () => sees.currentIs('Scene 2'),
  'the second beat becomes current': () => sees.currentIs('Beat 2'),
  'the writer types "{text}" into {piece}\'s {facet}': ({ text, piece, facet }) =>
    writer.types(text, { piece, facet }),
  'the writer adds a scene under {beat}': ({ beat }) => writer.addsASceneUnder(beat),
  'adds a scene under {beat}': ({ beat }) => writer.addsASceneUnder(beat),
  'the writer adds two scenes under {beat}': async ({ beat }) => {
    await writer.addsASceneUnder(beat);
    await writer.addsASceneUnder(beat);
  },
  'types "{text}" as {scene}\'s list line under {beat}': async ({ text, scene, beat }) => {
    await writer.makesCurrent(beat);
    if (!shows(await sees.tree(), scene)) throw new Error(`${scene} is not under ${beat}`);
    await writer.types(text, { piece: scene, facet: 'List line' });
  },
  'the story is current, with beats 1 to 5 under it': () =>
    sees.currentIs('The story', { under: ['Beat 1', 'Beat 2', 'Beat 3', 'Beat 4', 'Beat 5'] }),
  'beat 2 is current, with the story above it and beats 1, 3, 4 and 5 beside it': () =>
    sees.currentIs('Beat 2', {
      above: 'The story',
      beside: ['Beat 1', 'Beat 3', 'Beat 4', 'Beat 5'],
    }),
  'beat 3 is current, with beats 1, 2, 4 and 5 beside it': () =>
    sees.currentIs('Beat 3', { beside: ['Beat 1', 'Beat 2', 'Beat 4', 'Beat 5'] }),
  'scene 1 under beat 2 is current, with beat 2 above it and scene 2 beside it': () =>
    sees.currentIs('Scene 1', { above: 'Beat 2', beside: ['Scene 2'] }),
  'beat 2 is current, with scenes 1 and 2 under it': () =>
    sees.currentIs('Beat 2', { under: ['Scene 1', 'Scene 2'] }),
  'scene 2 under beat 2 is current': () => sees.currentIs('Scene 2'),
});
