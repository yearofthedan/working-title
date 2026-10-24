import type { PageScope } from '../../test-helpers/scope';
import type { StepAction } from '../../test-helpers/steps';

export const focusPageActions = (scope: PageScope): Record<string, StepAction> => ({
  'the story is on screen': async () => {
    await scope.fresh();
  },
  'the writer types "{text}" into {facet}': async ({ text, facet }) => {
    await scope.field(facet).enter(text);
  },
});
