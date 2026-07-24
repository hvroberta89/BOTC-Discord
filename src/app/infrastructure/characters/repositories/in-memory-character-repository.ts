import { Character } from '../../../domain/characters/model/character';
import { CharacterId } from '../../../domain/characters/model/character-id';
import { CharacterRepository } from './character-repository';


export class InMemoryCharacterRepository
  implements CharacterRepository
{
  private readonly characters:
    readonly Character[];

  public constructor(
    characters:
      readonly Character[] = [],
  ) {
    this.assertUniqueCharacterIds(
      characters,
    );

    this.characters = [
      ...characters,
    ];
  }

  public async findById(
    characterId: CharacterId,
  ): Promise<Character | undefined> {
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

  private assertUniqueCharacterIds(
    characters:
      readonly Character[],
  ): void {
    const characterIds =
      new Set<string>();

    for (const character of characters) {
      const characterId =
        character.id.value;

      if (
        characterIds.has(
          characterId,
        )
      ) {
        throw new Error(
          `Character with ID "${characterId}" already exists in the repository.`,
        );
      }

      characterIds.add(
        characterId,
      );
    }
  }
}