import { inject, Injectable } from '@angular/core';
import {
  Events,
  type Types,
} from '@discord/embedded-app-sdk';

import { DiscordSdkService } from './discord-sdk.service';

type ParticipantsResponse =
  Types.GetActivityInstanceConnectedParticipantsResponse;

type ParticipantsHandler = (
  response: ParticipantsResponse,
) => void;

@Injectable({
  providedIn: 'root',
})
export class DiscordGatewayService {
  private readonly discordSdkService =
    inject(DiscordSdkService);

  async getParticipants(): Promise<ParticipantsResponse> {
    return this.discordSdkService
      .getClient()
      .commands
      .getInstanceConnectedParticipants();
  }

  async subscribeToParticipants(
    handler: ParticipantsHandler,
  ): Promise<void> {
    await this.discordSdkService
      .getClient()
      .subscribe(
        Events.ACTIVITY_INSTANCE_PARTICIPANTS_UPDATE,
        handler,
      );
  }

  async unsubscribeFromParticipants(
    handler: ParticipantsHandler,
  ): Promise<void> {
    await this.discordSdkService
      .getClient()
      .unsubscribe(
        Events.ACTIVITY_INSTANCE_PARTICIPANTS_UPDATE,
        handler,
      );
  }
}