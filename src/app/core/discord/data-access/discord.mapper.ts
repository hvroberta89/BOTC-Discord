import type { Types } from '@discord/embedded-app-sdk';

import { DiscordUser } from './discord.models';

type ParticipantsResponse =
  Types.GetActivityInstanceConnectedParticipantsResponse;

export function mapParticipantsToUsers(
  response: ParticipantsResponse,
): readonly DiscordUser[] {
  return response.participants.map(
    (participant): DiscordUser => ({
      id: participant.id,
      username: participant.username,
      globalName:
        participant.global_name ?? null,
      avatar:
        participant.avatar ?? null,
    }),
  );
}