export type RuntimeMode =
  | 'standalone'
  | 'discord-activity';

export interface RuntimeConfig {
  readonly supabaseUrl: string;
  readonly supabaseAnonKey: string;
  readonly discordClientId: string;
  readonly runtimeMode: RuntimeMode;
}