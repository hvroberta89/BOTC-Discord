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

    it.each(['', '   '])(
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

    it.each(['', '   '])(
      'should reject an empty lobby ID',
      (lobbyId) => {
        expect(() =>
          Game.create({
            id: 'game-1',
            lobbyId,
            storytellerId:
              'storyteller-1',
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
      expect(
        updatedGame.storytellerId,
      ).toBe(game.storytellerId);
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

    it('should reject adding a player after the game has started', () => {
      const firstPlayer = createPlayer({
        id: 'player-1',
        userId: 'user-1',
        seatNumber: 1,
      });

      const secondPlayer = createPlayer({
        id: 'player-2',
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
        .start();

      expect(() =>
        game.addPlayer(secondPlayer),
      ).toThrow(
        'Players can only be added while the game is in setup.',
      );
    });

    it('should reject adding a player after the game has finished', () => {
      const firstPlayer = createPlayer({
        id: 'player-1',
        userId: 'user-1',
        seatNumber: 1,
      });

      const secondPlayer = createPlayer({
        id: 'player-2',
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
        .start()
        .finish();

      expect(() =>
        game.addPlayer(secondPlayer),
      ).toThrow(
        'Players can only be added while the game is in setup.',
      );
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
          storytellerId:
            'storyteller-1',
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

  describe('start', () => {
    it('should start a game in setup state', () => {
      const player = createPlayer();

      const game = Game.create({
        id: 'game-1',
        lobbyId: 'lobby-1',
        storytellerId: 'storyteller-1',
      }).addPlayer(player);

      const startedGame = game.start();

      expect(game.state).toBe('setup');
      expect(startedGame.state).toBe(
        'in-progress',
      );
    });

    it('should preserve the players when starting', () => {
      const player = createPlayer();

      const game = Game.create({
        id: 'game-1',
        lobbyId: 'lobby-1',
        storytellerId: 'storyteller-1',
      }).addPlayer(player);

      const startedGame = game.start();

      expect(startedGame.players).toEqual([
        player,
      ]);
    });

    it('should reject starting a game without players', () => {
      const game = Game.create({
        id: 'game-1',
        lobbyId: 'lobby-1',
        storytellerId: 'storyteller-1',
      });

      expect(() => game.start()).toThrow(
        'Game requires at least one player before it can be started.',
      );
    });

    it('should reject starting an already started game', () => {
      const player = createPlayer();

      const game = Game.create({
        id: 'game-1',
        lobbyId: 'lobby-1',
        storytellerId: 'storyteller-1',
      })
        .addPlayer(player)
        .start();

      expect(() => game.start()).toThrow(
        'Game cannot be started from state "in-progress".',
      );
    });

    it('should reject starting a finished game', () => {
      const player = createPlayer();

      const game = Game.create({
        id: 'game-1',
        lobbyId: 'lobby-1',
        storytellerId: 'storyteller-1',
      })
        .addPlayer(player)
        .start()
        .finish();

      expect(() => game.start()).toThrow(
        'Game cannot be started from state "finished".',
      );
    });
  });

  describe('finish', () => {
    it('should finish an in-progress game', () => {
      const player = createPlayer();

      const game = Game.create({
        id: 'game-1',
        lobbyId: 'lobby-1',
        storytellerId: 'storyteller-1',
      })
        .addPlayer(player)
        .start();

      const finishedGame =
        game.finish();

      expect(game.state).toBe(
        'in-progress',
      );
      expect(finishedGame.state).toBe(
        'finished',
      );
    });

    it('should preserve the players when finishing', () => {
      const player = createPlayer();

      const game = Game.create({
        id: 'game-1',
        lobbyId: 'lobby-1',
        storytellerId: 'storyteller-1',
      })
        .addPlayer(player)
        .start();

      const finishedGame =
        game.finish();

      expect(finishedGame.players).toEqual([
        player,
      ]);
    });

    it('should reject finishing a game in setup state', () => {
      const player = createPlayer();

      const game = Game.create({
        id: 'game-1',
        lobbyId: 'lobby-1',
        storytellerId: 'storyteller-1',
      }).addPlayer(player);

      expect(() => game.finish()).toThrow(
        'Game cannot be finished from state "setup".',
      );
    });

    it('should reject finishing an already finished game', () => {
      const player = createPlayer();

      const game = Game.create({
        id: 'game-1',
        lobbyId: 'lobby-1',
        storytellerId: 'storyteller-1',
      })
        .addPlayer(player)
        .start()
        .finish();

      expect(() => game.finish()).toThrow(
        'Game cannot be finished from state "finished".',
      );
    });
  });

  describe('killPlayer', () => {
    it('should kill a player immutably', () => {
      const player = createPlayer();

      const game = Game.create({
        id: 'game-1',
        lobbyId: 'lobby-1',
        storytellerId: 'storyteller-1',
      })
        .addPlayer(player)
        .start();

      const updatedGame =
        game.killPlayer(player.id);

      expect(
        game.getPlayerById(player.id)
          ?.isAlive,
      ).toBe(true);

      expect(
        updatedGame.getPlayerById(
          player.id,
        )?.isAlive,
      ).toBe(false);

      expect(
        updatedGame.getPlayerById(
          player.id,
        )?.ghostVoteAvailable,
      ).toBe(true);
    });

    it('should preserve the other players', () => {
      const firstPlayer = createPlayer({
        id: 'player-1',
        userId: 'user-1',
        displayName: 'Alice',
        seatNumber: 1,
      });

      const secondPlayer = createPlayer({
        id: 'player-2',
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
        .addPlayer(secondPlayer)
        .start();

      const updatedGame =
        game.killPlayer(firstPlayer.id);

      expect(
        updatedGame.getPlayerById(
          secondPlayer.id,
        ),
      ).toBe(secondPlayer);
    });

    it('should reject a missing player', () => {
      const player = createPlayer();

      const game = Game.create({
        id: 'game-1',
        lobbyId: 'lobby-1',
        storytellerId: 'storyteller-1',
      })
        .addPlayer(player)
        .start();

      expect(() =>
        game.killPlayer(
          'missing-player',
        ),
      ).toThrow(
        'Game player with ID "missing-player" was not found.',
      );
    });

    it('should reject killing an already dead player', () => {
      const player = createPlayer();

      const game = Game.create({
        id: 'game-1',
        lobbyId: 'lobby-1',
        storytellerId: 'storyteller-1',
      })
        .addPlayer(player)
        .start()
        .killPlayer(player.id);

      expect(() =>
        game.killPlayer(player.id),
      ).toThrow(
        `Game player "${player.id}" is already dead.`,
      );
    });

    it('should reject killing a player during setup', () => {
      const player = createPlayer();

      const game = Game.create({
        id: 'game-1',
        lobbyId: 'lobby-1',
        storytellerId: 'storyteller-1',
      }).addPlayer(player);

      expect(() =>
        game.killPlayer(player.id),
      ).toThrow(
        'Players can only be killed while the game is in progress.',
      );
    });

    it('should reject killing a player after the game has finished', () => {
      const player = createPlayer();

      const game = Game.create({
        id: 'game-1',
        lobbyId: 'lobby-1',
        storytellerId: 'storyteller-1',
      })
        .addPlayer(player)
        .start()
        .finish();

      expect(() =>
        game.killPlayer(player.id),
      ).toThrow(
        'Players can only be killed while the game is in progress.',
      );
    });
  });

  describe('revivePlayer', () => {
    it('should revive a dead player', () => {
      const player = createPlayer();

      const game = Game.create({
        id: 'game-1',
        lobbyId: 'lobby-1',
        storytellerId: 'storyteller-1',
      })
        .addPlayer(player)
        .start()
        .killPlayer(player.id);

      const updatedGame =
        game.revivePlayer(player.id);

      expect(
        updatedGame.getPlayerById(
          player.id,
        )?.isAlive,
      ).toBe(true);

      expect(
        updatedGame.getPlayerById(
          player.id,
        )?.ghostVoteAvailable,
      ).toBe(false);
    });

    it('should reject reviving a living player', () => {
      const player = createPlayer();

      const game = Game.create({
        id: 'game-1',
        lobbyId: 'lobby-1',
        storytellerId: 'storyteller-1',
      })
        .addPlayer(player)
        .start();

      expect(() =>
        game.revivePlayer(player.id),
      ).toThrow(
        `Game player "${player.id}" is already alive.`,
      );
    });

    it('should reject reviving a player during setup', () => {
      const player = createPlayer();

      const game = Game.create({
        id: 'game-1',
        lobbyId: 'lobby-1',
        storytellerId: 'storyteller-1',
      }).addPlayer(player);

      expect(() =>
        game.revivePlayer(player.id),
      ).toThrow(
        'Players can only be revived while the game is in progress.',
      );
    });

    it('should reject reviving a player after the game has finished', () => {
      const player = createPlayer();

      const game = Game.create({
        id: 'game-1',
        lobbyId: 'lobby-1',
        storytellerId: 'storyteller-1',
      })
        .addPlayer(player)
        .start()
        .killPlayer(player.id)
        .finish();

      expect(() =>
        game.revivePlayer(player.id),
      ).toThrow(
        'Players can only be revived while the game is in progress.',
      );
    });
  });

  describe('useGhostVote', () => {
    it('should consume a dead player ghost vote', () => {
      const player = createPlayer();

      const game = Game.create({
        id: 'game-1',
        lobbyId: 'lobby-1',
        storytellerId: 'storyteller-1',
      })
        .addPlayer(player)
        .start()
        .killPlayer(player.id);

      const updatedGame =
        game.useGhostVote(player.id);

      expect(
        updatedGame.getPlayerById(
          player.id,
        )?.isAlive,
      ).toBe(false);

      expect(
        updatedGame.getPlayerById(
          player.id,
        )?.ghostVoteAvailable,
      ).toBe(false);
    });

    it('should reject ghost voting by a living player', () => {
      const player = createPlayer();

      const game = Game.create({
        id: 'game-1',
        lobbyId: 'lobby-1',
        storytellerId: 'storyteller-1',
      })
        .addPlayer(player)
        .start();

      expect(() =>
        game.useGhostVote(player.id),
      ).toThrow(
        'Living players do not use ghost votes.',
      );
    });

    it('should reject using a ghost vote twice', () => {
      const player = createPlayer();

      const game = Game.create({
        id: 'game-1',
        lobbyId: 'lobby-1',
        storytellerId: 'storyteller-1',
      })
        .addPlayer(player)
        .start()
        .killPlayer(player.id)
        .useGhostVote(player.id);

      expect(() =>
        game.useGhostVote(player.id),
      ).toThrow(
        `Game player "${player.id}" has no ghost vote available.`,
      );
    });

    it('should reject using a ghost vote during setup', () => {
      const player = createPlayer();

      const game = Game.create({
        id: 'game-1',
        lobbyId: 'lobby-1',
        storytellerId: 'storyteller-1',
      }).addPlayer(player);

      expect(() =>
        game.useGhostVote(player.id),
      ).toThrow(
        'Ghost votes can only be used while the game is in progress.',
      );
    });

    it('should reject using a ghost vote after the game has finished', () => {
      const player = createPlayer();

      const game = Game.create({
        id: 'game-1',
        lobbyId: 'lobby-1',
        storytellerId: 'storyteller-1',
      })
        .addPlayer(player)
        .start()
        .killPlayer(player.id)
        .finish();

      expect(() =>
        game.useGhostVote(player.id),
      ).toThrow(
        'Ghost votes can only be used while the game is in progress.',
      );
    });
  });

  describe('player state queries', () => {
    it('should return living and dead players', () => {
      const livingPlayer = createPlayer({
        id: 'player-1',
        userId: 'user-1',
        displayName: 'Alice',
        seatNumber: 1,
      });

      const deadPlayer = createPlayer({
        id: 'player-2',
        userId: 'user-2',
        displayName: 'Bob',
        seatNumber: 2,
      });

      const game = Game.create({
        id: 'game-1',
        lobbyId: 'lobby-1',
        storytellerId: 'storyteller-1',
      })
        .addPlayer(livingPlayer)
        .addPlayer(deadPlayer)
        .start()
        .killPlayer(deadPlayer.id);

      expect(
        game.getLivingPlayers(),
      ).toEqual([livingPlayer]);

      expect(
        game.getDeadPlayers().map(
          (player) => player.id,
        ),
      ).toEqual([deadPlayer.id]);
    });
  });

  describe('removePlayer', () => {
    it('should remove a player immutably', () => {
      const player = createPlayer();

      const game = Game.create({
        id: 'game-1',
        lobbyId: 'lobby-1',
        storytellerId: 'storyteller-1',
      }).addPlayer(player);

      const updatedGame =
        game.removePlayer(player.id);

      expect(game.players).toEqual([
        player,
      ]);
      expect(updatedGame.players).toEqual(
        [],
      );
      expect(updatedGame).not.toBe(game);
    });

    it('should preserve the other players', () => {
      const firstPlayer = createPlayer({
        id: 'player-1',
        userId: 'user-1',
        displayName: 'Alice',
        seatNumber: 1,
      });

      const secondPlayer = createPlayer({
        id: 'player-2',
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

      const updatedGame =
        game.removePlayer(firstPlayer.id);

      expect(updatedGame.players).toEqual([
        secondPlayer,
      ]);

      expect(
        updatedGame.getPlayerById(
          secondPlayer.id,
        ),
      ).toBe(secondPlayer);
    });

    it('should reject removing a missing player', () => {
      const player = createPlayer();

      const game = Game.create({
        id: 'game-1',
        lobbyId: 'lobby-1',
        storytellerId: 'storyteller-1',
      }).addPlayer(player);

      expect(() =>
        game.removePlayer(
          'missing-player',
        ),
      ).toThrow(
        'Game player with ID "missing-player" was not found.',
      );
    });

    it('should reject removing a player after the game has started', () => {
      const player = createPlayer();

      const game = Game.create({
        id: 'game-1',
        lobbyId: 'lobby-1',
        storytellerId: 'storyteller-1',
      })
        .addPlayer(player)
        .start();

      expect(() =>
        game.removePlayer(player.id),
      ).toThrow(
        'Players can only be removed while the game is in setup.',
      );
    });

    it('should reject removing a player after the game has finished', () => {
      const player = createPlayer();

      const game = Game.create({
        id: 'game-1',
        lobbyId: 'lobby-1',
        storytellerId: 'storyteller-1',
      })
        .addPlayer(player)
        .start()
        .finish();

      expect(() =>
        game.removePlayer(player.id),
      ).toThrow(
        'Players can only be removed while the game is in setup.',
      );
    });
  });

  describe('changePlayerSeat', () => {
    it('should change a player seat immutably', () => {
      const player = createPlayer({
        seatNumber: 1,
      });

      const game = Game.create({
        id: 'game-1',
        lobbyId: 'lobby-1',
        storytellerId: 'storyteller-1',
      }).addPlayer(player);

      const updatedGame =
        game.changePlayerSeat(
          player.id,
          3,
        );

      expect(
        game.getPlayerById(player.id)
          ?.seatNumber,
      ).toBe(1);

      expect(
        updatedGame.getPlayerById(
          player.id,
        )?.seatNumber,
      ).toBe(3);
    });

    it('should preserve the other players', () => {
      const firstPlayer = createPlayer({
        id: 'player-1',
        userId: 'user-1',
        seatNumber: 1,
      });

      const secondPlayer = createPlayer({
        id: 'player-2',
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

      const updatedGame =
        game.changePlayerSeat(
          firstPlayer.id,
          3,
        );

      expect(
        updatedGame.getPlayerById(
          secondPlayer.id,
        ),
      ).toBe(secondPlayer);
    });

    it('should return the same game when the seat does not change', () => {
      const player = createPlayer({
        seatNumber: 1,
      });

      const game = Game.create({
        id: 'game-1',
        lobbyId: 'lobby-1',
        storytellerId: 'storyteller-1',
      }).addPlayer(player);

      const updatedGame =
        game.changePlayerSeat(
          player.id,
          1,
        );

      expect(updatedGame).toBe(game);
    });

    it('should reject an occupied seat', () => {
      const firstPlayer = createPlayer({
        id: 'player-1',
        userId: 'user-1',
        seatNumber: 1,
      });

      const secondPlayer = createPlayer({
        id: 'player-2',
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

      expect(() =>
        game.changePlayerSeat(
          firstPlayer.id,
          2,
        ),
      ).toThrow(
        'Seat 2 is already occupied.',
      );
    });

    it('should reject a missing player', () => {
      const player = createPlayer();

      const game = Game.create({
        id: 'game-1',
        lobbyId: 'lobby-1',
        storytellerId: 'storyteller-1',
      }).addPlayer(player);

      expect(() =>
        game.changePlayerSeat(
          'missing-player',
          2,
        ),
      ).toThrow(
        'Game player with ID "missing-player" was not found.',
      );
    });

    it('should reject changing a seat after the game has started', () => {
      const player = createPlayer();

      const game = Game.create({
        id: 'game-1',
        lobbyId: 'lobby-1',
        storytellerId: 'storyteller-1',
      })
        .addPlayer(player)
        .start();

      expect(() =>
        game.changePlayerSeat(
          player.id,
          2,
        ),
      ).toThrow(
        'Player seats can only be changed while the game is in setup.',
      );
    });

    it('should reject changing a seat after the game has finished', () => {
      const player = createPlayer();

      const game = Game.create({
        id: 'game-1',
        lobbyId: 'lobby-1',
        storytellerId: 'storyteller-1',
      })
        .addPlayer(player)
        .start()
        .finish();

      expect(() =>
        game.changePlayerSeat(
          player.id,
          2,
        ),
      ).toThrow(
        'Player seats can only be changed while the game is in setup.',
      );
    });
  });
});