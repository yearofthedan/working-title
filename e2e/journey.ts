import type { Method } from '../src/domain/project';
import type { AppScope } from '../src/test-helpers/scope';
import type { StepAction } from '../src/test-helpers/steps';
import { focusPageActions } from '../src/ui/focus/writer';

/**
 * The moves a journey through the whole app makes: the page's own, plus opening a project,
 * reloading, and typing into the story's summary — named as the story names that facet, and
 * resolved through the method rather than spelled here.
 */
export const journeyActions = (scope: AppScope, method: Method): Record<string, StepAction> => ({
  ...focusPageActions(scope),
  'a new project': async () => {
    await scope.fresh();
  },
  'reloads the app': async () => {
    await scope.reload();
  },
  'the writer types "{text}" as the story\'s one-sentence summary': async ({ text }) => {
    const [facet] = method.rootKind.facets;
    if (facet === undefined) {
      throw new Error(`The method gives ${method.name}'s story no facet to type into`);
    }
    await scope.field(facet.label).enter(text);
  },
});
