import type { PageScope } from '../../test-helpers/scope';
import type { StepAction } from '../../test-helpers/steps';

export const focusPageActions = (scope: PageScope): Record<string, StepAction> => ({
  'the story is on screen': async () => {
    await scope.fresh();
  },
  'the writer types "{text}" into {piece}\'s {facet}': async ({ text, piece, facet }) => {
    await scope.group(piece).field(facet).enter(text);
  },
  'the writer adds a scene under {beat}': async ({ beat }) => {
    await scope.group(beat).press('Add a scene');
  },
  'the writer adds two scenes under {beat}': async ({ beat }) => {
    await scope.group(beat).press('Add a scene');
    await scope.group(beat).press('Add a scene');
  },
});
