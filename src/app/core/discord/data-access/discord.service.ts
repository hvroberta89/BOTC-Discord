import { inject, Injectable, signal } from '@angular/core';
import type { Types } from '@discord/embedded-app-sdk';

import { DiscordSdkService } from './discord-sdk.service';
import {
  DiscordConnectionStatus,
  DiscordGuild,
  DiscordUser,
  DiscordVoiceChannel,
} from './discord.models';
import {
  isDiscordActivityRuntime,
} from '../util/discord-runtime.util';

@Injectable({
  providedIn: 'root',
})
export class DiscordService {
  private readonly discordSdkService =
    inject(DiscordSdkService);

  readonly isDiscordActivity =
    signal(isDiscordActivityRuntime());

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
    if (!this.isDiscordActivity()) {
      this.status.set('disabled');
      return;
    }

    this.status.set('connecting');
    this.errorMessage.set(null);

    try {
      await this.discordSdkService.initialize();

      await this.discordSdkService
        .subscribeToParticipants((response) => {
          this.updateParticipants(response);
        });

      const response =
        await this.discordSdkService.getParticipants();

      this.updateParticipants(response);

      this.status.set('connected');
    } catch (error: unknown) {
      console.error(
        'Discord initialization error:',
        error,
      );

      this.status.set('failed');
      this.errorMessage.set(
        this.getErrorMessage(error),
      );
    }
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'string') {
      return error;
    }

    if (
      typeof error === 'object' &&
      error !== null
    ) {
      try {
        return JSON.stringify(error);
      } catch {
        return String(error);
      }
    }

    return 'Discord initialization failed.';
  }

  private updateParticipants(
    response:
      Types.GetActivityInstanceConnectedParticipantsResponse,
  ): void {
    const participants: readonly DiscordUser[] =
      response.participants.map((participant) => ({
        id: participant.id,
        username: participant.username,
        globalName:
          participant.global_name ?? null,
        avatar: participant.avatar ?? null,
      }));

    this.participants.set(participants);
  }
}