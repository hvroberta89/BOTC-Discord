import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding, } from '@angular/router';
import { provideAuth } from './core/auth/data-access/auth.providers';
import { RUNTIME_CONFIG, } from './core/config/runtime-config.token';
import { RuntimeConfig, } from './core/config/runtime-config.model';
import { provideSupabase, } from './core/supabase/supabase.providers';
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

      provideSupabase(),
      provideAuth(),
    ],
  };
}