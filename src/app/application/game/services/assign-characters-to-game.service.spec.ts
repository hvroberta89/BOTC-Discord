import { Character } from '../../../domain/characters/model/character';
import { CharacterId } from '../../../domain/characters/model/character-id';
import { CharacterAssignment } from '../../../domain/game/model/character-assignment';
import { Game } from '../../../domain/game/model/game';
import { GamePlayer } from '../../../domain/game/model/game-player';
import { ScriptId } from '../../../domain/scripts/model/script-id';
import { CharacterRepository } from '../../../infrastructure/characters/repositories/character-repository';
import { AssignCharactersToGameService } from './assign-characters-to-game.service';

class FakeCharacterRepository
  implements CharacterRepository
{
  public findByIdCallCount = 0;

  public readonly requestedCharacterIds:
    CharacterId[] = [];

  public constructor(
    private readonly characters:
      readonly Character[] = [],
  ) {}

  public async findById(
    characterId: CharacterId,
  ): Promise<Character | undefined> {
    this.findByIdCallCount++;

    this.requestedCharacterIds.push(
      characterId,
    );

    return this.characters.find(
      (character) =>
        character.id.equals(
          characterId,
        ),
    );
  }

  public async findAll(): Promise<
    readonly Character[]
  > {
    return [...this.characters];
  }
}

describe(
  'AssignCharactersToGameService',
  () => {
    function createCharacter(
      id: string,
      name: string,
    ): Character {
      const isEvil =
        id === 'imp' ||
        id === 'poisoner';

      return Character.create({
        id: CharacterId.create(id),
        name,
        type:
          id === 'imp'
            ? 'demon'
            : id === 'poisoner'
              ? 'minion'
              : 'townsfolk',
        alignment: isEvil
          ? 'evil'
          : 'good',
        abilityText:
          `${name} ability.`,
      });
    }

    function createPlayer(
      params: {
        readonly id: string;
        readonly userId: string;
        readonly displayName: string;
        readonly seatNumber: number;
      },
    ): GamePlayer {
      return GamePlayer.create({
        id: params.id,
        userId: params.userId,
        displayName:
          params.displayName,
        seatNumber:
          params.seatNumber,
      });
    }

    function createGame(): Game {
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

      return Game.create({
        id: 'game-1',
        lobbyId: 'lobby-1',
        storytellerId: 'storyteller-1',
        scriptId: ScriptId.create('trouble-brewing'),
      })
        .addPlayer(firstPlayer)
        .addPlayer(secondPlayer);
    }

    function createAssignments():
      readonly CharacterAssignment[] {
      return [
        {
          playerId: 'player-1',
          characterId:
            CharacterId.create(
              'washerwoman',
            ),
        },
        {
          playerId: 'player-2',
          characterId:
            CharacterId.create(
              'imp',
            ),
        },
      ];
    }

    function createRepositoryWithDefaultCharacters():
      FakeCharacterRepository {
      return new FakeCharacterRepository(
        [
          createCharacter(
            'washerwoman',
            'Washerwoman',
          ),
          createCharacter(
            'imp',
            'Imp',
          ),
        ],
      );
    }

    it('should assign existing characters to every player', async () => {
      const repository =
        createRepositoryWithDefaultCharacters();

      const service =
        new AssignCharactersToGameService(
          repository,
        );

      const updatedGame =
        await service.execute(
          createGame(),
          createAssignments(),
        );

      expect(
        updatedGame.getPlayerById(
          'player-1',
        )?.characterId?.value,
      ).toBe('washerwoman');

      expect(
        updatedGame.getPlayerById(
          'player-2',
        )?.characterId?.value,
      ).toBe('imp');
    });

    it('should assign characters immutably', async () => {
      const repository =
        createRepositoryWithDefaultCharacters();

      const service =
        new AssignCharactersToGameService(
          repository,
        );

      const game = createGame();

      const updatedGame =
        await service.execute(
          game,
          createAssignments(),
        );

      expect(
        game.getPlayerById(
          'player-1',
        )?.characterId,
      ).toBeNull();

      expect(
        game.getPlayerById(
          'player-2',
        )?.characterId,
      ).toBeNull();

      expect(updatedGame).not.toBe(
        game,
      );
    });

    it('should reject an unknown character', async () => {
      const repository =
        new FakeCharacterRepository([
          createCharacter(
            'washerwoman',
            'Washerwoman',
          ),
        ]);

      const service =
        new AssignCharactersToGameService(
          repository,
        );

      await expect(
        service.execute(
          createGame(),
          createAssignments(),
        ),
      ).rejects.toThrow(
        'Character with ID "imp" was not found.',
      );
    });

    it('should leave the game unchanged when a character does not exist', async () => {
      const repository =
        new FakeCharacterRepository([
          createCharacter(
            'washerwoman',
            'Washerwoman',
          ),
        ]);

      const service =
        new AssignCharactersToGameService(
          repository,
        );

      const game = createGame();

      await expect(
        service.execute(
          game,
          createAssignments(),
        ),
      ).rejects.toThrow(
        'Character with ID "imp" was not found.',
      );

      expect(
        game.getPlayerById(
          'player-1',
        )?.characterId,
      ).toBeNull();

      expect(
        game.getPlayerById(
          'player-2',
        )?.characterId,
      ).toBeNull();
    });

    it('should preserve Game aggregate validation', async () => {
      const imp =
        createCharacter(
          'imp',
          'Imp',
        );

      const repository =
        new FakeCharacterRepository([
          imp,
        ]);

      const service =
        new AssignCharactersToGameService(
          repository,
        );

      const assignments:
        readonly CharacterAssignment[] =
        [
          {
            playerId:
              'player-1',
            characterId:
              CharacterId.create(
                'imp',
              ),
          },
          {
            playerId:
              'player-2',
            characterId:
              CharacterId.create(
                'imp',
              ),
          },
        ];

      await expect(
        service.execute(
          createGame(),
          assignments,
        ),
      ).rejects.toThrow(
        'Character "imp" was assigned to multiple game players.',
      );
    });

    it('should reject assignments after the game has started', async () => {
      const repository =
        createRepositoryWithDefaultCharacters();

      const service =
        new AssignCharactersToGameService(
          repository,
        );

      const startedGame =
        (
          await service.execute(
            createGame(),
            createAssignments(),
          )
        ).start();

      await expect(
        service.execute(
          startedGame,
          createAssignments(),
        ),
      ).rejects.toThrow(
        'Characters can only be assigned while the game is in setup.',
      );
    });

    it('should reject assignments after the game has finished', async () => {
      const repository =
        createRepositoryWithDefaultCharacters();

      const service =
        new AssignCharactersToGameService(
          repository,
        );

      const finishedGame =
        (
          await service.execute(
            createGame(),
            createAssignments(),
          )
        )
          .start()
          .finish();

      await expect(
        service.execute(
          finishedGame,
          createAssignments(),
        ),
      ).rejects.toThrow(
        'Characters can only be assigned while the game is in setup.',
      );
    });

    it('should return the same game when identical assignments are applied again', async () => {
      const repository =
        createRepositoryWithDefaultCharacters();

      const service =
        new AssignCharactersToGameService(
          repository,
        );

      const game =
        await service.execute(
          createGame(),
          createAssignments(),
        );

      const updatedGame =
        await service.execute(
          game,
          createAssignments(),
        );

      expect(updatedGame).toBe(game);
    });

    it('should query every unique character ID', async () => {
      const repository =
        createRepositoryWithDefaultCharacters();

      const service =
        new AssignCharactersToGameService(
          repository,
        );

      await service.execute(
        createGame(),
        createAssignments(),
      );

      expect(
        repository.findByIdCallCount,
      ).toBe(2);

      expect(
        repository.requestedCharacterIds.map(
          (characterId) =>
            characterId.value,
        ),
      ).toEqual([
        'washerwoman',
        'imp',
      ]);
    });

    it('should not query the same character ID more than once', async () => {
      const imp =
        createCharacter(
          'imp',
          'Imp',
        );

      const repository =
        new FakeCharacterRepository([
          imp,
        ]);

      const service =
        new AssignCharactersToGameService(
          repository,
        );

      const assignments:
        readonly CharacterAssignment[] =
        [
          {
            playerId:
              'player-1',
            characterId:
              CharacterId.create(
                'imp',
              ),
          },
          {
            playerId:
              'player-2',
            characterId:
              CharacterId.create(
                'imp',
              ),
          },
        ];

      await expect(
        service.execute(
          createGame(),
          assignments,
        ),
      ).rejects.toThrow(
        'Character "imp" was assigned to multiple game players.',
      );

      expect(
        repository.findByIdCallCount,
      ).toBe(1);

      expect(
        repository.requestedCharacterIds.map(
          (characterId) =>
            characterId.value,
        ),
      ).toEqual(['imp']);
    });

    it('should stop validating after the first missing character', async () => {
      const repository =
        new FakeCharacterRepository([
          createCharacter(
            'washerwoman',
            'Washerwoman',
          ),
        ]);

      const service =
        new AssignCharactersToGameService(
          repository,
        );

      const assignments:
        readonly CharacterAssignment[] =
        [
          {
            playerId:
              'player-1',
            characterId:
              CharacterId.create(
                'unknown',
              ),
          },
          {
            playerId:
              'player-2',
            characterId:
              CharacterId.create(
                'imp',
              ),
          },
        ];

      await expect(
        service.execute(
          createGame(),
          assignments,
        ),
      ).rejects.toThrow(
        'Character with ID "unknown" was not found.',
      );

      expect(
        repository.findByIdCallCount,
      ).toBe(1);

      expect(
        repository.requestedCharacterIds[0]
          .value,
      ).toBe('unknown');
    });

    it('should preserve validation for incomplete assignments', async () => {
      const repository =
        createRepositoryWithDefaultCharacters();

      const service =
        new AssignCharactersToGameService(
          repository,
        );

      const assignments:
        readonly CharacterAssignment[] =
        [
          {
            playerId:
              'player-1',
            characterId:
              CharacterId.create(
                'washerwoman',
              ),
          },
        ];

      await expect(
        service.execute(
          createGame(),
          assignments,
        ),
      ).rejects.toThrow(
        'Every game player must receive exactly one character.',
      );
    });

    it('should preserve validation for an unknown player', async () => {
      const repository =
        createRepositoryWithDefaultCharacters();

      const service =
        new AssignCharactersToGameService(
          repository,
        );

      const assignments:
        readonly CharacterAssignment[] =
        [
          {
            playerId:
              'player-1',
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
        ];

      await expect(
        service.execute(
          createGame(),
          assignments,
        ),
      ).rejects.toThrow(
        'Game player "player-2" has no character assignment.',
      );
    });
  },
);