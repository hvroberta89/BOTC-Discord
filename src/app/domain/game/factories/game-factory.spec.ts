import { Lobby } from '../../lobby/model/lobby';
import { LobbyPlayer } from '../../lobby/model/lobby-player';
import { LobbyPlayerRole } from '../../lobby/model/lobby-player-role';
import { ScriptId } from '../../scripts/model/script-id';
import { GameFactory } from './game-factory';

describe('GameFactory', () => {
  let gameFactory: GameFactory;

  beforeEach(() => {
    gameFactory = new GameFactory();
  });

  function createLobby(): Lobby {
    return Lobby.create({
      id: 'lobby-1',
    });
  }

  function createLobbyPlayer(
    overrides: Partial<{
      id: string;
      userId: string;
      displayName: string;
      role: LobbyPlayerRole;
      seatNumber: number | null;
    }> = {},
  ): LobbyPlayer {
    return LobbyPlayer.create({
      id: overrides.id ?? 'player-1',
      userId: overrides.userId ?? 'user-1',
      displayName:
        overrides.displayName ?? 'Alice',
      role: overrides.role ?? 'player',
      seatNumber:
        overrides.seatNumber ?? null,
    });
  }

  describe('create', () => {
    it('should create a game from a lobby', () => {
      const storyteller =
        createLobbyPlayer({
          id: 'storyteller-1',
          userId: 'storyteller-user-1',
          displayName: 'Storyteller',
          role: 'storyteller',
        });

      const firstPlayer =
        createLobbyPlayer({
          id: 'player-1',
          userId: 'user-1',
          displayName: 'Alice',
          seatNumber: 1,
        });

      const secondPlayer =
        createLobbyPlayer({
          id: 'player-2',
          userId: 'user-2',
          displayName: 'Bob',
          seatNumber: 2,
        });

      const lobby = createLobby()
        .addPlayer(storyteller)
        .addPlayer(firstPlayer)
        .addPlayer(secondPlayer);

      const game = gameFactory.create({
        gameId: 'game-1',
        lobby,
        scriptId: ScriptId.create(
          'trouble-brewing',
        ),
      });

      expect(game.id).toBe('game-1');
      expect(game.lobbyId).toBe('lobby-1');
      expect(game.storytellerId).toBe(
        storyteller.id,
      );
      expect(game.state).toBe('setup');

      expect(game.players).toHaveLength(2);
    });

    it('should copy lobby player data into game players', () => {
      const storyteller =
        createLobbyPlayer({
          id: 'storyteller-1',
          userId: 'storyteller-user-1',
          role: 'storyteller',
        });

      const lobbyPlayer =
        createLobbyPlayer({
          id: 'player-1',
          userId: 'user-1',
          displayName: 'Alice',
          seatNumber: 3,
        });

      const lobby = createLobby()
        .addPlayer(storyteller)
        .addPlayer(lobbyPlayer);

      const game = gameFactory.create({
        gameId: 'game-1',
        lobby,
        scriptId: ScriptId.create(
          'trouble-brewing',
        ),
      });

      expect(game.players[0]).toEqual(
        expect.objectContaining({
          id: 'player-1',
          userId: 'user-1',
          displayName: 'Alice',
          seatNumber: 3,
        }),
      );
    });

    it('should preserve the lobby seating order', () => {
      const storyteller =
        createLobbyPlayer({
          id: 'storyteller-1',
          userId: 'storyteller-user-1',
          role: 'storyteller',
        });

      const thirdSeatPlayer =
        createLobbyPlayer({
          id: 'player-3',
          userId: 'user-3',
          displayName: 'Charlie',
          seatNumber: 3,
        });

      const firstSeatPlayer =
        createLobbyPlayer({
          id: 'player-1',
          userId: 'user-1',
          displayName: 'Alice',
          seatNumber: 1,
        });

      const secondSeatPlayer =
        createLobbyPlayer({
          id: 'player-2',
          userId: 'user-2',
          displayName: 'Bob',
          seatNumber: 2,
        });

      const lobby = createLobby()
        .addPlayer(storyteller)
        .addPlayer(thirdSeatPlayer)
        .addPlayer(firstSeatPlayer)
        .addPlayer(secondSeatPlayer);

      const game = gameFactory.create({
        gameId: 'game-1',
        lobby,
        scriptId: ScriptId.create(
          'trouble-brewing',
        ),
      });

      expect(
        game.players.map(
          (player) => player.seatNumber,
        ),
      ).toEqual([1, 2, 3]);

      expect(
        game.players.map(
          (player) => player.id,
        ),
      ).toEqual([
        'player-1',
        'player-2',
        'player-3',
      ]);
    });

    it('should exclude spectators', () => {
      const storyteller =
        createLobbyPlayer({
          id: 'storyteller-1',
          userId: 'storyteller-user-1',
          role: 'storyteller',
        });

      const player = createLobbyPlayer({
        id: 'player-1',
        userId: 'user-1',
        seatNumber: 1,
      });

      const spectator =
        createLobbyPlayer({
          id: 'spectator-1',
          userId: 'spectator-user-1',
          displayName: 'Spectator',
          role: 'spectator',
        });

      const lobby = createLobby()
        .addPlayer(storyteller)
        .addPlayer(player)
        .addPlayer(spectator);

      const game = gameFactory.create({
        gameId: 'game-1',
        lobby,
        scriptId: ScriptId.create(
          'trouble-brewing',
        ),
      });

      expect(game.players).toHaveLength(1);

      expect(
        game.getPlayerById(player.id),
      ).toBeDefined();

      expect(
        game.getPlayerById(spectator.id),
      ).toBeUndefined();
    });

    it('should exclude unseated players', () => {
      const storyteller =
        createLobbyPlayer({
          id: 'storyteller-1',
          userId: 'storyteller-user-1',
          role: 'storyteller',
        });

      const seatedPlayer =
        createLobbyPlayer({
          id: 'player-1',
          userId: 'user-1',
          seatNumber: 1,
        });

      const unseatedPlayer =
        createLobbyPlayer({
          id: 'player-2',
          userId: 'user-2',
          displayName: 'Bob',
          seatNumber: null,
        });

      const lobby = createLobby()
        .addPlayer(storyteller)
        .addPlayer(seatedPlayer)
        .addPlayer(unseatedPlayer);

      const game = gameFactory.create({
        gameId: 'game-1',
        lobby,
        scriptId: ScriptId.create(
          'trouble-brewing',
        ),
      });

      expect(game.players).toHaveLength(1);

      expect(
        game.getPlayerById(
          seatedPlayer.id,
        ),
      ).toBeDefined();

      expect(
        game.getPlayerById(
          unseatedPlayer.id,
        ),
      ).toBeUndefined();
    });

    it('should reject a lobby without a storyteller', () => {
      const player = createLobbyPlayer({
        id: 'player-1',
        userId: 'user-1',
        seatNumber: 1,
      });

      const lobby =
        createLobby().addPlayer(player);

      expect(() =>
        gameFactory.create({
          gameId: 'game-1',
          lobby,
          scriptId: ScriptId.create(
            'trouble-brewing',
          ),
        }),
      ).toThrow(
        'A game requires a storyteller.',
      );
    });

    it('should reject a lobby without seated players', () => {
      const storyteller =
        createLobbyPlayer({
          id: 'storyteller-1',
          userId: 'storyteller-user-1',
          role: 'storyteller',
        });

      const unseatedPlayer =
        createLobbyPlayer({
          id: 'player-1',
          userId: 'user-1',
          seatNumber: null,
        });

      const spectator =
        createLobbyPlayer({
          id: 'spectator-1',
          userId: 'spectator-user-1',
          role: 'spectator',
        });

      const lobby = createLobby()
        .addPlayer(storyteller)
        .addPlayer(unseatedPlayer)
        .addPlayer(spectator);

      expect(() =>
        gameFactory.create({
          gameId: 'game-1',
          lobby,
          scriptId: ScriptId.create(
            'trouble-brewing',
          ),
        }),
      ).toThrow(
        'A game requires at least one seated player.',
      );
    });

    it('should propagate invalid game ID validation', () => {
      const storyteller =
        createLobbyPlayer({
          id: 'storyteller-1',
          userId: 'storyteller-user-1',
          role: 'storyteller',
        });

      const player = createLobbyPlayer({
        id: 'player-1',
        userId: 'user-1',
        seatNumber: 1,
      });

      const lobby = createLobby()
        .addPlayer(storyteller)
        .addPlayer(player);

      expect(() =>
        gameFactory.create({
          gameId: '   ',
          lobby,
          scriptId: ScriptId.create(
            'trouble-brewing',
          ),
        }),
      ).toThrow(
        'Game ID cannot be empty.',
      );
    });

    it('should not modify the source lobby', () => {
      const storyteller =
        createLobbyPlayer({
          id: 'storyteller-1',
          userId: 'storyteller-user-1',
          role: 'storyteller',
        });

      const player = createLobbyPlayer({
        id: 'player-1',
        userId: 'user-1',
        seatNumber: 1,
      });

      const lobby = createLobby()
        .addPlayer(storyteller)
        .addPlayer(player);

      const originalPlayers =
        lobby.players;

      gameFactory.create({
        gameId: 'game-1',
        lobby,
        scriptId: ScriptId.create(
          'trouble-brewing',
        ),
      });

      expect(lobby.players).toEqual(
        originalPlayers,
      );
    });
  });
});