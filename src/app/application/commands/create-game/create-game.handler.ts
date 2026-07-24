import {
  inject,
  Injectable,
} from '@angular/core';

import { Game } from '../../../domain/game/model/game';
import { CommandHandler } from '../command-handler';
import { CreateGameCommand } from './create-game.command';
import { InMemoryLobbyRepository } from '../../../infrastructure/lobby/in-memory-lobby-repository';
import { GameFactory } from '../../../domain/game/factories/game-factory';
import { InMemoryGameRepository } from '../../../infrastructure/games/in-memory-game-repository';

@Injectable({
  providedIn: 'root',
})
export class CreateGameHandler
  implements
    CommandHandler<CreateGameCommand>
{
  public readonly commandType =
    CreateGameCommand.TYPE;

  private readonly lobbyRepository =
    inject(InMemoryLobbyRepository);

  private readonly gameRepository =
    inject(InMemoryGameRepository);

  private readonly gameFactory =
    new GameFactory();

  public async execute(
    command: CreateGameCommand,
  ): Promise<Game> {
    const existingGame =
      await this.gameRepository.findById(
        command.gameId,
      );

    if (existingGame) {
      throw new Error(
        `Game with ID "${command.gameId}" already exists.`,
      );
    }

    const lobby =
      await this.lobbyRepository.findById(
        command.lobbyId,
      );

    if (!lobby) {
      throw new Error(
        `Lobby with ID "${command.lobbyId}" does not exist.`,
      );
    }

    const game =
      this.gameFactory.create({
        gameId: command.gameId,
        lobby,
        scriptId: command.scriptId,
      });

    await this.gameRepository.save(game);

    return game;
  }
}