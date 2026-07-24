import { Lobby } from '../../lobby/model/lobby';
import { LobbyPlayer } from '../../lobby/model/lobby-player';
import { Game } from '../model/game';
import { GamePlayer } from '../model/game-player';

export interface CreateGameFromLobbyParams {
  readonly gameId: string;
  readonly lobby: Lobby;
}

export class GameFactory {
  public create(
    params: CreateGameFromLobbyParams,
  ): Game {
    const storyteller =
      this.getStoryteller(params.lobby);

    const lobbyPlayers =
      this.getEligiblePlayers(params.lobby);

    if (lobbyPlayers.length === 0) {
      throw new Error(
        'A game requires at least one seated player.',
      );
    }

    return lobbyPlayers.reduce(
      (game, lobbyPlayer) =>
        game.addPlayer(
          this.createGamePlayer(lobbyPlayer),
        ),
      Game.create({
        id: params.gameId,
        lobbyId: params.lobby.id,
        storytellerId: storyteller.id,
      }),
    );
  }

  private getStoryteller(
    lobby: Lobby,
  ): LobbyPlayer {
    const storytellers =
      lobby.players.filter(
        (player) =>
          player.role === 'storyteller',
      );

    if (storytellers.length === 0) {
      throw new Error(
        'A game requires a storyteller.',
      );
    }

    if (storytellers.length > 1) {
      throw new Error(
        'A game cannot have multiple storytellers.',
      );
    }

    return storytellers[0];
  }

  private getEligiblePlayers(
    lobby: Lobby,
  ): readonly LobbyPlayer[] {
    return lobby.seatingOrder.players.filter(
      (player) => player.role === 'player',
    );
  }

  private createGamePlayer(
    lobbyPlayer: LobbyPlayer,
  ): GamePlayer {
    const seatNumber =
      lobbyPlayer.seatNumber;

    if (seatNumber === null) {
      throw new Error(
        `Lobby player "${lobbyPlayer.id}" must have a seat.`,
      );
    }

    return GamePlayer.create({
      id: lobbyPlayer.id,
      userId: lobbyPlayer.userId,
      displayName:
        lobbyPlayer.displayName,
      seatNumber,
    });
  }
}