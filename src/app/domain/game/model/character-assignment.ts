import { CharacterId } from '../../characters/model/character-id';

export interface CharacterAssignment {
  readonly playerId: string;
  readonly characterId: CharacterId;
}