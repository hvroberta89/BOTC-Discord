import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
} from '@angular/router';
import {
  RUNTIME_CONFIG,
} from './core/config/runtime-config.token';
import {
  RuntimeConfig,
} from './core/config/runtime-config.model';
import {
  PLATFORM_INTEGRATION,
} from './core/platform/platform-integration.token';
import {
  StandalonePlatformIntegration,
} from './core/config/standalone-platform.integration';
import {
  provideSupabase,
} from './core/supabase/supabase.providers';
import { routes } from './app.routes';

export function createAppConfig(
  runtimeConfig: RuntimeConfig,
): ApplicationConfig {
  return {
    providers: [
      provideBrowserGlobalErrorListeners(),
      provideZonelessChangeDetection(),

      provideRouter(
        routes,
        withComponentInputBinding(),
      ),

      {
        provide: RUNTIME_CONFIG,
        useValue: runtimeConfig,
      },
      {
        provide: PLATFORM_INTEGRATION,
        useClass: StandalonePlatformIntegration,
      },

      provideSupabase(),
    ],
  };
}