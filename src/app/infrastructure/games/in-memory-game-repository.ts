import { Injectable } from '@angular/core';

import { GameRepository } from './game-repository';
import { Game } from '../../domain/game/model/game';

@Injectable({
  providedIn: 'root',
})
export class InMemoryGameRepository
  implements GameRepository
{
  private readonly games =
    new Map<string, Game>();

  public async findById(
    gameId: string,
  ): Promise<Game | undefined> {
    const normalizedGameId =
      gameId.trim();

    if (!normalizedGameId) {
      throw new Error(
        'Game ID cannot be empty.',
      );
    }

    return this.games.get(
      normalizedGameId,
    );
  }

  public async save(
    game: Game,
  ): Promise<void> {
    this.games.set(
      game.id,
      game,
    );
  }
}