import { CharacterId } from '../../characters/model/character-id';
import { ScriptId } from '../../scripts/model/script-id';
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

  function createGame(): Game {
    return Game.create({
      id: 'game-1',
      lobbyId: 'lobby-1',
      storytellerId:
        'storyteller-1',
      scriptId:
        ScriptId.create(
          'trouble-brewing',
        ),
    });
  }

  function assignCharacterToEveryPlayer(
    game: Game,
  ): Game {
    return game.assignCharacters(
      game.players.map(
        (player, index) => ({
          playerId: player.id,
          characterId:
            CharacterId.create(
              `character-${index + 1}`,
            ),
        }),
      ),
    );
  }

  function startGame(
    game: Game,
  ): Game {
    return assignCharacterToEveryPlayer(
      game,
    ).start();
  }

  describe('create', () => {
    it('should create an empty game in setup state', () => {
      const game = createGame();

      expect(game.id).toBe('game-1');
      expect(game.lobbyId).toBe(
        'lobby-1',
      );
      expect(game.storytellerId).toBe(
        'storyteller-1',
      );
      expect(game.scriptId.value).toBe(
        'trouble-brewing',
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
        scriptId:
          ScriptId.create(
            'trouble-brewing',
          ),
      });

      expect(game.id).toBe('game-1');
      expect(game.lobbyId).toBe(
        'lobby-1',
      );
      expect(game.storytellerId).toBe(
        'storyteller-1',
      );
    });

    it.each(['', '   '])(
      'should reject an empty game ID',
      (id) => {
        expect(() =>
          Game.create({
            id,
            lobbyId: 'lobby-1',
            storytellerId:
              'storyteller-1',
            scriptId:
              ScriptId.create(
                'trouble-brewing',
              ),
          }),
        ).toThrow(
          'Game ID cannot be empty.',
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
            scriptId:
              ScriptId.create(
                'trouble-brewing',
              ),
          }),
        ).toThrow(
          'Lobby ID cannot be empty.',
        );
      },
    );

    it.each(['', '   '])(
      'should reject an empty storyteller ID',
      (storytellerId) => {
        expect(() =>
          Game.create({
            id: 'game-1',
            lobbyId: 'lobby-1',
            storytellerId,
            scriptId:
              ScriptId.create(
                'trouble-brewing',
              ),
          }),
        ).toThrow(
          'Storyteller ID cannot be empty.',
        );
      },
    );
  });

  describe('addPlayer', () => {
    it('should add a player immutably', () => {
      const player = createPlayer();
      const game = createGame();

      const updatedGame =
        game.addPlayer(player);

      expect(game.players).toEqual([]);

      expect(
        updatedGame.players,
      ).toEqual([player]);

      expect(updatedGame).not.toBe(
        game,
      );
    });

    it('should preserve game identity and state', () => {
      const game = createGame();

      const updatedGame =
        game.addPlayer(
          createPlayer(),
        );

      expect(updatedGame.id).toBe(
        game.id,
      );

      expect(updatedGame.lobbyId).toBe(
        game.lobbyId,
      );

      expect(
        updatedGame.storytellerId,
      ).toBe(game.storytellerId);

      expect(updatedGame.scriptId).toBe(
        game.scriptId,
      );

      expect(updatedGame.state).toBe(
        game.state,
      );
    });

    it('should add multiple players', () => {
      const firstPlayer =
        createPlayer({
          id: 'player-1',
          userId: 'user-1',
          seatNumber: 1,
        });

      const secondPlayer =
        createPlayer({
          id: 'player-2',
          userId: 'user-2',
          displayName: 'Bob',
          seatNumber: 2,
        });

      const game = createGame()
        .addPlayer(firstPlayer)
        .addPlayer(secondPlayer);

      expect(game.players).toEqual([
        firstPlayer,
        secondPlayer,
      ]);
    });

    it('should reject a duplicate player ID', () => {
      const firstPlayer =
        createPlayer({
          id: 'player-1',
          userId: 'user-1',
          seatNumber: 1,
        });

      const secondPlayer =
        createPlayer({
          id: 'player-1',
          userId: 'user-2',
          displayName: 'Bob',
          seatNumber: 2,
        });

      const game =
        createGame().addPlayer(
          firstPlayer,
        );

      expect(() =>
        game.addPlayer(secondPlayer),
      ).toThrow(
        'Game player with ID "player-1" already exists.',
      );
    });

    it('should reject a duplicate user ID', () => {
      const firstPlayer =
        createPlayer({
          id: 'player-1',
          userId: 'user-1',
          seatNumber: 1,
        });

      const secondPlayer =
        createPlayer({
          id: 'player-2',
          userId: 'user-1',
          displayName: 'Bob',
          seatNumber: 2,
        });

      const game =
        createGame().addPlayer(
          firstPlayer,
        );

      expect(() =>
        game.addPlayer(secondPlayer),
      ).toThrow(
        'User with ID "user-1" is already in the game.',
      );
    });

    it('should reject an occupied seat', () => {
      const firstPlayer =
        createPlayer({
          id: 'player-1',
          userId: 'user-1',
          seatNumber: 1,
        });

      const secondPlayer =
        createPlayer({
          id: 'player-2',
          userId: 'user-2',
          displayName: 'Bob',
          seatNumber: 1,
        });

      const game =
        createGame().addPlayer(
          firstPlayer,
        );

      expect(() =>
        game.addPlayer(secondPlayer),
      ).toThrow(
        'Seat 1 is already occupied.',
      );
    });

    it('should expose a defensive player array', () => {
      const player = createPlayer();

      const game =
        createGame().addPlayer(
          player,
        );

      const players =
        game.players as GamePlayer[];

      players.length = 0;

      expect(game.players).toEqual([
        player,
      ]);
    });

    it('should reject adding a player after the game has started', () => {
      const firstPlayer =
        createPlayer({
          id: 'player-1',
          userId: 'user-1',
          seatNumber: 1,
        });

      const secondPlayer =
        createPlayer({
          id: 'player-2',
          userId: 'user-2',
          displayName: 'Bob',
          seatNumber: 2,
        });

      const game = startGame(
        createGame().addPlayer(
          firstPlayer,
        ),
      );

      expect(() =>
        game.addPlayer(secondPlayer),
      ).toThrow(
        'Players can only be added while the game is in setup.',
      );
    });

    it('should reject adding a player after the game has finished', () => {
      const firstPlayer =
        createPlayer({
          id: 'player-1',
          userId: 'user-1',
          seatNumber: 1,
        });

      const secondPlayer =
        createPlayer({
          id: 'player-2',
          userId: 'user-2',
          displayName: 'Bob',
          seatNumber: 2,
        });

      const game = startGame(
        createGame().addPlayer(
          firstPlayer,
        ),
      ).finish();

      expect(() =>
        game.addPlayer(secondPlayer),
      ).toThrow(
        'Players can only be added while the game is in setup.',
      );
    });
  });

  describe('removePlayer', () => {
    it('should remove a player immutably', () => {
      const player = createPlayer();

      const game =
        createGame().addPlayer(
          player,
        );

      const updatedGame =
        game.removePlayer(player.id);

      expect(game.players).toEqual([
        player,
      ]);

      expect(
        updatedGame.players,
      ).toEqual([]);

      expect(updatedGame).not.toBe(
        game,
      );
    });

    it('should preserve the other players', () => {
      const firstPlayer =
        createPlayer({
          id: 'player-1',
          userId: 'user-1',
          seatNumber: 1,
        });

      const secondPlayer =
        createPlayer({
          id: 'player-2',
          userId: 'user-2',
          displayName: 'Bob',
          seatNumber: 2,
        });

      const game = createGame()
        .addPlayer(firstPlayer)
        .addPlayer(secondPlayer);

      const updatedGame =
        game.removePlayer(
          firstPlayer.id,
        );

      expect(
        updatedGame.players,
      ).toEqual([secondPlayer]);

      expect(
        updatedGame.getPlayerById(
          secondPlayer.id,
        ),
      ).toBe(secondPlayer);
    });

    it('should reject removing a missing player', () => {
      const game =
        createGame().addPlayer(
          createPlayer(),
        );

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

      const game = startGame(
        createGame().addPlayer(
          player,
        ),
      );

      expect(() =>
        game.removePlayer(player.id),
      ).toThrow(
        'Players can only be removed while the game is in setup.',
      );
    });

    it('should reject removing a player after the game has finished', () => {
      const player = createPlayer();

      const game = startGame(
        createGame().addPlayer(
          player,
        ),
      ).finish();

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

      const game =
        createGame().addPlayer(
          player,
        );

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

      expect(updatedGame).not.toBe(
        game,
      );
    });

    it('should return the same game when the seat does not change', () => {
      const player = createPlayer({
        seatNumber: 2,
      });

      const game =
        createGame().addPlayer(
          player,
        );

      const updatedGame =
        game.changePlayerSeat(
          player.id,
          2,
        );

      expect(updatedGame).toBe(game);
    });

    it('should preserve the other players', () => {
      const firstPlayer =
        createPlayer({
          id: 'player-1',
          userId: 'user-1',
          seatNumber: 1,
        });

      const secondPlayer =
        createPlayer({
          id: 'player-2',
          userId: 'user-2',
          displayName: 'Bob',
          seatNumber: 2,
        });

      const game = createGame()
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

    it('should reject changing to an occupied seat', () => {
      const firstPlayer =
        createPlayer({
          id: 'player-1',
          userId: 'user-1',
          seatNumber: 1,
        });

      const secondPlayer =
        createPlayer({
          id: 'player-2',
          userId: 'user-2',
          seatNumber: 2,
        });

      const game = createGame()
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

    it.each([
      0,
      -1,
      1.5,
      Number.NaN,
      Number.POSITIVE_INFINITY,
    ])(
      'should reject invalid seat number: %s',
      (seatNumber) => {
        const player =
          createPlayer();

        const game =
          createGame().addPlayer(
            player,
          );

        expect(() =>
          game.changePlayerSeat(
            player.id,
            seatNumber,
          ),
        ).toThrow(
          'Seat number must be a positive integer.',
        );
      },
    );

    it('should reject changing the seat of a missing player', () => {
      const game =
        createGame().addPlayer(
          createPlayer(),
        );

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

      const game = startGame(
        createGame().addPlayer(
          player,
        ),
      );

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

      const game = startGame(
        createGame().addPlayer(
          player,
        ),
      ).finish();

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

  describe('queries', () => {
    it('should return a player by ID', () => {
      const player = createPlayer();

      const game =
        createGame().addPlayer(
          player,
        );

      expect(
        game.getPlayerById(player.id),
      ).toBe(player);
    });

    it('should trim player ID', () => {
      const player = createPlayer();

      const game =
        createGame().addPlayer(
          player,
        );

      expect(
        game.getPlayerById(
          `  ${player.id}  `,
        ),
      ).toBe(player);
    });

    it('should return undefined for a missing player ID', () => {
      const game = createGame();

      expect(
        game.getPlayerById(
          'missing-player',
        ),
      ).toBeUndefined();
    });

    it('should reject an empty player ID', () => {
      const game = createGame();

      expect(() =>
        game.getPlayerById('   '),
      ).toThrow(
        'Game player ID cannot be empty.',
      );
    });

    it('should return a player by user ID', () => {
      const player = createPlayer();

      const game =
        createGame().addPlayer(
          player,
        );

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

      const game =
        createGame().addPlayer(
          player,
        );

      expect(
        game.getPlayerAtSeat(3),
      ).toBe(player);
    });

    it('should return undefined for an empty seat', () => {
      const game = createGame();

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
        const game = createGame();

        expect(() =>
          game.getPlayerAtSeat(
            seatNumber,
          ),
        ).toThrow(
          'Seat number must be a positive integer.',
        );
      },
    );

    it('should return a player by character ID', () => {
      const player = createPlayer();

      const game = createGame()
        .addPlayer(player)
        .assignCharacters([
          {
            playerId: player.id,
            characterId:
              CharacterId.create(
                'imp',
              ),
          },
        ]);

      expect(
        game.getPlayerByCharacterId(
          CharacterId.create('imp'),
        ),
      ).toBe(
        game.getPlayerById(player.id),
      );
    });

    it('should return undefined for an unassigned character', () => {
      const game = createGame();

      expect(
        game.getPlayerByCharacterId(
          CharacterId.create('imp'),
        ),
      ).toBeUndefined();
    });
  });

  describe('assignCharacters', () => {
    it('should assign one character to every player immutably', () => {
      const firstPlayer =
        createPlayer({
          id: 'player-1',
          userId: 'user-1',
          displayName: 'Alice',
          seatNumber: 1,
        });

      const secondPlayer =
        createPlayer({
          id: 'player-2',
          userId: 'user-2',
          displayName: 'Bob',
          seatNumber: 2,
        });

      const firstCharacterId =
        CharacterId.create(
          'washerwoman',
        );

      const secondCharacterId =
        CharacterId.create('imp');

      const game = createGame()
        .addPlayer(firstPlayer)
        .addPlayer(secondPlayer);

      const updatedGame =
        game.assignCharacters([
          {
            playerId:
              firstPlayer.id,
            characterId:
              firstCharacterId,
          },
          {
            playerId:
              secondPlayer.id,
            characterId:
              secondCharacterId,
          },
        ]);

      expect(
        game.getPlayerById(
          firstPlayer.id,
        )?.characterId,
      ).toBeNull();

      expect(
        game.getPlayerById(
          secondPlayer.id,
        )?.characterId,
      ).toBeNull();

      expect(
        updatedGame.getPlayerById(
          firstPlayer.id,
        )?.characterId,
      ).toBe(firstCharacterId);

      expect(
        updatedGame.getPlayerById(
          secondPlayer.id,
        )?.characterId,
      ).toBe(secondCharacterId);

      expect(updatedGame).not.toBe(
        game,
      );
    });

    it('should reject a partial assignment', () => {
      const firstPlayer =
        createPlayer({
          id: 'player-1',
          userId: 'user-1',
          seatNumber: 1,
        });

      const secondPlayer =
        createPlayer({
          id: 'player-2',
          userId: 'user-2',
          seatNumber: 2,
        });

      const game = createGame()
        .addPlayer(firstPlayer)
        .addPlayer(secondPlayer);

      expect(() =>
        game.assignCharacters([
          {
            playerId:
              firstPlayer.id,
            characterId:
              CharacterId.create(
                'washerwoman',
              ),
          },
        ]),
      ).toThrow(
        'Every game player must receive exactly one character.',
      );
    });

    it('should reject extra assignments', () => {
      const player = createPlayer();

      const game =
        createGame().addPlayer(
          player,
        );

      expect(() =>
        game.assignCharacters([
          {
            playerId: player.id,
            characterId:
              CharacterId.create(
                'imp',
              ),
          },
          {
            playerId:
              'missing-player',
            characterId:
              CharacterId.create(
                'poisoner',
              ),
          },
        ]),
      ).toThrow(
        'Every game player must receive exactly one character.',
      );
    });

    it('should reject assigning multiple characters to the same player', () => {
      const firstPlayer =
        createPlayer({
          id: 'player-1',
          userId: 'user-1',
          seatNumber: 1,
        });

      const secondPlayer =
        createPlayer({
          id: 'player-2',
          userId: 'user-2',
          seatNumber: 2,
        });

      const game = createGame()
        .addPlayer(firstPlayer)
        .addPlayer(secondPlayer);

      expect(() =>
        game.assignCharacters([
          {
            playerId:
              firstPlayer.id,
            characterId:
              CharacterId.create(
                'washerwoman',
              ),
          },
          {
            playerId:
              firstPlayer.id,
            characterId:
              CharacterId.create(
                'imp',
              ),
          },
        ]),
      ).toThrow(
        'Game player "player-1" received multiple character assignments.',
      );
    });

    it('should reject assigning the same character to multiple players', () => {
      const firstPlayer =
        createPlayer({
          id: 'player-1',
          userId: 'user-1',
          seatNumber: 1,
        });

      const secondPlayer =
        createPlayer({
          id: 'player-2',
          userId: 'user-2',
          seatNumber: 2,
        });

      const game = createGame()
        .addPlayer(firstPlayer)
        .addPlayer(secondPlayer);

      expect(() =>
        game.assignCharacters([
          {
            playerId:
              firstPlayer.id,
            characterId:
              CharacterId.create(
                'imp',
              ),
          },
          {
            playerId:
              secondPlayer.id,
            characterId:
              CharacterId.create(
                'imp',
              ),
          },
        ]),
      ).toThrow(
        'Character "imp" was assigned to multiple game players.',
      );
    });

    it('should reject an unknown player assignment', () => {
      const firstPlayer =
        createPlayer({
          id: 'player-1',
          userId: 'user-1',
          seatNumber: 1,
        });

      const secondPlayer =
        createPlayer({
          id: 'player-2',
          userId: 'user-2',
          seatNumber: 2,
        });

      const game = createGame()
        .addPlayer(firstPlayer)
        .addPlayer(secondPlayer);

      expect(() =>
        game.assignCharacters([
          {
            playerId:
              firstPlayer.id,
            characterId:
              CharacterId.create(
                'washerwoman',
              ),
          },
          {
            playerId:
              'missing-player',
            characterId:
              CharacterId.create(
                'imp',
              ),
          },
        ]),
      ).toThrow(
        'Game player "player-2" has no character assignment.',
      );
    });

    it('should reject an empty player ID', () => {
      const player = createPlayer();

      const game =
        createGame().addPlayer(
          player,
        );

      expect(() =>
        game.assignCharacters([
          {
            playerId: '   ',
            characterId:
              CharacterId.create(
                'imp',
              ),
          },
        ]),
      ).toThrow(
        'Game player ID cannot be empty.',
      );
    });

    it('should return the same game when the same assignments are applied again', () => {
      const firstPlayer =
        createPlayer({
          id: 'player-1',
          userId: 'user-1',
          seatNumber: 1,
        });

      const secondPlayer =
        createPlayer({
          id: 'player-2',
          userId: 'user-2',
          seatNumber: 2,
        });

      const assignments = [
        {
          playerId:
            firstPlayer.id,
          characterId:
            CharacterId.create(
              'washerwoman',
            ),
        },
        {
          playerId:
            secondPlayer.id,
          characterId:
            CharacterId.create(
              'imp',
            ),
        },
      ] as const;

      const game = createGame()
        .addPlayer(firstPlayer)
        .addPlayer(secondPlayer)
        .assignCharacters(
          assignments,
        );

      const updatedGame =
        game.assignCharacters([
          {
            playerId:
              firstPlayer.id,
            characterId:
              CharacterId.create(
                'washerwoman',
              ),
          },
          {
            playerId:
              secondPlayer.id,
            characterId:
              CharacterId.create(
                'imp',
              ),
          },
        ]);

      expect(updatedGame).toBe(game);
    });

    it('should reject replacing an already assigned character', () => {
      const player = createPlayer();

      const game = createGame()
        .addPlayer(player)
        .assignCharacters([
          {
            playerId: player.id,
            characterId:
              CharacterId.create(
                'imp',
              ),
          },
        ]);

      expect(() =>
        game.assignCharacters([
          {
            playerId: player.id,
            characterId:
              CharacterId.create(
                'washerwoman',
              ),
          },
        ]),
      ).toThrow(
        `Game player "${player.id}" already has character "imp".`,
      );
    });

    it('should reject character assignment after the game has started', () => {
      const player = createPlayer();

      const game = startGame(
        createGame().addPlayer(
          player,
        ),
      );

      expect(() =>
        game.assignCharacters([
          {
            playerId: player.id,
            characterId:
              CharacterId.create(
                'imp',
              ),
          },
        ]),
      ).toThrow(
        'Characters can only be assigned while the game is in setup.',
      );
    });

    it('should reject character assignment after the game has finished', () => {
      const player = createPlayer();

      const game = startGame(
        createGame().addPlayer(
          player,
        ),
      ).finish();

      expect(() =>
        game.assignCharacters([
          {
            playerId: player.id,
            characterId:
              CharacterId.create(
                'imp',
              ),
          },
        ]),
      ).toThrow(
        'Characters can only be assigned while the game is in setup.',
      );
    });
  });

  describe('start', () => {
    it('should start a game when every player has a character', () => {
      const firstPlayer =
        createPlayer({
          id: 'player-1',
          userId: 'user-1',
          seatNumber: 1,
        });

      const secondPlayer =
        createPlayer({
          id: 'player-2',
          userId: 'user-2',
          displayName: 'Bob',
          seatNumber: 2,
        });

      const game = createGame()
        .addPlayer(firstPlayer)
        .addPlayer(secondPlayer)
        .assignCharacters([
          {
            playerId:
              firstPlayer.id,
            characterId:
              CharacterId.create(
                'washerwoman',
              ),
          },
          {
            playerId:
              secondPlayer.id,
            characterId:
              CharacterId.create(
                'imp',
              ),
          },
        ]);

      const startedGame =
        game.start();

      expect(game.state).toBe(
        'setup',
      );

      expect(startedGame.state).toBe(
        'in-progress',
      );

      expect(startedGame).not.toBe(
        game,
      );
    });

    it('should preserve the assigned players when starting', () => {
      const player = createPlayer();

      const game =
        assignCharacterToEveryPlayer(
          createGame().addPlayer(
            player,
          ),
        );

      const assignedPlayer =
        game.getPlayerById(player.id);

      const startedGame =
        game.start();

      expect(
        startedGame.players,
      ).toEqual([assignedPlayer]);
    });

    it('should reject starting a game without players', () => {
      const game = createGame();

      expect(() =>
        game.start(),
      ).toThrow(
        'Game requires at least one player before it can be started.',
      );
    });

    it('should reject starting when a player has no character', () => {
      const player = createPlayer();

      const game =
        createGame().addPlayer(
          player,
        );

      expect(() =>
        game.start(),
      ).toThrow(
        `Game player "${player.id}" must receive a character before the game can be started.`,
      );
    });

    it('should reject starting an already started game', () => {
      const player = createPlayer();

      const game = startGame(
        createGame().addPlayer(
          player,
        ),
      );

      expect(() =>
        game.start(),
      ).toThrow(
        'Game cannot be started from state "in-progress".',
      );
    });

    it('should reject starting a finished game', () => {
      const player = createPlayer();

      const game = startGame(
        createGame().addPlayer(
          player,
        ),
      ).finish();

      expect(() =>
        game.start(),
      ).toThrow(
        'Game cannot be started from state "finished".',
      );
    });
  });

  describe('finish', () => {
    it('should finish an in-progress game', () => {
      const player = createPlayer();

      const game = startGame(
        createGame().addPlayer(
          player,
        ),
      );

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

      const game = startGame(
        createGame().addPlayer(
          player,
        ),
      );

      const finishedGame =
        game.finish();

      expect(
        finishedGame.players,
      ).toEqual(game.players);
    });

    it('should reject finishing a game in setup state', () => {
      const game =
        createGame().addPlayer(
          createPlayer(),
        );

      expect(() =>
        game.finish(),
      ).toThrow(
        'Game cannot be finished from state "setup".',
      );
    });

    it('should reject finishing an already finished game', () => {
      const player = createPlayer();

      const game = startGame(
        createGame().addPlayer(
          player,
        ),
      ).finish();

      expect(() =>
        game.finish(),
      ).toThrow(
        'Game cannot be finished from state "finished".',
      );
    });
  });

  describe('killPlayer', () => {
    it('should kill a player immutably', () => {
      const player = createPlayer();

      const game = startGame(
        createGame().addPlayer(
          player,
        ),
      );

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
      const firstPlayer =
        createPlayer({
          id: 'player-1',
          userId: 'user-1',
          seatNumber: 1,
        });

      const secondPlayer =
        createPlayer({
          id: 'player-2',
          userId: 'user-2',
          displayName: 'Bob',
          seatNumber: 2,
        });

      const game = startGame(
        createGame()
          .addPlayer(firstPlayer)
          .addPlayer(secondPlayer),
      );

      const secondPlayerBefore =
        game.getPlayerById(
          secondPlayer.id,
        );

      const updatedGame =
        game.killPlayer(
          firstPlayer.id,
        );

      expect(
        updatedGame.getPlayerById(
          secondPlayer.id,
        ),
      ).toBe(secondPlayerBefore);
    });

    it('should reject a missing player', () => {
      const player = createPlayer();

      const game = startGame(
        createGame().addPlayer(
          player,
        ),
      );

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

      const game = startGame(
        createGame().addPlayer(
          player,
        ),
      ).killPlayer(player.id);

      expect(() =>
        game.killPlayer(player.id),
      ).toThrow(
        `Game player "${player.id}" is already dead.`,
      );
    });

    it('should reject killing a player during setup', () => {
      const player = createPlayer();

      const game =
        createGame().addPlayer(
          player,
        );

      expect(() =>
        game.killPlayer(player.id),
      ).toThrow(
        'Players can only be killed while the game is in progress.',
      );
    });

    it('should reject killing a player after the game has finished', () => {
      const player = createPlayer();

      const game = startGame(
        createGame().addPlayer(
          player,
        ),
      ).finish();

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

      const game = startGame(
        createGame().addPlayer(
          player,
        ),
      ).killPlayer(player.id);

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

      const game = startGame(
        createGame().addPlayer(
          player,
        ),
      );

      expect(() =>
        game.revivePlayer(player.id),
      ).toThrow(
        `Game player "${player.id}" is already alive.`,
      );
    });

    it('should reject reviving a player during setup', () => {
      const player = createPlayer();

      const game =
        createGame().addPlayer(
          player,
        );

      expect(() =>
        game.revivePlayer(player.id),
      ).toThrow(
        'Players can only be revived while the game is in progress.',
      );
    });

    it('should reject reviving a player after the game has finished', () => {
      const player = createPlayer();

      const game = startGame(
        createGame().addPlayer(
          player,
        ),
      )
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

      const game = startGame(
        createGame().addPlayer(
          player,
        ),
      ).killPlayer(player.id);

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

      const game = startGame(
        createGame().addPlayer(
          player,
        ),
      );

      expect(() =>
        game.useGhostVote(player.id),
      ).toThrow(
        'Living players do not use ghost votes.',
      );
    });

    it('should reject using a ghost vote twice', () => {
      const player = createPlayer();

      const game = startGame(
        createGame().addPlayer(
          player,
        ),
      )
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

      const game =
        createGame().addPlayer(
          player,
        );

      expect(() =>
        game.useGhostVote(player.id),
      ).toThrow(
        'Ghost votes can only be used while the game is in progress.',
      );
    });

    it('should reject using a ghost vote after the game has finished', () => {
      const player = createPlayer();

      const game = startGame(
        createGame().addPlayer(
          player,
        ),
      )
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
      const livingPlayer =
        createPlayer({
          id: 'player-1',
          userId: 'user-1',
          displayName: 'Alice',
          seatNumber: 1,
        });

      const deadPlayer =
        createPlayer({
          id: 'player-2',
          userId: 'user-2',
          displayName: 'Bob',
          seatNumber: 2,
        });

      const game = startGame(
        createGame()
          .addPlayer(livingPlayer)
          .addPlayer(deadPlayer),
      ).killPlayer(deadPlayer.id);

      expect(
        game.getLivingPlayers().map(
          (player) => player.id,
        ),
      ).toEqual([livingPlayer.id]);

      expect(
        game.getDeadPlayers().map(
          (player) => player.id,
        ),
      ).toEqual([deadPlayer.id]);
    });
  });
});