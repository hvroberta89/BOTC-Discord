import { inject, Injectable } from '@angular/core';

import { DiscordAuthService } from './discord-auth.service';
import { DiscordSdkService } from './discord-sdk.service';
import { DiscordGatewayService } from './discord-gateway.service';
import { mapParticipantsToUsers } from './discord.mapper';import { DiscordStore } from './discord.store';
import {
  isDiscordActivityRuntime,
} from '../util/discord-runtime.util';

@Injectable({
  providedIn: 'root',
})
export class DiscordService {
  private readonly discordSdkService =
    inject(DiscordSdkService);

  private readonly discordAuthService =
    inject(DiscordAuthService);

  private readonly store =
    inject(DiscordStore);

  private readonly discordGatewayService =
    inject(DiscordGatewayService);

  readonly isDiscordActivity =
    this.store.isDiscordActivity;

  readonly status =
    this.store.status;

  readonly errorMessage =
    this.store.errorMessage;

  readonly currentUser =
    this.store.currentUser;

  readonly guild =
    this.store.guild;

  readonly voiceChannel =
    this.store.voiceChannel;

  readonly participants =
    this.store.participants;

  async initialize(): Promise<void> {
    const isDiscordActivity =
      isDiscordActivityRuntime();

    this.store.setDiscordActivity(
      isDiscordActivity,
    );

    if (!isDiscordActivity) {
      this.store.reset();
      return;
    }

    this.store.setStatus('connecting');
    this.store.setErrorMessage(null);

    try {
      await this.discordSdkService.initialize();
      await this.discordAuthService.authenticate();

      await this.discordGatewayService
        .subscribeToParticipants((response) => {
          this.store.setParticipants(
            mapParticipantsToUsers(response),
          );
        });

      const response =
        await this.discordGatewayService.getParticipants();

      this.store.setParticipants(
        mapParticipantsToUsers(response),
      );

      this.store.setStatus('connected');
    } catch (error: unknown) {
      console.error(
        'Discord initialization error:',
        error,
      );

      this.store.setStatus('failed');
      this.store.setErrorMessage(
        this.getErrorMessage(error),
      );
    }
  }

  private getErrorMessage(
    error: unknown,
  ): string {
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
}