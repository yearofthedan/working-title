import { untitledProjectTitle } from '../../application/project';

export const refusalFor = (ownTitle: string): string =>
  `“${ownTitle === '' ? untitledProjectTitle : ownTitle}” is a project's own folder, so it can't hold other projects. Choose the folder it sits in instead.`;

export const couldNotOpenTheFolder = "working-title couldn't open that folder. Try another one.";

export const couldNotMakeTheFolder = "working-title couldn't make the project's folder. Try again.";

export const couldNotOpenTheProject =
  "working-title made the project's folder but couldn't open the project. Try again.";
