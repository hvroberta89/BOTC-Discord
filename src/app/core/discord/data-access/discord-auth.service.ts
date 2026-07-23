import { inject, Injectable } from '@angular/core';

import { RUNTIME_CONFIG } from '../../config/runtime-config.token';
import { DiscordSdkService } from './discord-sdk.service';

interface DiscordTokenResponse {
  readonly access_token?: string;
  readonly message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class DiscordAuthService {
  private readonly runtimeConfig =
    inject(RUNTIME_CONFIG);

  private readonly discordSdkService =
    inject(DiscordSdkService);

  async authenticate(): Promise<void> {
    const discordSdk =
      this.discordSdkService.getClient();

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

    const accessToken =
      await this.exchangeCodeForToken(
        authorization.code,
      );

    await discordSdk.commands.authenticate({
      access_token: accessToken,
    });
  }

  private async exchangeCodeForToken(
    code: string,
  ): Promise<string> {
    const response = await fetch(
      '/.proxy/api/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
        }),
      },
    );

    const responseText =
      await response.text();

    if (!response.ok) {
      throw new Error(
        responseText ||
          'Discord token exchange failed.',
      );
    }

    const tokenData =
      this.parseTokenResponse(responseText);

    if (!tokenData.access_token) {
      throw new Error(
        tokenData.message ??
          'Discord access token is missing.',
      );
    }

    return tokenData.access_token;
  }

  private parseTokenResponse(
    responseText: string,
  ): DiscordTokenResponse {
    try {
      return JSON.parse(
        responseText,
      ) as DiscordTokenResponse;
    } catch {
      throw new Error(
        `Invalid response from Discord token endpoint: ${responseText}`,
      );
    }
  }
}