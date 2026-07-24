import { CharacterId } from './character-id';

describe('CharacterId', () => {
  describe('create', () => {
    it('should create a character ID', () => {
      const characterId =
        CharacterId.create('imp');

      expect(characterId.value).toBe(
        'imp',
      );
    });

    it('should trim the value', () => {
      const characterId =
        CharacterId.create(
          '  imp  ',
        );

      expect(characterId.value).toBe(
        'imp',
      );
    });

    it.each(['', '   '])(
      'should reject an empty value',
      (value) => {
        expect(() =>
          CharacterId.create(value),
        ).toThrow(
          'Character ID cannot be empty.',
        );
      },
    );
  });

  describe('equals', () => {
    it('should return true for equal character IDs', () => {
      const firstCharacterId =
        CharacterId.create('imp');

      const secondCharacterId =
        CharacterId.create('imp');

      expect(
        firstCharacterId.equals(
          secondCharacterId,
        ),
      ).toBe(true);
    });

    it('should return false for different character IDs', () => {
      const firstCharacterId =
        CharacterId.create('imp');

      const secondCharacterId =
        CharacterId.create(
          'washerwoman',
        );

      expect(
        firstCharacterId.equals(
          secondCharacterId,
        ),
      ).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return the character ID value', () => {
      const characterId =
        CharacterId.create('imp');

      expect(
        characterId.toString(),
      ).toBe('imp');
    });
  });
});