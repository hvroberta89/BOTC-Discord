import { CharacterAssignment } from '../../../domain/game/model/character-assignment';
import { Game } from '../../../domain/game/model/game';
import { CharacterRepository } from '../../../infrastructure/characters/repositories/character-repository';

export class AssignCharactersToGameService {
  public constructor(
    private readonly characterRepository:
      CharacterRepository,
  ) {}

  public async execute(
    game: Game,
    assignments:
      readonly CharacterAssignment[],
  ): Promise<Game> {
    await this.assertCharactersExist(
      assignments,
    );

    return game.assignCharacters(
      assignments,
    );
  }

  private async assertCharactersExist(
    assignments:
      readonly CharacterAssignment[],
  ): Promise<void> {
    const uniqueCharacterIds =
      new Map(
        assignments.map(
          (assignment) => [
            assignment.characterId.value,
            assignment.characterId,
          ],
        ),
      );

    for (
      const characterId
      of uniqueCharacterIds.values()
    ) {
      const character =
        await this.characterRepository.findById(
          characterId,
        );

      if (!character) {
        throw new Error(
          `Character with ID "${characterId.value}" was not found.`,
        );
      }
    }
  }
}