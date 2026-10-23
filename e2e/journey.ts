import type { AppScope } from '../src/test-helpers/scope';
import type { StepAction } from '../src/test-helpers/steps';
import { focusPageActions } from '../src/ui/focus/writer';

/**
 * The moves a journey through the whole app makes: the page's own, plus opening a project and
 * reloading it. The phrase a step uses names the facet it types into, so the part finds the
 * field by that label and no method's words are spelled here.
 */
export const journeyActions = (scope: AppScope): Record<string, StepAction> => ({
  ...focusPageActions(scope),
  'a new project': async () => {
    await scope.fresh();
  },
  'reloads the app': async () => {
    await scope.reload();
  },
  'the writer types "{text}" as {piece}\'s {facet}': async ({ text, piece, facet }) => {
    await scope.group(piece).field(facet).enter(text);
  },
});
