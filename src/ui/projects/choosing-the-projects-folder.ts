export const refusalFor = (ownTitle: string): string =>
  `“${ownTitle}” is a project's own folder, so it can't hold other projects. Choose the folder it sits in instead.`;
