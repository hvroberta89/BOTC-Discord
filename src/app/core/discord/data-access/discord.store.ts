import { Injectable, signal } from '@angular/core';

import {
  DiscordConnectionStatus,
  DiscordGuild,
  DiscordUser,
  DiscordVoiceChannel,
} from './discord.models';

@Injectable({
  providedIn: 'root',
})
export class DiscordStore {
  readonly isDiscordActivity = signal(false);

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

  setDiscordActivity(
    isDiscordActivity: boolean,
  ): void {
    this.isDiscordActivity.set(
      isDiscordActivity,
    );
  }

  setStatus(
    status: DiscordConnectionStatus,
  ): void {
    this.status.set(status);
  }

  setErrorMessage(
    errorMessage: string | null,
  ): void {
    this.errorMessage.set(errorMessage);
  }

  setCurrentUser(
    currentUser: DiscordUser | null,
  ): void {
    this.currentUser.set(currentUser);
  }

  setGuild(
    guild: DiscordGuild | null,
  ): void {
    this.guild.set(guild);
  }

  setVoiceChannel(
    voiceChannel: DiscordVoiceChannel | null,
  ): void {
    this.voiceChannel.set(voiceChannel);
  }

  setParticipants(
    participants: readonly DiscordUser[],
  ): void {
    this.participants.set(participants);
  }

  reset(): void {
    this.status.set('disabled');
    this.errorMessage.set(null);
    this.currentUser.set(null);
    this.guild.set(null);
    this.voiceChannel.set(null);
    this.participants.set([]);
  }
}