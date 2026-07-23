import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';

import { DiscordService } from './data-access/discord.service';

export function provideDiscord(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideAppInitializer(() => {
      const discordService = inject(DiscordService);

      return discordService.initialize();
    }),
  ]);
}