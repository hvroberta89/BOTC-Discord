import { CharacterAlignment } from './character-alignment';
import { CharacterId } from './character-id';
import { CharacterType } from './character-type';

export interface CreateCharacterParams {
  readonly id: CharacterId;
  readonly name: string;
  readonly type: CharacterType;
  readonly alignment: CharacterAlignment;
  readonly abilityText: string;
}

export class Character {
  private constructor(
    public readonly id: CharacterId,
    public readonly name: string,
    public readonly type: CharacterType,
    public readonly alignment:
      CharacterAlignment,
    public readonly abilityText: string,
  ) {}

  public static create(
    params: CreateCharacterParams,
  ): Character {
    if (!(params.id instanceof CharacterId)) {
      throw new Error(
        'Character ID is required.',
      );
    }

    const name =
      Character.normalizeRequiredText(
        params.name,
        'Character name cannot be empty.',
      );

    const abilityText =
      Character.normalizeRequiredText(
        params.abilityText,
        'Character ability text cannot be empty.',
      );

    return new Character(
      params.id,
      name,
      params.type,
      params.alignment,
      abilityText,
    );
  }

  public equals(
    other: Character,
  ): boolean {
    return this.id.equals(other.id);
  }

  private static normalizeRequiredText(
    value: string,
    errorMessage: string,
  ): string {
    const normalizedValue =
      value.trim();

    if (!normalizedValue) {
      throw new Error(errorMessage);
    }

    return normalizedValue;
  }
}