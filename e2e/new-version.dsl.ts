import type { Driver } from '../src/test-helpers/driver';
import { reporting, type StepAction } from '../src/test-helpers/steps';

export interface PrivateBuild {
  readonly driver: Driver;
  installsANewVersion(): Promise<void>;
  showsTheNotice(): Promise<void>;
  opensOnTheNewVersion(): Promise<void>;
}

export const newVersionSteps = (build: PrivateBuild): Record<string, StepAction> => ({
  'a new version is installed': () => build.installsANewVersion(),
  'a notice says a new version is ready': async () => {
    await build.showsTheNotice();
    return reporting({ role: 'status' });
  },
});
