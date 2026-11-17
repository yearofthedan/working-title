import { componentStaysInItsRoot } from './component-stays-in-its-root';
import { domInDomFiles } from './dom-in-dom-files';
import { findElements } from './find-elements';
import { compose } from './override';
import { testThroughTheirOwner } from './test-through-owner';
import { waitOnThePage } from './wait-on-the-page';

export const overrides = compose([
  domInDomFiles,
  componentStaysInItsRoot,
  findElements,
  testThroughTheirOwner,
  waitOnThePage,
]);
