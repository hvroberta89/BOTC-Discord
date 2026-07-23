import { inject, Injectable, signal } from '@angular/core';

import { RUNTIME_CONFIG } from '../../config/runtime-config.token';
import { DiscordSdkService } from './discord-sdk.service';
import {
  DiscordConnectionStatus,
  DiscordGuild,
  DiscordUser,
  DiscordVoiceChannel,
} from './discord.models';

@Injectable({
  providedIn: 'root',
})
export class DiscordService {
  private readonly runtimeConfig = inject(RUNTIME_CONFIG);
  private readonly discordSdkService = inject(DiscordSdkService);

  readonly status =
    signal<DiscordConnectionStatus>('disabled');

  readonly errorMessage =
    signal<string | null>(null);

  readonly currentUser =
    signal<DiscordUser | null>(null);

  readonly guild =
    signal<DiscordGuild | null>(null);

  readonly voiceChannel =
    signal<DiscordVoiceChannel | null>(null);

  readonly participants =
    signal<readonly DiscordUser[]>([]);

  async initialize(): Promise<void> {
    if (
      this.runtimeConfig.runtimeMode !==
      'discord-activity'
    ) {
      this.status.set('disabled');
      return;
    }

    this.status.set('connecting');
    this.errorMessage.set(null);

    try {
      await this.discordSdkService.initialize();

      this.status.set('connected');
    } catch (error: unknown) {
      this.status.set('failed');

      this.errorMessage.set(
        error instanceof Error
          ? error.message
          : 'Discord initialization failed.',
      );
    }
  }
}