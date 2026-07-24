import { Game } from './game';
import { GamePlayer } from './game-player';

describe('Game', () => {
  function createPlayer(
    overrides: Partial<{
      id: string;
      userId: string;
      displayName: string;
      seatNumber: number;
    }> = {},
  ): GamePlayer {
    return GamePlayer.create({
      id:
        overrides.id ??
        'game-player-1',
      userId:
        overrides.userId ??
        'user-1',
      displayName:
        overrides.displayName ??
        'Alice',
      seatNumber:
        overrides.seatNumber ??
        1,
    });
  }

  describe('create', () => {
    it('should create an empty game in setup state', () => {
        const game = Game.create({
            id: 'game-1',
            lobbyId: 'lobby-1',
            storytellerId: 'storyteller-1',
        });

        expect(game.id).toBe('game-1');
        expect(game.lobbyId).toBe('lobby-1');
        expect(game.storytellerId).toBe(
            'storyteller-1',
        );
        expect(game.state).toBe('setup');
        expect(game.players).toEqual([]);
    });

    it('should trim IDs', () => {
        const game = Game.create({
            id: '  game-1  ',
            lobbyId: '  lobby-1  ',
            storytellerId:
            '  storyteller-1  ',
        });

        expect(game.id).toBe('game-1');
        expect(game.lobbyId).toBe('lobby-1');
        expect(game.storytellerId).toBe(
            'storyteller-1',
        );
    });

    it.each([
        '',
        '   ',
    ])(
        'should reject an empty storyteller ID',
        (storytellerId) => {
            expect(() =>
            Game.create({
                id: 'game-1',
                lobbyId: 'lobby-1',
                storytellerId,
            }),
            ).toThrow(
            'Storyteller ID cannot be empty.',
            );
        },
    );

    it.each([
      '',
      '   ',
    ])(
      'should reject an empty lobby ID',
      (lobbyId) => {
        expect(() =>
          Game.create({
            id: 'game-1',
            lobbyId,
            storytellerId: 'storyteller-1',
          }),
        ).toThrow(
          'Lobby ID cannot be empty.',
        );
      },
    );
  });

  describe('addPlayer', () => {
    it('should add a player immutably', () => {
      const player = createPlayer();

      const game = Game.create({
        id: 'game-1',
        lobbyId: 'lobby-1',
        storytellerId: 'storyteller-1',
      });

      const updatedGame =
        game.addPlayer(player);

      expect(game.players).toEqual([]);
      expect(updatedGame.players).toEqual([
        player,
      ]);
      expect(updatedGame).not.toBe(game);
    });

    it('should preserve game identity and state', () => {
      const game = Game.create({
        id: 'game-1',
        lobbyId: 'lobby-1',
        storytellerId: 'storyteller-1',
      });

      const updatedGame =
        game.addPlayer(createPlayer());

      expect(updatedGame.id).toBe(
        game.id,
      );
      expect(updatedGame.lobbyId).toBe(
        game.lobbyId,
      );
      expect(updatedGame.state).toBe(
        game.state,
      );
    });

    it('should add multiple players', () => {
      const firstPlayer = createPlayer({
        id: 'game-player-1',
        userId: 'user-1',
        seatNumber: 1,
      });

      const secondPlayer = createPlayer({
        id: 'game-player-2',
        userId: 'user-2',
        displayName: 'Bob',
        seatNumber: 2,
      });

      const game = Game.create({
        id: 'game-1',
        lobbyId: 'lobby-1',
        storytellerId: 'storyteller-1',
      })
        .addPlayer(firstPlayer)
        .addPlayer(secondPlayer);

      expect(game.players).toEqual([
        firstPlayer,
        secondPlayer,
      ]);
    });

    it('should reject a duplicate player ID', () => {
      const firstPlayer = createPlayer({
        id: 'game-player-1',
        userId: 'user-1',
        seatNumber: 1,
      });

      const secondPlayer = createPlayer({
        id: 'game-player-1',
        userId: 'user-2',
        displayName: 'Bob',
        seatNumber: 2,
      });

      const game = Game.create({
        id: 'game-1',
        lobbyId: 'lobby-1',
        storytellerId: 'storyteller-1',
      }).addPlayer(firstPlayer);

      expect(() =>
        game.addPlayer(secondPlayer),
      ).toThrow(
        'Game player with ID "game-player-1" already exists.',
      );
    });

    it('should reject a duplicate user ID', () => {
      const firstPlayer = createPlayer({
        id: 'game-player-1',
        userId: 'user-1',
        seatNumber: 1,
      });

      const secondPlayer = createPlayer({
        id: 'game-player-2',
        userId: 'user-1',
        displayName: 'Bob',
        seatNumber: 2,
      });

      const game = Game.create({
        id: 'game-1',
        lobbyId: 'lobby-1',
        storytellerId: 'storyteller-1',
      }).addPlayer(firstPlayer);

      expect(() =>
        game.addPlayer(secondPlayer),
      ).toThrow(
        'User with ID "user-1" is already in the game.',
      );
    });

    it('should reject an occupied seat', () => {
      const firstPlayer = createPlayer({
        id: 'game-player-1',
        userId: 'user-1',
        seatNumber: 1,
      });

      const secondPlayer = createPlayer({
        id: 'game-player-2',
        userId: 'user-2',
        displayName: 'Bob',
        seatNumber: 1,
      });

      const game = Game.create({
        id: 'game-1',
        lobbyId: 'lobby-1',
        storytellerId: 'storyteller-1',
      }).addPlayer(firstPlayer);

      expect(() =>
        game.addPlayer(secondPlayer),
      ).toThrow(
        'Seat 1 is already occupied.',
      );
    });

    it('should expose a defensive player array', () => {
      const player = createPlayer();

      const game = Game.create({
        id: 'game-1',
        lobbyId: 'lobby-1',
        storytellerId: 'storyteller-1',
      }).addPlayer(player);

      const players =
        game.players as GamePlayer[];

      players.length = 0;

      expect(game.players).toEqual([
        player,
      ]);
    });
  });

  describe('queries', () => {
    it('should return a player by ID', () => {
      const player = createPlayer();

      const game = Game.create({
        id: 'game-1',
        lobbyId: 'lobby-1',
        storytellerId: 'storyteller-1',
      }).addPlayer(player);

      expect(
        game.getPlayerById(player.id),
      ).toBe(player);
    });

    it('should trim player ID', () => {
      const player = createPlayer();

      const game = Game.create({
        id: 'game-1',
        lobbyId: 'lobby-1',
        storytellerId: 'storyteller-1',
      }).addPlayer(player);

      expect(
        game.getPlayerById(
          `  ${player.id}  `,
        ),
      ).toBe(player);
    });

    it('should return undefined for a missing player ID', () => {
      const game = Game.create({
        id: 'game-1',
        lobbyId: 'lobby-1',
        storytellerId: 'storyteller-1',
      });

      expect(
        game.getPlayerById(
          'missing-player',
        ),
      ).toBeUndefined();
    });

    it('should reject an empty player ID', () => {
      const game = Game.create({
        id: 'game-1',
        lobbyId: 'lobby-1',
        storytellerId: 'storyteller-1',
      });

      expect(() =>
        game.getPlayerById('   '),
      ).toThrow(
        'Game player ID cannot be empty.',
      );
    });

    it('should return a player by user ID', () => {
      const player = createPlayer();

      const game = Game.create({
        id: 'game-1',
        lobbyId: 'lobby-1',
        storytellerId: 'storyteller-1',
      }).addPlayer(player);

      expect(
        game.getPlayerByUserId(
          player.userId,
        ),
      ).toBe(player);
    });

    it('should return a player by seat number', () => {
      const player = createPlayer({
        seatNumber: 3,
      });

      const game = Game.create({
        id: 'game-1',
        lobbyId: 'lobby-1',
        storytellerId: 'storyteller-1',
      }).addPlayer(player);

      expect(
        game.getPlayerAtSeat(3),
      ).toBe(player);
    });

    it('should return undefined for an empty seat', () => {
      const game = Game.create({
        id: 'game-1',
        lobbyId: 'lobby-1',
        storytellerId: 'storyteller-1',
      });

      expect(
        game.getPlayerAtSeat(1),
      ).toBeUndefined();
    });

    it.each([
      0,
      -1,
      1.5,
      Number.NaN,
      Number.POSITIVE_INFINITY,
    ])(
      'should reject invalid seat number: %s',
      (seatNumber) => {
        const game = Game.create({
          id: 'game-1',
          lobbyId: 'lobby-1',
          storytellerId: 'storyteller-1',
        });

        expect(() =>
          game.getPlayerAtSeat(
            seatNumber,
          ),
        ).toThrow(
          'Seat number must be a positive integer.',
        );
      },
    );
  });
});