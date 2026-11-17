import { strings } from '../../strings/strings';

export const refusalFor = (ownTitle: string): string =>
  strings.projectsFolder.ownFolder(ownTitle === '' ? strings.project.untitledTitle : ownTitle);
