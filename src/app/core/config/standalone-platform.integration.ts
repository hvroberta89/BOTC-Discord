import { Injectable } from '@angular/core';
import {
  PlatformIntegration,
  PlatformParticipant,
  PlatformUser,
} from '../platform/platform-integration';

@Injectable()
export class StandalonePlatformIntegration
  implements PlatformIntegration {

  async initialize(): Promise<void> {
    // Standalone browser mode requires no SDK initialization.
  }

  async getCurrentUser(): Promise<PlatformUser | null> {
    return null;
  }

  async getParticipants(): Promise<
    readonly PlatformParticipant[]
  > {
    return [];
  }

  async inviteParticipants(): Promise<void> {
    // This will later copy or share the game invitation URL.
  }
}