export type RuntimeMode =
  | 'standalone'
  | 'discord-activity';

export interface RuntimeConfig {
  readonly supabaseUrl: string;
  readonly supabasePublishableKey: string;
  readonly discordClientId: string;
  readonly runtimeMode: RuntimeMode;
}