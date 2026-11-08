import { registerSW } from 'virtual:pwa-register';
import { startApp } from './app';

const waiting = Promise.withResolvers<void>();
const update = registerSW({ onNeedRefresh: waiting.resolve });

const reload = (): void => {
  navigator.serviceWorker.addEventListener('controllerchange', () => location.reload(), {
    once: true,
  });
  void update(true);
};

await startApp(document, { waiting: waiting.promise, reload });
