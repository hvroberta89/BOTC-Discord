import { CharacterId } from '../../characters/model/character-id';
import { ScriptId } from './script-id';

export interface CreateScriptParams {
  readonly id: ScriptId;
  readonly name: string;
  readonly characterIds:
    readonly CharacterId[];
}

export class Script {
  private constructor(
    public readonly id: ScriptId,
    public readonly name: string,
    private readonly characterIdsValue:
      readonly CharacterId[],
  ) {}

  public static create(
    params: CreateScriptParams,
  ): Script {
    const name =
      Script.normalizeRequiredText(
        params.name,
        'Script name cannot be empty.',
      );

    if (
      params.characterIds.length === 0
    ) {
      throw new Error(
        'Script requires at least one character.',
      );
    }

    Script.assertUniqueCharacterIds(
      params.characterIds,
    );

    return new Script(
      params.id,
      name,
      [...params.characterIds],
    );
  }

  public get characterIds():
    readonly CharacterId[] {
    return [
      ...this.characterIdsValue,
    ];
  }

  public containsCharacter(
    characterId: CharacterId,
  ): boolean {
    return this.characterIdsValue.some(
      (existingCharacterId) =>
        existingCharacterId.equals(
          characterId,
        ),
    );
  }

  public equals(
    other: Script,
  ): boolean {
    return this.id.equals(other.id);
  }

  private static assertUniqueCharacterIds(
    characterIds:
      readonly CharacterId[],
  ): void {
    const values =
      new Set<string>();

    for (
      const characterId
      of characterIds
    ) {
      if (
        values.has(characterId.value)
      ) {
        throw new Error(
          `Character "${characterId.value}" appears multiple times in the script.`,
        );
      }

      values.add(characterId.value);
    }
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