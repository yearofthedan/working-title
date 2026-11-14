import type { Driver } from '../src/test-helpers/driver';
import { pageMeta, type StepAction } from '../src/test-helpers/steps';

export interface PrivateBuild {
  readonly driver: Driver;
  installsANewVersion(): Promise<void>;
  showsTheNotice(): Promise<void>;
  opensOnTheNewVersion(): Promise<void>;
}

export const newVersionSteps = (build: PrivateBuild): Record<string, StepAction> => ({
  'a new version is installed': () => build.installsANewVersion(),
  'a notice says a new version is ready': () => build.showsTheNotice(),
  'the writer reloads from the notice': () => build.driver.click('button', 'Reload'),
  'the app opens on the new version': async () => {
    await build.opensOnTheNewVersion();
    return pageMeta();
  },
});
