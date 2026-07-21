export interface PlatformUser {
  readonly externalId: string;
  readonly displayName: string;
  readonly avatarUrl: string | null;
}

export interface PlatformParticipant {
  readonly externalId: string;
  readonly displayName: string;
  readonly avatarUrl: string | null;
  readonly isSpeaking: boolean;
  readonly isMuted: boolean;
}

export interface PlatformIntegration {
  initialize(): Promise<void>;

  getCurrentUser(): Promise<PlatformUser | null>;

  getParticipants(): Promise<
    readonly PlatformParticipant[]
  >;

  inviteParticipants(): Promise<void>;
}