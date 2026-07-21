import {
  bootstrapApplication,
} from '@angular/platform-browser';
import { App } from './app/app';
import {
  createAppConfig,
} from './app/app.config';
import {
  loadRuntimeConfig,
} from './app/core/config/runtime-config.loader';

async function bootstrap(): Promise<void> {
  const runtimeConfig = await loadRuntimeConfig();

  await bootstrapApplication(
    App,
    createAppConfig(runtimeConfig),
  );
}

bootstrap().catch((error: unknown) => {
  console.error(
    'Application bootstrap failed.',
    error,
  );
});