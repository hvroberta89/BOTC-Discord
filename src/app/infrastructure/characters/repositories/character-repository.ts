import { Character } from "../../../domain/characters/model/character";
import { CharacterId } from "../../../domain/characters/model/character-id";

export interface CharacterRepository {
  findById(
    characterId: CharacterId,
  ): Promise<Character | undefined>;

  findAll(): Promise<
    readonly Character[]
  >;
}