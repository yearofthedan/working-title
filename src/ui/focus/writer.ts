import type { PageScope } from '../../test-helpers/scope';
import type { StepAction } from '../../test-helpers/steps';

const kinds = ['focus', 'card', 'chip', 'hidden'] as const;

const arrows: Readonly<Record<string, string>> = {
  '↑': 'ArrowUp',
  '↓': 'ArrowDown',
  '←': 'ArrowLeft',
  '→': 'ArrowRight',
};

interface Drawn {
  readonly name: string;
  readonly kind: string;
  readonly current: boolean;
  readonly box: DOMRect;
}

const drawn = (): readonly Drawn[] =>
  [...document.querySelectorAll<HTMLElement>('main fieldset')].map((card) => ({
    name: card.querySelector('h2, h3, h4')?.textContent ?? '',
    kind: kinds.find((kind) => card.classList.contains(kind)) ?? 'hidden',
    current: card.getAttribute('aria-current') === 'location',
    box: card.getBoundingClientRect(),
  }));

const inFocus = (name: string): Drawn => {
  const focused = drawn().filter((piece) => piece.current);
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

const above = (focus: Drawn, name: string): void => {
  const parent = drawn().find((piece) => piece.kind === 'card' && piece.name === name);
  if (parent === undefined || parent.box.bottom > focus.box.top) {
    throw new Error(`${name} is not on the graph above the focus`);
  }
};

const beside = (focus: Drawn, names: readonly string[]): void => {
  const pieces = drawn();
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

const under = (focus: Drawn, names: readonly string[]): void => {
  const children = drawn().filter(
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

export const focusPageActions = (scope: PageScope): Record<string, StepAction> => {
  const shown = async (piece: string): Promise<boolean> => {
    const wanted = `group "${piece.toLowerCase()}"`;
    return (await scope.tree()).some((line) => line.toLowerCase().includes(wanted));
  };

  const reaching = async (beat: string): Promise<void> => {
    if (!(await shown(beat))) await scope.step('The story');
    await scope.group(beat).click();
  };

  const adding = async (beat: string): Promise<void> => {
    await reaching(beat);
    await scope.group(beat).press('Add a scene');
  };

  return {
    'a new project': () => scope.fresh(),
    'the writer opens the app': () => scope.fresh(),
    'the story is on screen': () => scope.fresh(),
    'the writer clicks {piece}': ({ piece }) => scope.group(piece).click(),
    'presses {key}': ({ key }) => scope.press(arrows[key] ?? key),
    'a project with two scenes under {beat}': async ({ beat }) => {
      await scope.fresh();
      await adding(beat);
      await adding(beat);
      await scope.reopen();
    },
    'the writer types "{text}" into {piece}\'s {facet}': ({ text, piece, facet }) =>
      scope.group(piece).field(facet).enter(text),
    'the writer adds a scene under {beat}': ({ beat }) => adding(beat),
    'adds a scene under {beat}': ({ beat }) => adding(beat),
    'the writer adds two scenes under {beat}': async ({ beat }) => {
      await adding(beat);
      await adding(beat);
    },
    'types "{text}" as {scene}\'s list line under {beat}': async ({ text, scene, beat }) => {
      await reaching(beat);
      if (!(await shown(scene))) throw new Error(`${scene} is not under ${beat}`);
      await scope.group(scene).field('List line').enter(text);
    },
    'the story is in focus, with beats 1 to 5 under it': () => {
      under(inFocus('The story'), ['Beat 1', 'Beat 2', 'Beat 3', 'Beat 4', 'Beat 5']);
    },
    'beat 2 is in focus, with the story above it and beats 1, 3, 4 and 5 beside it': () => {
      const focus = inFocus('Beat 2');
      above(focus, 'The story');
      beside(focus, ['Beat 1', 'Beat 3', 'Beat 4', 'Beat 5']);
    },
    'beat 3 is in focus, with beats 1, 2, 4 and 5 beside it': () => {
      beside(inFocus('Beat 3'), ['Beat 1', 'Beat 2', 'Beat 4', 'Beat 5']);
    },
    'scene 1 under beat 2 is in focus, with beat 2 above it and scene 2 beside it': () => {
      const focus = inFocus('Scene 1');
      above(focus, 'Beat 2');
      beside(focus, ['Scene 2']);
    },
    'beat 2 is in focus, with scenes 1 and 2 under it': () => {
      under(inFocus('Beat 2'), ['Scene 1', 'Scene 2']);
    },
    'scene 2 under beat 2 is in focus': () => {
      inFocus('Scene 2');
    },
  };
};
