import { Injectable } from '@angular/core';

import { LobbyRepository } from './lobby-repository';
import { Lobby } from '../../domain/lobby/model/lobby';

@Injectable({
  providedIn: 'root',
})
export class InMemoryLobbyRepository
  implements LobbyRepository
{
  private readonly lobbies =
    new Map<string, Lobby>();

  public async findById(
    lobbyId: string,
  ): Promise<Lobby | undefined> {
    const normalizedLobbyId =
      lobbyId.trim();

    if (!normalizedLobbyId) {
      throw new Error(
        'Lobby ID cannot be empty.',
      );
    }

    return this.lobbies.get(
      normalizedLobbyId,
    );
  }

  public async save(
    lobby: Lobby,
  ): Promise<void> {
    this.lobbies.set(
      lobby.id,
      lobby,
    );
  }
}