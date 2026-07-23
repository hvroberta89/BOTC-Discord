export interface DiscordUser {
  readonly id: string;
  readonly username: string;
  readonly globalName: string | null;
  readonly avatar: string | null;
}

export interface DiscordGuild {
  readonly id: string;
  readonly name: string;
}

export interface DiscordVoiceChannel {
  readonly id: string;
  readonly name: string;
}

export type DiscordConnectionStatus =
  | 'disabled'
  | 'connecting'
  | 'connected'
  | 'failed';