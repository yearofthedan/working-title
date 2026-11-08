import { registerSW } from 'virtual:pwa-register';
import { startApp } from './app';

const waiting = Promise.withResolvers<void>();
const update = registerSW({ onNeedRefresh: waiting.resolve, onNeedReload: () => undefined });

const reload = async (): Promise<void> => {
  const registration = await navigator.serviceWorker.getRegistration();
  if (registration?.waiting == null) {
    location.reload();
    return;
  }
  navigator.serviceWorker.addEventListener('controllerchange', () => location.reload(), {
    once: true,
  });
  await update(true);
};

await startApp(document, { waiting: waiting.promise, reload: () => void reload() });
