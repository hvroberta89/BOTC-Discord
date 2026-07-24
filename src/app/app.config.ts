import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { CommandBus } from './application/commands/command-bus';
import { CreateGameHandler } from './application/commands/create-game/create-game.handler';
import { provideAuth } from './core/auth/data-access/auth.providers';
import {
  RuntimeConfig,
} from './core/config/runtime-config.model';
import {
  RUNTIME_CONFIG,
} from './core/config/runtime-config.token';
import {
  provideDiscord,
} from './core/discord/discord.providers';
import {
  provideSupabase,
} from './core/supabase/supabase.providers';
import { routes } from './app.routes';

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
      provideAuth(),
      provideDiscord(),

      provideAppInitializer(() => {
        const commandBus =
          inject(CommandBus);

        const createGameHandler =
          inject(CreateGameHandler);

        commandBus.register(
          createGameHandler,
        );
      }),
    ],
  };
}