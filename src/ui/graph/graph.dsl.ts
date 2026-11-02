import type { DrawnCard, Driver, Opening, Reads } from '../../test-helpers/driver';
import {
  aProject,
  aProjectWithScenesUnder,
  beat,
  scene,
  story,
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
  opensBeside(piece: string): Promise<void>;
  closesThePanel(): Promise<void>;
  types(text: string, at: { readonly piece: string; readonly facet: string }): Promise<void>;
  typesBeside(text: string, at: { readonly piece: string; readonly facet: string }): Promise<void>;
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
  focusIsOn(piece: string): Promise<void>;
  focusIsOnTheName(piece: string): Promise<void>;
  focusIsOnTheCard(): Promise<void>;
  focusIsInTheParagraph(): Promise<void>;
  panelIsOpenOn(piece: string): Promise<void>;
  noPanelIsOpen(): Promise<void>;
  reads(piece: string, facet: string, text: string): Promise<void>;
  readsOnTheCard(piece: string, facet: string, text: string): Promise<void>;
  readsBeside(piece: string, facet: string, text: string): Promise<void>;
}

const pieces: Readonly<Record<string, string>> = {
  'beat two': 'Beat 2',
  'beat 2': 'Beat 2',
  "the first scene's card": 'Scene 1',
};

const pieceNamed = (words: string): string => pieces[words] ?? words;

const besideTheGraph = ' beside the graph';

// shortcut: the paragraph is the one facet typed beside the graph, until the driver can ask the method which facets are long.
const typedBeside = (facet: string): boolean => facet.toLowerCase() === 'paragraph';

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

  const openingBeside = async (piece: string): Promise<void> => {
    const named = pieceNamed(piece);
    await reaching(named);
    await driver.click('button', 'Open beside', { role: 'group', name: named });
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
    opensBeside: openingBeside,
    closesThePanel: () => driver.click('button', 'Close'),
    types: async (text, at) => {
      if (!typedBeside(at.facet)) {
        await driver.type(text, at.facet, { role: 'group', name: at.piece });
        return;
      }
      // shortcut: a long facet has no field on the card, so typing one opens its piece beside the graph first; a scenario whose panel is already open on that piece says " beside the graph" instead, until the driver can ask whether the icon is pressed.
      await openingBeside(at.piece);
      await driver.type(text, at.facet, { role: 'complementary', name: at.piece });
    },
    typesBeside: (text, at) =>
      driver.type(text, at.facet, { role: 'complementary', name: at.piece }),
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

export const seesOn = (driver: Driver, reads: Reads): Sees => {
  const readsOnTheCard = async (piece: string, facet: string, text: string): Promise<void> => {
    const held = await driver.value(facet, { role: 'group', name: pieceNamed(piece) });
    if (held !== text) {
      throw new Error(
        `${piece}'s ${facet} on its card reads ${JSON.stringify(held)}, not ${JSON.stringify(text)}`,
      );
    }
  };

  const readsBeside = async (piece: string, facet: string, text: string): Promise<void> => {
    const held = await driver.value(facet, { role: 'complementary', name: pieceNamed(piece) });
    if (held !== text) {
      throw new Error(
        `${piece}'s ${facet} beside the graph reads ${JSON.stringify(held)}, not ${JSON.stringify(text)}`,
      );
    }
  };

  return {
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
    focusIsOn: async (piece) => {
      if (!(await driver.focusIs('group', pieceNamed(piece)))) {
        throw new Error(`the focus is not on ${piece}`);
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
    focusIsInTheParagraph: async () => {
      if (!(await driver.focusIs('textbox', 'Paragraph'))) {
        throw new Error('the focus is not in the paragraph beside the graph');
      }
    },
    panelIsOpenOn: async (piece) => {
      await driver.value('Paragraph', { role: 'complementary', name: pieceNamed(piece) });
    },
    noPanelIsOpen: async () => {
      if ((await driver.tree()).some((line) => line.includes('- complementary'))) {
        throw new Error('something is open beside the graph');
      }
    },
    reads: (piece, facet, text) =>
      typedBeside(facet) ? readsBeside(piece, facet, text) : readsOnTheCard(piece, facet, text),
    readsOnTheCard,
    readsBeside,
  };
};

const twoBeats = story(beat(), beat());
const aBeatWithTwoScenes = story(beat(), beat(scene(), scene()));
const theSecondBeat = 'Beat 2';

export const graphSteps = (writer: Writer, sees: Sees): Record<string, StepAction> => ({
  'a new project': () => writer.opensANewProject(),
  'the writer opens the app': () => writer.opensANewProject(),
  'the story is on screen': () => writer.opensANewProject(),
  // shortcut: beat 2 is named here, until the phrase table can tell a piece's name from a facet's in "beat 4's paragraph is open beside the graph".
  'beat 2 is open beside the graph': async () => {
    await writer.opensANewProject();
    await writer.opensBeside('beat 2');
  },
  '{piece} is still open beside the graph': ({ piece }) => sees.panelIsOpenOn(piece),
  "{piece}'s paragraph is open beside the graph": ({ piece }) => sees.panelIsOpenOn(piece),
  'the writer opens {piece} beside the graph': ({ piece }) => writer.opensBeside(piece),
  'opens {piece} beside the graph': ({ piece }) => writer.opensBeside(piece),
  'the writer closes the panel': () => writer.closesThePanel(),
  'nothing is open beside the graph': () => sees.noPanelIsOpen(),
  'focus moves to the paragraph': () => sees.focusIsInTheParagraph(),
  '{piece} is in focus': ({ piece }) => sees.focusIsOn(piece),
  'the writer types "{text}" as {piece}\'s {facet}': ({ text, piece, facet }) =>
    facet.endsWith(besideTheGraph)
      ? writer.typesBeside(text, { piece, facet: facet.slice(0, -besideTheGraph.length) })
      : writer.types(text, { piece, facet }),
  '{piece}\'s {facet} on its card reads "{text}"': ({ piece, facet, text }) =>
    sees.readsOnTheCard(piece, facet, text),
  '{piece}\'s {facet} beside the graph reads "{text}"': ({ piece, facet, text }) =>
    sees.readsBeside(piece, facet, text),
  'the writer clicks {piece}': ({ piece }) => writer.clicks(piece),
  'presses {key}': ({ key }) => writer.moves(key),
  'the writer presses {key}': ({ key }) => writer.moves(key),
  'the writer tabs forward': () => writer.tabsForward(),
  'the writer tabs backward': () => writer.tabsBackward(),
  'a project with two scenes under {beat}': async ({ beat: name }) =>
    writer.startsFrom(await aProjectWithScenesUnder(pieceNamed(name), 2)),
  'beat two is current with tab focus': () => writer.clicks('beat two'),
  'a current beat with two scenes': async () => {
    await writer.startsFrom(aProject(aBeatWithTwoScenes));
    await writer.clicks(theSecondBeat);
  },
  'two beats, the first current with tab focus': async () => {
    await writer.startsFrom(aProject(twoBeats));
    await writer.clicks('Beat 1');
  },
  'a beat with two scenes, the beat current': async () => {
    await writer.startsFrom(aProject(aBeatWithTwoScenes));
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
