import { componentStaysInItsRoot } from './component-stays-in-its-root';
import { domInDomFiles } from './dom-in-dom-files';
import { findElements } from './find-elements';
import { compose } from './override';
import { testThroughTheirOwner } from './test-through-owner';
import { waitOnThePage } from './wait-on-the-page';
import { wordsFromTheStrings } from './words-from-the-strings';

export const overrides = compose([
  domInDomFiles,
  componentStaysInItsRoot,
  findElements,
  testThroughTheirOwner,
  waitOnThePage,
  wordsFromTheStrings,
]);
