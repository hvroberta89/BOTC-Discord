import { Character } from './character';
import { CharacterId } from './character-id';

describe('Character', () => {
  describe('create', () => {
    it('should create a character', () => {
      const id =
        CharacterId.create('imp');

      const character =
        Character.create({
          id,
          name: 'Imp',
          type: 'demon',
          alignment: 'evil',
          abilityText:
            'Each night, choose a player: they die.',
        });

      expect(character.id).toBe(id);
      expect(character.name).toBe(
        'Imp',
      );
      expect(character.type).toBe(
        'demon',
      );
      expect(
        character.alignment,
      ).toBe('evil');
      expect(
        character.abilityText,
      ).toBe(
        'Each night, choose a player: they die.',
      );
    });

    it('should trim the name and ability text', () => {
      const character =
        Character.create({
          id: CharacterId.create(
            'washerwoman',
          ),
          name: '  Washerwoman  ',
          type: 'townsfolk',
          alignment: 'good',
          abilityText:
            '  You start knowing that 1 of 2 players is a particular Townsfolk.  ',
        });

      expect(character.name).toBe(
        'Washerwoman',
      );

      expect(
        character.abilityText,
      ).toBe(
        'You start knowing that 1 of 2 players is a particular Townsfolk.',
      );
    });

    it.each(['', '   '])(
      'should reject an empty character name',
      (name) => {
        expect(() =>
          Character.create({
            id: CharacterId.create(
              'imp',
            ),
            name,
            type: 'demon',
            alignment: 'evil',
            abilityText:
              'Each night, choose a player: they die.',
          }),
        ).toThrow(
          'Character name cannot be empty.',
        );
      },
    );

    it.each(['', '   '])(
      'should reject an empty ability text',
      (abilityText) => {
        expect(() =>
          Character.create({
            id: CharacterId.create(
              'imp',
            ),
            name: 'Imp',
            type: 'demon',
            alignment: 'evil',
            abilityText,
          }),
        ).toThrow(
          'Character ability text cannot be empty.',
        );
      },
    );
  });

  describe('equals', () => {
    it('should return true for characters with the same ID', () => {
      const firstCharacter =
        Character.create({
          id: CharacterId.create(
            'imp',
          ),
          name: 'Imp',
          type: 'demon',
          alignment: 'evil',
          abilityText:
            'First ability text.',
        });

      const secondCharacter =
        Character.create({
          id: CharacterId.create(
            'imp',
          ),
          name: 'Different name',
          type: 'demon',
          alignment: 'evil',
          abilityText:
            'Different ability text.',
        });

      expect(
        firstCharacter.equals(
          secondCharacter,
        ),
      ).toBe(true);
    });

    it('should return false for characters with different IDs', () => {
      const imp =
        Character.create({
          id: CharacterId.create(
            'imp',
          ),
          name: 'Imp',
          type: 'demon',
          alignment: 'evil',
          abilityText:
            'Imp ability.',
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
            'Poisoner ability.',
        });

      expect(
        imp.equals(poisoner),
      ).toBe(false);
    });
  });
});