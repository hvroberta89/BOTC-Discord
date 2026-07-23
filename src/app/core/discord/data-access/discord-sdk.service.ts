import { inject, Injectable } from '@angular/core';
import {
  DiscordSDK,
  Events,
  type Types,
} from '@discord/embedded-app-sdk';

import { RUNTIME_CONFIG } from '../../config/runtime-config.token';

@Injectable({
  providedIn: 'root',
})
export class DiscordSdkService {
  private readonly runtimeConfig = inject(RUNTIME_CONFIG);

  private discordSdk: DiscordSDK | null = null;

  async initialize(): Promise<void> {
    const discordSdk = new DiscordSDK(
      this.runtimeConfig.discordClientId,
    );

    this.discordSdk = discordSdk;

    await discordSdk.ready();
  }

  async getParticipants(): Promise<
    Types.GetActivityInstanceConnectedParticipantsResponse
  > {
    return this.getSdk().commands
      .getInstanceConnectedParticipants();
  }

  async subscribeToParticipants(
    handler: (
      response:
        Types.GetActivityInstanceConnectedParticipantsResponse,
    ) => void,
  ): Promise<void> {
    await this.getSdk().subscribe(
      Events.ACTIVITY_INSTANCE_PARTICIPANTS_UPDATE,
      handler,
    );
  }

  private getSdk(): DiscordSDK {
    if (!this.discordSdk) {
      throw new Error(
        'Discord SDK is not initialized.',
      );
    }

    return this.discordSdk;
  }
}