import { inject, Injectable } from '@angular/core';
import {
  DiscordSDK,
  Events,
  type Types,
} from '@discord/embedded-app-sdk';

import { RUNTIME_CONFIG } from '../../config/runtime-config.token';

interface DiscordTokenResponse {
  access_token?: string;
  message?: string;
}

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

    const authorization =
      await discordSdk.commands.authorize({
        client_id:
          this.runtimeConfig.discordClientId,
        response_type: 'code',
        state: '',
        prompt: 'none',
        scope: [
          'identify',
          'applications.commands',
        ],
      });

    const tokenResponse = await fetch('/.proxy/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: authorization.code,
      }),
    });

    const responseText = await tokenResponse.text();

    console.log('Token endpoint response:', responseText);

    if (!tokenResponse.ok) {
      throw new Error(responseText);
    }

    const tokenData =
      JSON.parse(responseText) as DiscordTokenResponse;

    if (
      !tokenResponse.ok ||
      !tokenData.access_token
    ) {
      throw new Error(
        tokenData.message ??
          'Discord token exchange failed.',
      );
    }

    await discordSdk.commands.authenticate({
      access_token: tokenData.access_token,
    });
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