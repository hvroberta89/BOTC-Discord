import { inject, Injectable } from '@angular/core';
import { DiscordSDK } from '@discord/embedded-app-sdk';

import { RUNTIME_CONFIG } from '../../config/runtime-config.token';

@Injectable({
  providedIn: 'root',
})
export class DiscordSdkService {
  private readonly runtimeConfig =
    inject(RUNTIME_CONFIG);

  private discordSdk: DiscordSDK | null = null;

  async initialize(): Promise<void> {
    if (this.discordSdk) {
      return;
    }

    this.discordSdk = new DiscordSDK(
      this.runtimeConfig.discordClientId,
    );

    await this.discordSdk.ready();
  }

  getClient(): DiscordSDK {
    if (!this.discordSdk) {
      throw new Error(
        'Discord SDK is not initialized.',
      );
    }

    return this.discordSdk;
  }
}