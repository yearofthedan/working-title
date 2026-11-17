import { untitledProjectTitle } from '../../../application/project';

export const refusalFor = (ownTitle: string): string =>
  `“${ownTitle === '' ? untitledProjectTitle : ownTitle}” is a project's own folder, so it can't hold other projects. Choose the folder it sits in instead.`;

export const couldNotOpenTheFolder = "working-title couldn't open that folder. Try another one.";

export const noFolderPicker =
  "This browser can't keep your projects in a folder. Open working-title in Chrome or Edge on a computer.";
