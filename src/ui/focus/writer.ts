import type { PageScope } from '../../test-helpers/scope';
import type { StepAction } from '../../test-helpers/steps';

/** The focus page's part of the writer driver: what a writer does on it, and nothing else. */
export const focusPageActions = (scope: PageScope): Record<string, StepAction> => ({
  'the story is on screen': async () => {
    await scope.fresh();
  },
  'the writer types "{text}" into {facet}': async ({ text, facet }) => {
    await scope.field(facet).enter(text);
  },
  'the writer sees': () => {
    // Nothing to do: the runner prints the page after the steps, and this phrase names it.
  },
});
