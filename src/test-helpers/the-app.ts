import { startApp } from '../app';

export const openTheApp = async (): Promise<void> => {
  await startApp(document);
};
