import { Character } from '../../../domain/characters/model/character';
import { CharacterId } from '../../../domain/characters/model/character-id';
import { InMemoryCharacterRepository } from './in-memory-character-repository';

describe(
  'InMemoryCharacterRepository',
  () => {
    function createCharacter(
      overrides: Partial<{
        id: string;
        name: string;
      }> = {},
    ): Character {
      return Character.create({
        id: CharacterId.create(
          overrides.id ?? 'imp',
        ),
        name:
          overrides.name ?? 'Imp',
        type: 'demon',
        alignment: 'evil',
        abilityText:
          'Each night, choose a player: they die.',
      });
    }

    describe('constructor', () => {
      it('should create an empty repository', async () => {
        const repository =
          new InMemoryCharacterRepository();

        await expect(
          repository.findAll(),
        ).resolves.toEqual([]);
      });

      it('should initialize the repository with characters', async () => {
        const imp =
          createCharacter();

        const repository =
          new InMemoryCharacterRepository(
            [imp],
          );

        await expect(
          repository.findAll(),
        ).resolves.toEqual([
          imp,
        ]);
      });

      it('should reject duplicate character IDs', () => {
        const firstImp =
          createCharacter({
            id: 'imp',
            name: 'Imp',
          });

        const secondImp =
          createCharacter({
            id: 'imp',
            name: 'Another Imp',
          });

        expect(
          () =>
            new InMemoryCharacterRepository(
              [
                firstImp,
                secondImp,
              ],
            ),
        ).toThrow(
          'Character with ID "imp" already exists in the repository.',
        );
      });
    });

    describe('findById', () => {
      it('should return a character by ID', async () => {
        const imp =
          createCharacter({
            id: 'imp',
            name: 'Imp',
          });

        const poisoner =
          Character.create({
            id: CharacterId.create(
              'poisoner',
            ),
            name: 'Poisoner',
            type: 'minion',
            alignment: 'evil',
            abilityText:
              'Each night, choose a player: they are poisoned tonight and tomorrow day.',
          });

        const repository =
          new InMemoryCharacterRepository(
            [imp, poisoner],
          );

        const result =
          await repository.findById(
            CharacterId.create(
              'poisoner',
            ),
          );

        expect(result).toBe(
          poisoner,
        );
      });

      it('should return undefined for an unknown character ID', async () => {
        const repository =
          new InMemoryCharacterRepository(
            [createCharacter()],
          );

        const result =
          await repository.findById(
            CharacterId.create(
              'unknown',
            ),
          );

        expect(result).toBeUndefined();
      });
    });

    describe('findAll', () => {
      it('should return all characters', async () => {
        const imp =
          createCharacter({
            id: 'imp',
            name: 'Imp',
          });

        const poisoner =
          Character.create({
            id: CharacterId.create(
              'poisoner',
            ),
            name: 'Poisoner',
            type: 'minion',
            alignment: 'evil',
            abilityText:
              'Each night, choose a player: they are poisoned tonight and tomorrow day.',
          });

        const repository =
          new InMemoryCharacterRepository(
            [imp, poisoner],
          );

        const result =
          await repository.findAll();

        expect(result).toEqual([
          imp,
          poisoner,
        ]);
      });

      it('should expose a defensive array', async () => {
        const imp =
          createCharacter();

        const repository =
          new InMemoryCharacterRepository(
            [imp],
          );

        const characters =
          (await repository.findAll()) as Character[];

        characters.length = 0;

        await expect(
          repository.findAll(),
        ).resolves.toEqual([
          imp,
        ]);
      });
    });
  },
);