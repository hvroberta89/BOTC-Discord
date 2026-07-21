import {
  ApplicationConfig,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {
  RuntimeConfig,
} from './core/config/runtime-config.model';
import {
  RUNTIME_CONFIG,
} from './core/config/runtime-config.token';
import {
  provideSupabase,
} from './core/supabase/supabase.providers';

export function createAppConfig(
  runtimeConfig: RuntimeConfig,
): ApplicationConfig {
  return {
    providers: [
      provideZonelessChangeDetection(),
      provideRouter(routes),
      {
        provide: RUNTIME_CONFIG,
        useValue: runtimeConfig,
      },
      provideSupabase(),
    ],
  };
}